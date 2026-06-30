import { SlashCommandBuilder } from 'discord.js';
import { setAutoReply, removeAutoReply, listAutoReplies } from '../utils/autoReply.js';

export const requiredPermissions = ['ManageGuild'];

export const data = new SlashCommandBuilder()
  .setName('autoreply')
  .setDescription('Manage auto-reply keywords')
  .addSubcommand(sub =>
    sub.setName('add')
      .setDescription('Add an auto-reply keyword')
      .addStringOption(opt => opt.setName('keyword').setDescription('Trigger keyword').setRequired(true))
      .addStringOption(opt => opt.setName('response').setDescription('Reply message').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('remove')
      .setDescription('Remove an auto-reply keyword')
      .addStringOption(opt => opt.setName('keyword').setDescription('Keyword to remove').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('list')
      .setDescription('List all auto-reply keywords'));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  switch (sub) {
    case 'add': {
      const keyword = interaction.options.getString('keyword');
      const response = interaction.options.getString('response');
      setAutoReply(keyword, response);
      await interaction.reply({ content: `✅ Auto-reply added: **${keyword}** → ${response}`, ephemeral: true });
      break;
    }
    case 'remove': {
      const keyword = interaction.options.getString('keyword');
      const removed = removeAutoReply(keyword);
      if (removed) {
        await interaction.reply({ content: `✅ Removed auto-reply for **${keyword}**`, ephemeral: true });
      } else {
        await interaction.reply({ content: `⚠️ No auto-reply found for **${keyword}**`, ephemeral: true });
      }
      break;
    }
    case 'list': {
      const replies = listAutoReplies();
      const entries = Object.entries(replies);
      if (entries.length === 0) {
        await interaction.reply({ content: 'No auto-replies configured.', ephemeral: true });
        return;
      }
      const list = entries.map(([k, v]) => `**${k}** → ${v}`).join('\n');
      await interaction.reply({ content: `**Auto-Replies (${entries.length}):**\n${list}`, ephemeral: true });
      break;
    }
  }
}
