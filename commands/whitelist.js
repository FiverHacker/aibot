import { SlashCommandBuilder } from 'discord.js';
import { addToWhitelist, removeFromWhitelist, getWhitelist, isWhitelisted } from '../utils/whitelist.js';

export const requiredPermissions = ['ManageGuild'];

export const data = new SlashCommandBuilder()
  .setName('whitelist')
  .setDescription('Manage bot whitelist')
  .addSubcommand(sub =>
    sub.setName('add')
      .setDescription('Add a user to the whitelist')
      .addUserOption(opt => opt.setName('user').setDescription('The user to whitelist').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('remove')
      .setDescription('Remove a user from the whitelist')
      .addUserOption(opt => opt.setName('user').setDescription('The user to remove').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('list')
      .setDescription('List all whitelisted users'))
  .addSubcommand(sub =>
    sub.setName('check')
      .setDescription('Check if a user is whitelisted')
      .addUserOption(opt => opt.setName('user').setDescription('The user to check').setRequired(true)));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const targetUser = interaction.options.getUser('user');

  switch (sub) {
    case 'add': {
      const added = addToWhitelist(targetUser.id);
      if (added) {
        await interaction.reply({ content: `✅ Added ${targetUser.tag} to the whitelist.`, ephemeral: true });
      } else {
        await interaction.reply({ content: `⚠️ ${targetUser.tag} is already whitelisted.`, ephemeral: true });
      }
      break;
    }
    case 'remove': {
      const removed = removeFromWhitelist(targetUser.id);
      if (removed) {
        await interaction.reply({ content: `✅ Removed ${targetUser.tag} from the whitelist.`, ephemeral: true });
      } else {
        await interaction.reply({ content: `⚠️ ${targetUser.tag} was not in the whitelist.`, ephemeral: true });
      }
      break;
    }
    case 'list': {
      const users = getWhitelist();
      if (users.length === 0) {
        await interaction.reply({ content: 'No users are whitelisted.', ephemeral: true });
        return;
      }
      const list = users.map(id => `<@${id}>`).join('\n');
      await interaction.reply({ content: `**Whitelisted Users (${users.length}):**\n${list}`, ephemeral: true });
      break;
    }
    case 'check': {
      const whitelisted = isWhitelisted(targetUser.id);
      const status = whitelisted ? '✅ is whitelisted' : '❌ is **not** whitelisted';
      await interaction.reply({ content: `${targetUser.tag} ${status}.`, ephemeral: true });
      break;
    }
  }
}
