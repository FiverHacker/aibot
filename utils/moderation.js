import { ChannelType, EmbedBuilder, PermissionsBitField } from 'discord.js';
import config from '../config.json' with { type: 'json' };

const ownerId = config.ownerId;

function isOwner(userId) {
  return userId === ownerId;
}

export function normalizeText(text) {
  return text
    .replace(/\bsen\b/gi, 'send')
    .replace(/\bmassage\b/gi, 'message')
    .replace(/\bmasseg\b/gi, 'message')
    .replace(/\breplay\b/gi, 'reply')
    .replace(/\bsa\b/gi, 'say')
    .replace(/\bmassege\b/gi, 'message')
    .replace(/\bdelet\b/gi, 'delete')
    .replace(/\bdel\b/gi, 'delete')
    .replace(/\bmasage\b/gi, 'message')
    .replace(/\bchanne\b/gi, 'channel')
    .replace(/\bchanel\b/gi, 'channel')
    .replace(/\bchannel\s+l\b/gi, 'channel')
    .replace(/\bmsg\b/gi, 'message')
    .replace(/\bmsg's\b/gi, 'messages')
    .replace(/\bmsgs\b/gi, 'messages')
    .replace(/\bpls\b/gi, 'please')
    .replace(/\bplez\b/gi, 'please')
    .replace(/\bu\b/gi, 'you')
    .replace(/\br\b/gi, 'are')
    .replace(/\bthx\b/gi, 'thanks')
    .replace(/\bty\b/gi, 'thank you')
    .replace(/\bwyd\b/gi, 'what are you doing')
    .replace(/\bidk\b/gi, 'i do not know')
    .replace(/\blol\b/gi, 'haha')
    .replace(/\blmao\b/gi, 'haha')
    .replace(/\bbruh\b/gi, 'bro')
    .replace(/\bdm\b/gi, 'direct message')
    .replace(/\bplz\b/gi, 'please')
    .replace(/\bgive\s+\<@/gi, 'give role to <@')
    .replace(/\btold\b/gi, 'tell')
    .replace(/\bjini\b/gi, 'joined')
    .replace(/\bjoin\b/gi, 'joined')
    .replace(/\bsuer\b/gi, 'user')
    .replace(/\bwhem\b/gi, 'when')
    .replace(/\bwhne\b/gi, 'when')
    .replace(/\bwhn\b/gi, 'when')
    .replace(/\babot\b/gi, 'about')
    .replace(/\babt\b/gi, 'about')
    .replace(/\bwelcom\b/gi, 'welcome')
    .replace(/\bcreat\b/gi, 'create')
    .replace(/\bcrat\b/gi, 'create')
    .replace(/\bcretae\b/gi, 'create')
    .replace(/\brooles?\b/gi, 'roles')
    .replace(/\broll\b/gi, 'role')
    .replace(/\binvite\b/gi, 'invited')
    .replace(/\binv\b/gi, 'invite')
    .replace(/\bwhice\b/gi, 'which')
    .replace(/\bwich\b/gi, 'which')
    .replace(/\bwher\b/gi, 'where')
    .replace(/\bwhr\b/gi, 'where')
    .replace(/\bwhos\b/gi, 'who is')
    .replace(/\bwho's\b/gi, 'who is')
    .replace(/\bwhom\b/gi, 'who')
    .replace(/\bcan\s+u\b/gi, 'can you')
    .replace(/\bcan\s+ya\b/gi, 'can you')
    .replace(/\bdont\b/gi, 'do not')
    .replace(/\bdoesnt\b/gi, 'does not')
    .replace(/\bisnt\b/gi, 'is not')
    .replace(/\bcant\b/gi, 'cannot')
    .replace(/\bwont\b/gi, 'will not')
    .replace(/\bgonna\b/gi, 'going to')
    .replace(/\bwanna\b/gi, 'want to')
    .replace(/\bgimme\b/gi, 'give me')
    .replace(/\blet me\b/gi, 'let me')
    .replace(/\btho\b/gi, 'though')
    .replace(/\bmamber\b/gi, 'member')
    .replace(/\bmembr\b/gi, 'member')
    .replace(/\bppl\b/gi, 'people')
    .replace(/\bany1\b/gi, 'anyone')
    .replace(/\bevery1\b/gi, 'everyone')
    .replace(/\bsome1\b/gi, 'someone')
    .replace(/\bsemelar\b/gi, 'similar')
    .replace(/\bsimilar\b/gi, 'similar')
    .replace(/\bdup(?:licate)?\b/gi, 'duplicate')
    .replace(/\bparmisonas?\b/gi, 'permissions')
    .replace(/\bpermis\b/gi, 'permissions')
    .replace(/\bperm\b/gi, 'permission')
    .replace(/\bparm\b/gi, 'permission')
    .replace(/\baor\b/gi, 'or')
    .trim();
}

function extractUserId(mention) {
  const m = mention.match(/<@!?(\d+)>/);
  return m ? m[1] : mention;
}

function extractChannelId(mention) {
  const m = mention.match(/<#!?(\d+)>/);
  return m ? m[1] : mention;
}

function getFirstMention(text) {
  const m = text.match(/<@!?\d+>/);
  return m ? m[0] : null;
}

const INTENT_PATTERNS = [
  // ---- Send message / reply to a user ----
  {
    pattern: /(?:send|tell|say|reply|respond|shout)\s+(.+?)\s+(?:to|in|for)\s+(<@!?\d+>)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const content = match[1].trim();
      const userId = extractUserId(match[2]);
      return await sendToUser(content, userId, context);
    },
  },
  {
    pattern: /(?:send|tell|say|reply|respond)\s+(<@!?\d+>)\s+(.+)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const userId = extractUserId(match[1]);
      const content = match[2].trim();
      return await sendToUser(content, userId, context);
    },
  },
  {
    pattern: /(?:reply|respond)\s+(?:to\s+)?(<@!?\d+>)\s+(.+)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const userId = extractUserId(match[1]);
      const content = match[2].trim();
      return await sendToUser(content, userId, context);
    },
  },
  // "say [word]" with no mention — say it in current channel
  {
    pattern: /^say\s+(.+)/i,
    async execute(text, context) {
      const match = text.match(/^say\s+(.+)/i);
      if (!match) return null;
      const content = match[1].trim();
      const { channel } = context;
      await channel.send(content);
      return `Done: ${content}`;
    },
  },
  // ---- Send message to a channel ----
  {
    pattern: /(?:send|post|put)\s+(.+?)\s+(?:to|in)\s+(<#!?\d+>)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const content = match[1].trim();
      const channelId = extractChannelId(match[2]);
      return await sendToChannel(content, channelId, context);
    },
  },
  {
    pattern: /(?:send|post|put)\s+(?:a\s+)?(?:message\s+)?(?:to\s+)?(<#!?\d+>)\s+(.+)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const channelId = extractChannelId(match[1]);
      const content = match[2].trim();
      return await sendToChannel(content, channelId, context);
    },
  },
  // ---- Role management ----
  {
    priority: 1,
    pattern: /(?:give|assign|add)\s+(?:the\s+)?(.+?)\s+role\s+(?:to\s+)?(<@!?\d+>)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const roleName = match[1].trim();
      const userId = extractUserId(match[2]);
      return await addRole(roleName, userId, context);
    },
  },
  {
    pattern: /(?:give|assign|add)\s+(?:the\s+)?(.+?)\s+(?:to|for)\s+(<@!?\d+>)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const roleName = match[1].trim();
      const userId = extractUserId(match[2]);
      return await addRole(roleName, userId, context);
    },
  },
  {
    pattern: /(?:give|assign|add)\s+(<@!?\d+>)\s+(?:the\s+)?(.+?)\s+role/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const userId = extractUserId(match[1]);
      const roleName = match[2].trim();
      return await addRole(roleName, userId, context);
    },
  },
  {
    pattern: /(?:remove|take|delete)\s+(?:the\s+)?(.+?)\s+role\s+(?:from\s+)?(<@!?\d+>)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const roleName = match[1].trim();
      const userId = extractUserId(match[2]);
      return await removeRole(roleName, userId, context);
    },
  },
  {
    pattern: /(?:remove|take)\s+(?:the\s+)?(.+?)\s+(?:from|of)\s+(<@!?\d+>)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const roleName = match[1].trim();
      const userId = extractUserId(match[2]);
      return await removeRole(roleName, userId, context);
    },
  },
  // ---- Kick ----
  {
    pattern: /kick\s+(<@!?\d+>)(?:\s+for\s+(.+))?/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const userId = extractUserId(match[1]);
      const reason = match[2]?.trim() || 'No reason provided';
      return await kickUser(userId, reason, context);
    },
  },
  // ---- Ban ----
  {
    pattern: /ban\s+(<@!?\d+>)(?:\s+for\s+(.+))?/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const userId = extractUserId(match[1]);
      const reason = match[2]?.trim() || 'No reason provided';
      return await banUser(userId, reason, context);
    },
  },
  // ---- Unban ----
  {
    pattern: /unban\s+(<@!?\d+>)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const userId = extractUserId(match[1]);
      return await unbanUser(userId, context);
    },
  },
  // ---- Timeout / mute ----
  {
    pattern: /(?:timeout|mute)\s+(<@!?\d+>)\s+(\d+)\s*(?:min(?:ute)?s?|m)?/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const userId = extractUserId(match[1]);
      const minutes = parseInt(match[2]);
      return await timeoutUser(userId, minutes, context);
    },
  },
  {
    pattern: /(?:timeout|mute)\s+(<@!?\d+>)(?:\s+for\s+(\d+)\s*(?:min(?:ute)?s?|m)?)?/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const userId = extractUserId(match[1]);
      const minutes = match[2] ? parseInt(match[2]) : 60;
      return await timeoutUser(userId, minutes, context);
    },
  },
  // ---- Purge / delete messages ----
  {
    pattern: /(?:delete|purge|clear|remove)\s+(?:all\s+)?(?:the\s+)?(?:last\s+)?(\d+)?\s*(?:message|chat|masseg|msg|conversation)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const limit = match[1] ? parseInt(match[1]) : 100;
      return await purgeMessages(limit, context);
    },
  },
  {
    pattern: /(?:delete|purge|clear|remove)\s+(?:all\s+)?(?:the\s+)?(?:last\s+)?(\d+)?$/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const limit = match[1] ? parseInt(match[1]) : 100;
      return await purgeMessages(limit, context);
    },
  },
  // Flexible: "delete all message on channel 100 message"
  {
    pattern: /(?:delete|purge|clear|remove)\b[\s\S]*?(\d+)\s*(?:message|msg|chat)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const limit = parseInt(match[1]);
      return await purgeMessages(limit, context);
    },
  },
  // ---- Create channel ----
  {
    pattern: /create\s+(?:a\s+)?(?:new\s+)?channel\s+(?:called\s+)?(?:named\s+)?(.+)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const name = match[1].trim().toLowerCase().replace(/\s+/g, '-');
      return await createChannel(name, context);
    },
  },
  // ---- Create ch (shorthand) ----
  {
    pattern: /create\s+ch\s+(?:called\s+)?(?:named\s+)?(.+)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const name = match[1].trim().toLowerCase().replace(/\s+/g, '-');
      return await createChannel(name, context);
    },
  },
  // ---- Delete channel ----
  {
    pattern: /delete\s+(?:the\s+)?(?:this\s+)?(?:current\s+)?channel/i,
    async execute(text, context) {
      return await deleteChannel(null, context);
    },
  },
  {
    pattern: /delete\s+(?:the\s+)?channel\s+(<#!?\d+>)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      return await deleteChannel(extractChannelId(match[1]), context);
    },
  },
  // ---- Rename channel ----
  {
    pattern: /rename\s+(?:this\s+)?(?:current\s+)?(?:channel\s+)?(?:to\s+)?(.+)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const name = match[1].trim().toLowerCase().replace(/\s+/g, '-');
      return await renameChannel(name, null, context);
    },
  },
  // ---- Announce ----
  {
    pattern: /announce\s+(.+?)(?:\s*[-–—]\s*|\s*:\s*)(.+)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const title = match[1].trim();
      const message = match[2].trim();
      return await announce(title, message, null, context);
    },
  },
  // ---- Create role ----
  {
    pattern: /create\s+(?:a\s+)?(?:new\s+)?role\s+(?:called\s+)?(?:named\s+)?(.+)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const name = match[1].trim();
      return await createRole(name, context);
    },
  },
  // ---- User info / join date ----
  {
    pattern: /(?:when\s+(?:did|has|was)\s+)?(?:<@!?\d+>)\s*(?:joined|join)\s*(?:the\s+)?(?:server|discord)?/i,
    async execute(text, context) {
      const mention = getFirstMention(text);
      if (!mention) return null;
      const userId = extractUserId(mention);
      return await userJoinedAt(userId, context);
    },
  },
  {
    pattern: /(?:when|what\s+time)\s+(?:did|has|was)\s+(<@!?\d+>)\s+(?:joined|join|come)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const userId = extractUserId(match[1]);
      return await userJoinedAt(userId, context);
    },
  },
  {
    pattern: /(?:tell|show|get)\s+(?:me\s+)?(?:about|info)\s+(?:<@!?\d+>)/i,
    async execute(text, context) {
      const mention = getFirstMention(text);
      if (!mention) return null;
      const userId = extractUserId(mention);
      return await userInfo(userId, context);
    },
  },
  {
    pattern: /(?:tell|show|get)\s+(?:me\s+)?(?:about|info)\s+(?:for|on|of)\s+(<@!?\d+>)/i,
    async execute(text, context) {
      const match = text.match(this.pattern);
      if (!match) return null;
      const userId = extractUserId(match[1]);
      return await userInfo(userId, context);
    },
  },
  // ---- Server info ----
  {
    pattern: /owner\s+(?:of\s+)?(?:this\s+)?(?:server|discord|guild)?/i,
    async execute(text, context) {
      return await serverOwner(context);
    },
  },
  {
    pattern: /(?:who|which)\s+(?:owns|own)\s+(?:this\s+)?(?:server|discord|guild)/i,
    async execute(text, context) {
      return await serverOwner(context);
    },
  },
  {
    pattern: /(?:how\s+many\s+)?(?:member|people|user)s?/i,
    async execute(text, context) {
      return await memberCount(context);
    },
  },
  {
    pattern: /(?:server|guild)\s+(?:info|information|stats|status|about)/i,
    async execute(text, context) {
      return await serverInfo(context);
    },
  },
  {
    pattern: /(?:list|show|get)\s+(?:all\s+)?(?:channel|room)s?/i,
    async execute(text, context) {
      return await listChannels(context);
    },
  },
  {
    pattern: /(?:list|show|get)\s+(?:all\s+)?roles/i,
    async execute(text, context) {
      return await listRoles(context);
    },
  },
  {
    pattern: /(?:who\s+is\s+)?(?:online|active)\s+(?:member|user|people)/i,
    async execute(text, context) {
      return await onlineMembers(context);
    },
  },
  {
    pattern: /(?:who\s+(?:is|are)\s+)?offline\s+(?:member|user|people)/i,
    async execute(text, context) {
      return await offlineMembers(context);
    },
  },
  {
    pattern: /(?:whice|which)\s+(?:member|user|people|mamber)\s+(?:is|are)\s+(?:offline|not\s+online|away)/i,
    async execute(text, context) {
      return await offlineMembers(context);
    },
  },
  // ---- Setup server ----
  {
    pattern: /(?:setup|set\s+up)\s+(?:(?:a\s+|the\s+|my\s+)?(?:full\s+)?(?:server|discord|guild))/i,
    async execute(text, context) {
      return await setupServer(context);
    },
  },
  {
    pattern: /(?:create|make)\s+(?:a\s+|the\s+)?(?:full\s+)?(?:professional\s+)?(?:setup|server\s+setup)/i,
    async execute(text, context) {
      return await setupServer(context);
    },
  },
  // ---- Fix channels/roles ----
  {
    pattern: /fix\s+(?:all\s+)?(?:channel|server|discord|role|rool|setup|system)/i,
    async execute(text, context) {
      return await fixChannelsRoles(context);
    },
  },
  // ---- Show available commands ----
  {
    pattern: /(?:what\s+(?:can|do)\s+you\s+do|show\s+(?:me\s+)?(?:commands?|actions?)|help\s+me|available\s+(?:commands?|actions?)|list\s+(?:commands?|actions?))/i,
    async execute(text, context) {
      return [
        '**Available commands:**',
        '━━━━━━━━━━━━━━━━',
        '**Moderation:**',
        '`purge` / `delete X messages` — Delete messages',
        '`kick @user` — Kick a member',
        '`ban @user` — Ban a user',
        '`unban USER_ID` — Unban a user',
        '`timeout @user 10m` — Timeout a member',
        '',
        '**Channels & Roles:**',
        '`create channel called NAME` — Create a text channel',
        '`delete channel` — Delete current channel',
        '`rename channel NEWNAME` — Rename channel',
        '`give ROLE to @user` / `add ROLE to @user` — Assign a role',
        '`remove ROLE from @user` — Remove a role',
        '`create role NAME` — Create a new role',
        '',
        '**Server Info:**',
        '`who is the owner` / `owner`',
        '`members` / `member count`',
        '`server info`',
        '`list channels`',
        '`list roles`',
        '`online members`',
        '`offline members`',
        '`info @user` / `user info @user`',
        '`when did @user join`',
        '',
        '**Setup:**',
        '`setup server` / `setup my server` — Full server creation',
        '`fix all channels and roles` — Create missing standard items',
        '`delete duplicate roles` — Remove duplicate role names',
        '`fix permissions on channels` — Set read-only/locked permissions',
        '',
        '**General:**',
        '`announce TITLE / MESSAGE` — Send announcement embed',
        '`say MESSAGE` — Speak in current channel',
        '`send MESSAGE to #channel` — Send message to a channel',
        '`message @user TEXT` — DM a user',
      ].join('\n');
    },
  },
  // ---- Delete duplicate roles ----
  {
    pattern: /(?:delete|remove|clean)\s+(?:duplicate|similar|same|extra)\s+(?:role|rool)/i,
    async execute(text, context) {
      return await deleteDuplicateRoles(context);
    },
  },
  // ---- Fix permissions ----
  {
    pattern: /(?:fix|add|set|update)\s+(?:aor\s+)?(?:the\s+)?(?:permission|parmisonas?)\s+(?:all\s+)?(?:channel|role|server)/i,
    async execute(text, context) {
      return await fixChannelPermissions(context);
    },
  },
];

// ---- Action Executors ----

async function sendToUser(content, userId, context) {
  const { channel } = context;
  const mention = `<@${userId}>`;
  await channel.send(`${mention} ${content}`);
  return `Sent message to <@${userId}> in **#${channel.name}**.`;
}

async function sendToChannel(content, channelId, context) {
  const { guild } = context;
  const target = guild.channels.cache.get(channelId);
  if (!target) return 'Channel not found.';
  await target.send(content);
  return `Message sent to **#${target.name}**.`;
}

async function addRole(roleName, userId, context) {
  const { guild } = context;
  const member = await guild.members.fetch(userId);
  const role = guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
  if (!role) return `Role **${roleName}** not found.`;
  await member.roles.add(role);
  return `Added role **${role.name}** to **${member.user.tag}**.`;
}

async function removeRole(roleName, userId, context) {
  const { guild } = context;
  const member = await guild.members.fetch(userId);
  const role = guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
  if (!role) return `Role **${roleName}** not found.`;
  await member.roles.remove(role);
  return `Removed role **${role.name}** from **${member.user.tag}**.`;
}

async function kickUser(userId, reason, context) {
  const { guild } = context;
  const member = await guild.members.fetch(userId);
  await member.kick(reason);
  return `Kicked **${member.user.tag}**.`;
}

async function banUser(userId, reason, context) {
  const { guild } = context;
  await guild.bans.create(userId, { reason });
  return `Banned **${userId}**.`;
}

async function unbanUser(userId, context) {
  const { guild } = context;
  await guild.bans.remove(userId);
  return `Unbanned **${userId}**.`;
}

async function timeoutUser(userId, minutes, context) {
  const { guild } = context;
  const member = await guild.members.fetch(userId);
  const ms = Math.min(minutes, 40320) * 60 * 1000;
  await member.timeout(ms, `Timed out by bot owner`);
  return `Timed out **${member.user.tag}** for ${Math.min(minutes, 40320)} minutes.`;
}

async function purgeMessages(limit, context) {
  const { channel } = context;
  const safeLimit = Math.min(limit, 100);
  const fetched = await channel.messages.fetch({ limit: 100 });
  const toDelete = [...fetched.values()]
    .filter(m => Date.now() - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000)
    .slice(0, safeLimit);
  if (toDelete.length === 0) return 'No messages to delete.';
  await channel.bulkDelete(toDelete, true);
  return `Deleted ${toDelete.length} messages.`;
}

async function createChannel(name, context) {
  const { guild } = context;
  const newChannel = await guild.channels.create({ name, reason: 'Created by bot owner' });
  return `Created channel **#${newChannel.name}**.`;
}

async function deleteChannel(channelId, context) {
  const { channel, guild } = context;
  const target = channelId ? guild.channels.cache.get(channelId) : channel;
  if (!target) return 'Channel not found.';
  await target.delete('Deleted by bot owner');
  return `Deleted channel **#${target.name}**.`;
}

async function renameChannel(name, channelId, context) {
  const { channel, guild } = context;
  const target = channelId ? guild.channels.cache.get(channelId) : channel;
  if (!target) return 'Channel not found.';
  const old = target.name;
  await target.setName(name, 'Renamed by bot owner');
  return `Renamed channel **#${old}** to **#${name}**.`;
}

async function announce(title, message, channelId, context) {
  const { channel, guild } = context;
  const target = channelId ? guild.channels.cache.get(channelId) : channel;
  if (!target) return 'Channel not found.';
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(message)
    .setColor('#FF0000')
    .setTimestamp();
  await target.send({ embeds: [embed] });
  return `Announcement sent to **#${target.name}**.`;
}

async function createRole(name, context) {
  const { guild } = context;
  const newRole = await guild.roles.create({ name, reason: 'Created by bot owner' });
  return `Created role **${newRole.name}**.`;
}

async function userJoinedAt(userId, context) {
  const { guild } = context;
  const member = await guild.members.fetch(userId);
  const joined = member.joinedAt;
  if (!joined) return `Could not find when **${member.user.tag}** joined.`;
  const date = joined.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const time = joined.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const days = Math.floor((Date.now() - joined.getTime()) / 86400000);
  return `**${member.user.tag}** joined on **${date}** at **${time}** (${days} days ago).`;
}

async function userInfo(userId, context) {
  const { guild } = context;
  const member = await guild.members.fetch(userId);
  const user = member.user;

  const joined = member.joinedAt;
  const created = user.createdAt;
  const joinedDate = joined ? joined.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown';
  const createdDate = created.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const roles = member.roles.cache.filter(r => r.name !== '@everyone').map(r => r.name).join(', ') || 'None';

  return [
    `**${user.tag}** (${user.id})`,
    `📅 Account created: ${createdDate}`,
    `📥 Joined server: ${joinedDate}`,
    `👤 Roles: ${roles}`,
    `🤖 Bot: ${user.bot ? 'Yes' : 'No'}`,
  ].join('\n');
}

async function serverOwner(context) {
  const { guild } = context;
  await guild.fetch();
  const owner = await guild.fetchOwner();
  return `The owner of **${guild.name}** is **${owner.user.tag}** (${owner.user.id}).`;
}

async function memberCount(context) {
  const { guild } = context;
  await guild.members.fetch();
  const total = guild.memberCount;
  const online = guild.members.cache.filter(m => m.presence?.status === 'online').size;
  const bots = guild.members.cache.filter(m => m.user.bot).size;
  const humans = total - bots;
  return `**${guild.name}** has **${total}** members (${humans} humans, ${bots} bots). Currently **${online}** online.`;
}

async function serverInfo(context) {
  const { guild } = context;
  await guild.fetch();
  const owner = await guild.fetchOwner();
  const channels = guild.channels.cache.size;
  const roles = guild.roles.cache.size;
  const created = guild.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const boostLevel = guild.premiumTier ? `Level ${guild.premiumTier}` : 'None';
  const boostCount = guild.premiumSubscriptionCount || 0;

  return [
    `**${guild.name}**`,
    `🆔 ID: ${guild.id}`,
    `👑 Owner: **${owner.user.tag}**`,
    `📅 Created: ${created}`,
    `👥 Members: ${guild.memberCount}`,
    `💬 Channels: ${channels}`,
    `🎭 Roles: ${roles}`,
    `🚀 Boosts: ${boostCount} (${boostLevel})`,
  ].join('\n');
}

async function listChannels(context) {
  const { guild } = context;
  const channels = guild.channels.cache
    .filter(c => c.type === 0)
    .sort((a, b) => a.position - b.position)
    .map(c => `#${c.name}`)
    .join(', ');
  return `**Text Channels in ${guild.name}:**\n${channels || 'None'}`;
}

async function listRoles(context) {
  const { guild } = context;
  const roles = guild.roles.cache
    .filter(r => r.name !== '@everyone')
    .sort((a, b) => b.position - a.position)
    .map(r => r.name)
    .join(', ');
  return `**Roles in ${guild.name}:**\n${roles || 'None'}`;
}

async function onlineMembers(context) {
  const { guild } = context;
  await guild.members.fetch();
  const online = guild.members.cache.filter(m => m.presence?.status === 'online' && !m.user.bot);
  if (online.size === 0) return 'No members are currently online.';
  const list = online.map(m => m.user.tag).join(', ');
  return `**Online Members (${online.size}):**\n${list}`;
}

async function offlineMembers(context) {
  const { guild } = context;
  await guild.members.fetch();
  const offline = guild.members.cache.filter(m => (m.presence?.status !== 'online' || !m.presence) && !m.user.bot);
  if (offline.size === 0) return 'Everyone is online!';
  const list = offline.map(m => m.user.tag).join(', ');
  return `**Offline Members (${offline.size}):**\n${list}`;
}

async function setupServer(context) {
  const { guild } = context;

  const structure = [
    {
      name: '📢 INFORMATION',
      channels: [
        { name: 'welcome', type: ChannelType.GuildText },
        { name: 'rules', type: ChannelType.GuildText },
        { name: 'announcements', type: ChannelType.GuildText },
      ],
    },
    {
      name: '💬 GENERAL',
      channels: [
        { name: 'general-chat', type: ChannelType.GuildText },
        { name: 'introductions', type: ChannelType.GuildText },
        { name: 'media-share', type: ChannelType.GuildText },
      ],
    },
    {
      name: '🎮 GAMING',
      channels: [
        { name: 'lfg', type: ChannelType.GuildText },
        { name: 'game-discussion', type: ChannelType.GuildText },
        { name: 'clips-highlights', type: ChannelType.GuildText },
      ],
    },
    {
      name: '🔊 VOICE',
      channels: [
        { name: 'General Voice', type: ChannelType.GuildVoice },
        { name: 'Game Voice', type: ChannelType.GuildVoice },
        { name: 'Music Voice', type: ChannelType.GuildVoice },
      ],
    },
    {
      name: '🛠️ STAFF',
      channels: [
        { name: 'staff-chat', type: ChannelType.GuildText },
        { name: 'bot-commands', type: ChannelType.GuildText },
      ],
    },
  ];

  const roles = [
    { name: 'Admin', color: '#FF0000' },
    { name: 'Moderator', color: '#00FF00' },
    { name: 'Member', color: '#3498DB' },
    { name: 'Bot', color: '#95A5A6' },
  ];

  await guild.channels.fetch();
  await guild.roles.fetch();
  const existingChannels = new Set(guild.channels.cache.map(c => c.name.toLowerCase()));
  const existingRoles = new Set(guild.roles.cache.map(r => r.name.toLowerCase()));

  let created = { categories: 0, channels: 0, roles: 0, skipped: { categories: 0, channels: 0, roles: 0 } };

  for (const category of structure) {
    const catLower = category.name.toLowerCase();
    let cat;
    if ([...existingChannels].some(c => c === catLower)) {
      cat = guild.channels.cache.find(c => c.name.toLowerCase() === catLower);
      created.skipped.categories++;
    } else {
      cat = await guild.channels.create({
        name: category.name,
        type: ChannelType.GuildCategory,
        reason: 'Server setup',
      });
      created.categories++;
    }

    for (const ch of category.channels) {
      if (existingChannels.has(ch.name.toLowerCase())) {
        created.skipped.channels++;
      } else {
        await guild.channels.create({
          name: ch.name,
          type: ch.type,
          parent: cat.id,
          reason: 'Server setup',
        });
        created.channels++;
      }
    }
  }

  for (const role of roles) {
    if (existingRoles.has(role.name.toLowerCase())) {
      created.skipped.roles++;
    } else {
      const opts = { name: role.name, color: role.color, reason: 'Server setup' };
      if (role.name === 'Admin') {
        opts.permissions = [PermissionsBitField.Flags.Administrator];
      }
      await guild.roles.create(opts);
      created.roles++;
    }
  }

  const lines = [`**Server setup complete!**`];
  if (created.categories) lines.push(`📁 ${created.categories} categories created`);
  if (created.channels) lines.push(`💬 ${created.channels} channels created`);
  if (created.roles) lines.push(`🎭 ${created.roles} roles created`);
  const skipped = created.skipped.categories + created.skipped.channels + created.skipped.roles;
  if (skipped) lines.push(`⏭️ ${skipped} already existed (skipped)`);
  if (created.categories + created.channels + created.roles === 0) {
    lines.push('Everything already exists — nothing to create.');
  }
  return lines.join('\n');
}

async function fixChannelsRoles(context) {
  const { guild } = context;
  const created = [];

  await guild.channels.fetch();
  await guild.roles.fetch();

  const existingChannels = guild.channels.cache.map(c => c.name.toLowerCase());
  const existingRoles = guild.roles.cache.map(r => r.name.toLowerCase());

  const desiredChannels = [
    { name: 'welcome', type: ChannelType.GuildText },
    { name: 'rules', type: ChannelType.GuildText },
    { name: 'announcements', type: ChannelType.GuildText },
    { name: 'general-chat', type: ChannelType.GuildText },
    { name: 'introductions', type: ChannelType.GuildText },
    { name: 'lfg', type: ChannelType.GuildText },
  ];

  const desiredRoles = [
    { name: 'Admin', color: '#FF0000' },
    { name: 'Moderator', color: '#00FF00' },
    { name: 'Member', color: '#3498DB' },
    { name: 'Bot', color: '#95A5A6' },
  ];

  for (const ch of desiredChannels) {
    if (!existingChannels.includes(ch.name)) {
      try {
        await guild.channels.create({ name: ch.name, type: ch.type, reason: 'Auto-fix missing channel' });
        created.push(`📝 Created channel **#${ch.name}**`);
      } catch (e) {
        created.push(`❌ Failed to create #${ch.name}: ${e.message}`);
      }
    }
  }

  for (const role of desiredRoles) {
    if (!existingRoles.includes(role.name.toLowerCase())) {
      try {
        await guild.roles.create({ name: role.name, color: role.color, reason: 'Auto-fix missing role' });
        created.push(`🎭 Created role **${role.name}**`);
      } catch (e) {
        created.push(`❌ Failed to create ${role.name}: ${e.message}`);
      }
    }
  }

  return created.length > 0
    ? ['**Fix complete — missing items created:**', ...created].join('\n')
    : '✅ All standard channels and roles already exist. Nothing needed fixing.';
}

async function deleteDuplicateRoles(context) {
  const { guild } = context;
  await guild.roles.fetch();
  const seen = new Map();
  const removed = [];

  for (const role of guild.roles.cache.sort((a, b) => b.position - a.position).values()) {
    if (role.name === '@everyone') continue;
    const key = role.name.toLowerCase();
    if (seen.has(key)) {
      try {
        await role.delete('Duplicate role cleanup');
        removed.push(`🗑️ Deleted duplicate **${role.name}**`);
      } catch (e) {
        removed.push(`❌ Failed to delete ${role.name}: ${e.message}`);
      }
    } else {
      seen.set(key, role);
    }
  }

  return removed.length > 0
    ? ['**Duplicate role cleanup complete:**', ...removed].join('\n')
    : '✅ No duplicate roles found.';
}

async function fixChannelPermissions(context) {
  const { guild } = context;
  await guild.channels.fetch();
  const results = [];

  for (const channel of guild.channels.cache.values()) {
    if (!channel.permissionOverwrites) continue;
    try {
      const everyone = channel.permissionOverwrites.cache.find(
        ow => ow.id === guild.roles.everyone.id
      );
      if (!everyone) continue;

      const name = channel.name.toLowerCase();

      // Staff channels: restrict @everyone
      if (name.includes('staff') || name.includes('admin')) {
        await channel.permissionOverwrites.edit(guild.roles.everyone, {
          ViewChannel: false,
        });
        results.push(`🔒 Locked **#${channel.name}** (staff only)`);
      }

      // Announcements: read-only for @everyone
      if (name === 'announcements' || name === 'rules') {
        await channel.permissionOverwrites.edit(guild.roles.everyone, {
          SendMessages: false,
          AddReactions: false,
        });
        results.push(`📢 Made **#${channel.name}** read-only`);
      }
    } catch (e) {
      results.push(`❌ Failed to fix **#${channel.name}**: ${e.message}`);
    }
  }

  return results.length > 0
    ? ['**Channel permissions updated:**', ...results].join('\n')
    : '✅ All channel permissions look good.';
}

// ---- Public API ----

export async function parseAndExecute(text, context) {
  if (!context || !isOwner(context.userId)) return null;

  text = normalizeText(text);
  text = text.replace(/\s+/g, ' ').trim();
  if (!text) return null;

  for (const intent of INTENT_PATTERNS) {
    if (intent.pattern.test(text)) {
      try {
        const result = await intent.execute(text, context);
        if (result) return result;
      } catch (err) {
        console.error('Intent execution error:', err);
        return `Failed: ${err.message}`;
      }
    }
  }
  return null;
}

// ---- OpenAI Tool Definitions (kept for compatibility) ----

export const MODERATION_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'purgeMessages',
      description: 'Delete recent messages in the current channel.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Messages to delete (max 100, default 100)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'kickUser',
      description: 'Kick a member from the server.',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'Discord user ID of the member to kick' },
          reason: { type: 'string', description: 'Reason for the kick' },
        },
        required: ['userId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'banUser',
      description: 'Ban a user from the server.',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'Discord user ID to ban' },
          reason: { type: 'string', description: 'Reason for the ban' },
          deleteMessagesDays: { type: 'number', description: 'Delete messages from this many days back (0-7)' },
        },
        required: ['userId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'unbanUser',
      description: 'Unban a user from the server.',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'Discord user ID to unban' },
        },
        required: ['userId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'timeoutUser',
      description: 'Timeout (mute) a member for a duration.',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'Discord user ID to timeout' },
          durationMinutes: { type: 'number', description: 'Duration in minutes (max 40320)' },
          reason: { type: 'string', description: 'Reason for the timeout' },
        },
        required: ['userId', 'durationMinutes'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createChannel',
      description: 'Create a new text channel.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Channel name (lowercase, no spaces)' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'deleteChannel',
      description: 'Delete the current or specified channel.',
      parameters: {
        type: 'object',
        properties: {
          channelId: { type: 'string', description: 'Channel ID to delete (defaults to current channel)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'renameChannel',
      description: 'Rename a channel.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'New channel name' },
          channelId: { type: 'string', description: 'Channel ID to rename (defaults to current channel)' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'sendMessage',
      description: 'Send a message to a channel.',
      parameters: {
        type: 'object',
        properties: {
          channelId: { type: 'string', description: 'Channel ID (defaults to current channel)' },
          content: { type: 'string', description: 'Message content' },
        },
        required: ['content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'announce',
      description: 'Send an announcement embed to a channel.',
      parameters: {
        type: 'object',
        properties: {
          channelId: { type: 'string', description: 'Channel ID (defaults to current channel)' },
          title: { type: 'string', description: 'Announcement title' },
          message: { type: 'string', description: 'Announcement body' },
        },
        required: ['title', 'message'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'addRole',
      description: 'Add a role to a member.',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'Discord user ID' },
          roleName: { type: 'string', description: 'Role name to assign' },
        },
        required: ['userId', 'roleName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'removeRole',
      description: 'Remove a role from a member.',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'Discord user ID' },
          roleName: { type: 'string', description: 'Role name to remove' },
        },
        required: ['userId', 'roleName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createRole',
      description: 'Create a new role.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Role name' },
          color: { type: 'string', description: 'Hex color (e.g. #FF0000)' },
        },
        required: ['name'],
      },
    },
  },
];

export async function executeToolCall(toolName, args, context) {
  if (!isOwner(context.userId)) {
    return { success: false, error: 'Only the bot owner can use moderation tools.' };
  }

  try {
    switch (toolName) {
      case 'purgeMessages': return await run(purgeMessages(args.limit, context));
      case 'kickUser': return await run(kickUser(args.userId, args.reason || 'No reason', context));
      case 'banUser': return await run(banUser(args.userId, args.reason || 'No reason', context));
      case 'unbanUser': return await run(unbanUser(args.userId, context));
      case 'timeoutUser': return await run(timeoutUser(args.userId, args.durationMinutes, context));
      case 'createChannel': return await run(createChannel(args.name, context));
      case 'deleteChannel': return await run(deleteChannel(args.channelId, context));
      case 'renameChannel': return await run(renameChannel(args.name, args.channelId, context));
      case 'sendMessage': return await run(sendToChannel(args.content, args.channelId, context));
      case 'sendToChannel': return await run(sendToChannel(args.content, args.channelId, context));
      case 'sendToUser': return await run(sendToUser(args.content, args.userId, context));
      case 'say': return await run(sendToChannel(args.content, context.channel.id, context));
      case 'announce': return await run(announce(args.title, args.message, args.channelId, context));
      case 'addRole': return await run(addRole(args.roleName, args.userId, context));
      case 'removeRole': return await run(removeRole(args.roleName, args.userId, context));
      case 'createRole': return await run(createRole(args.name, context));
      case 'serverOwner': return await run(serverOwner(context));
      case 'memberCount': return await run(memberCount(context));
      case 'serverInfo': return await run(serverInfo(context));
      case 'listChannels': return await run(listChannels(context));
      case 'listRoles': return await run(listRoles(context));
      case 'onlineMembers': return await run(onlineMembers(context));
      case 'offlineMembers': return await run(offlineMembers(context));
      case 'userInfo': return await run(userInfo(args.userId, context));
      case 'userJoinedAt': return await run(userJoinedAt(args.userId, context));
      case 'setupServer': return await run(setupServer(context));
      case 'fixChannelsRoles': return await run(fixChannelsRoles(context));
      case 'deleteDuplicateRoles': return await run(deleteDuplicateRoles(context));
      case 'fixChannelPermissions': return await run(fixChannelPermissions(context));
      default: return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (err) {
    console.error(`Moderation tool error (${toolName}):`, err);
    return { success: false, error: `Failed: ${err.message}` };
  }
}

async function run(promise) {
  let result = await promise;
  if (typeof result === 'string' && result.length > 1990) {
    result = result.substring(0, 1987) + '...';
  }
  return { success: true, result };
}
