import { SlashCommandBuilder } from 'discord.js';

export const requiredPermissions = ['ManageMessages'];

export const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription('Delete messages in a channel')
  .addIntegerOption(opt =>
    opt.setName('amount')
      .setDescription('Number of messages to delete (1-100)')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100))
  .addUserOption(opt =>
    opt.setName('user')
      .setDescription('Only delete messages from this user'));

export async function execute(interaction) {
  const amount = interaction.options.getInteger('amount');
  const targetUser = interaction.options.getUser('user');

  await interaction.deferReply({ ephemeral: true });

  const messages = await interaction.channel.messages.fetch({ limit: 100 });
  let toDelete = [...messages.values()];

  if (targetUser) {
    toDelete = toDelete.filter(m => m.author.id === targetUser.id);
  }

  toDelete = toDelete.slice(0, amount);

  if (toDelete.length === 0) {
    return interaction.editReply({ content: 'No messages to delete.' });
  }

  await interaction.channel.bulkDelete(toDelete, true);
  await interaction.editReply({ content: `✅ Deleted ${toDelete.length} messages.` });
}
