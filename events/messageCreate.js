import { Events } from 'discord.js';
import { checkAutoReply } from '../utils/autoReply.js';
import { askAI } from '../utils/ai.js';
import { enhancePrompt } from '../utils/promptEnhancer.js';
import { isWhitelisted, isOwner } from '../utils/whitelist.js';
import config from '../config.json' with { type: 'json' };

function truncate(str, max = 1990) {
  if (typeof str === 'string' && str.length > max) {
    return str.substring(0, max - 3) + '...';
  }
  return str;
}

async function safeReply(message, content) {
  try {
    await message.reply(content);
  } catch (err) {
    if (err.code === 50035) {
      // Original message deleted — send to channel instead
      try {
        await message.channel.send(content);
      } catch (_) {}
    } else {
      console.error('Reply error:', err.message);
    }
  }
}

export default {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    const isMentioned = message.mentions.users.has(message.client.user.id);
    const isDM = message.guild === null;

    if (!isDM && !isMentioned) return;

    if (!isWhitelisted(message.author.id) && !isOwner(message.author.id, config.ownerId)) {
      if (isDM) {
        await safeReply(message, "You are not whitelisted to use the AI assistant.");
      }
      return;
    }

    // Auto-reply system (after whitelist check)
    const autoReply = checkAutoReply(message.content);
    if (autoReply) {
      await safeReply(message, autoReply);
      return;
    }

    // Only strip the bot's own mention, keep all others
    let userMessage = message.content;
    if (isMentioned) {
      const botMention = new RegExp(`<@!?${message.client.user.id}>`, 'g');
      userMessage = userMessage.replace(botMention, '').trim();
    }

    if (!userMessage) {
      userMessage = "Hello!";
    }

    const context = isDM ? null : { channel: message.channel, member: message.member, guild: message.guild, userId: message.author.id };

    // Fast path: direct intent parsing for common commands
    if (context && isOwner(message.author.id, config.ownerId)) {
      const { parseAndExecute } = await import('../utils/moderation.js');
      const result = await parseAndExecute(userMessage, context);
      if (result) {
        await safeReply(message, truncate(result));
        return;
      }
    }

    // AI handles everything else (actions via JSON, or normal chat)
    try {
      await message.channel.sendTyping();
    } catch (_) {}
    const enhanced = enhancePrompt(userMessage);
    try {
      const reply = await askAI(
        message.author.id,
        message.author.displayName,
        userMessage,
        message.channel.name || 'DM',
        context,
        enhanced
      );

      if (reply) {
        await safeReply(message, truncate(reply));
      }
    } catch (err) {
      console.error('AI handler error:', err);
      await safeReply(message, 'Sorry, something went wrong processing your request.');
    }
  },
};
