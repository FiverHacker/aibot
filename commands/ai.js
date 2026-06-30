import { SlashCommandBuilder } from 'discord.js';
import { askAI, clearHistory, clearAllHistory } from '../utils/ai.js';
import config from '../config.json' with { type: 'json' };

export const whitelistOnly = true;

export const data = new SlashCommandBuilder()
  .setName('ai')
  .setDescription('Interact with the AI assistant directly')
  .addSubcommand(sub =>
    sub.setName('ask')
      .setDescription('Ask the AI a question')
      .addStringOption(opt => opt.setName('question').setDescription('Your question').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('clear')
      .setDescription('Clear your conversation history'))
  .addSubcommand(sub =>
    sub.setName('clearall')
      .setDescription('Clear ALL conversation history (owner only)'));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  switch (sub) {
    case 'ask': {
      const question = interaction.options.getString('question');
      await interaction.deferReply({ ephemeral: false });
      const context = { channel: interaction.channel, member: interaction.member, guild: interaction.guild, userId: interaction.user.id };
      const reply = await askAI(
        interaction.user.id,
        interaction.user.displayName,
        question,
        interaction.channel.name,
        context
      );
      if (reply) {
        await interaction.editReply({ content: `**Q:** ${question}\n\n**A:** ${reply}` });
      } else {
        await interaction.editReply({ content: `**Q:** ${question}\n\n**A:** I couldn't generate a response.` });
      }
      break;
    }
    case 'clear': {
      clearHistory(interaction.user.id);
      await interaction.reply({ content: '✅ Your conversation history has been cleared.', ephemeral: true });
      break;
    }
    case 'clearall': {
      if (interaction.user.id !== config.ownerId) {
        return interaction.reply({ content: 'Only the bot owner can clear all history.', ephemeral: true });
      }
      clearAllHistory();
      await interaction.reply({ content: '✅ All conversation history has been cleared.', ephemeral: true });
      break;
    }
  }
}
