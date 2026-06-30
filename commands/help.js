import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Show all available commands');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('🤖 Bot Commands')
    .setColor('#5865F2')
    .setDescription('Here are all available commands. Commands marked with 🔒 require whitelist access.')
    .addFields(
      { name: '🔓 General', value: '`/help` - Show this menu\n`/serverinfo` - Server information\n`/userinfo` - User information', inline: false },
      { name: '🔒 Whitelist', value: '`/whitelist add <user>` - Add user\n`/whitelist remove <user>` - Remove user\n`/whitelist list` - List whitelisted\n`/whitelist check <user>` - Check status', inline: false },
      { name: '🔒 Messaging', value: '`/embed` - Send custom embed\n`/announce` - Send announcement\n`/autoreply add <keyword> <response>` - Set auto-reply\n`/autoreply remove <keyword>` - Remove auto-reply\n`/autoreply list` - List auto-replies', inline: false },
      { name: '🔒 AI Assistant', value: '`/ai ask <question>` - Ask AI\n`/ai clear` - Clear your history\n`/ai clearall` - Clear all history\nAlso responds when mentioned in chat!', inline: false },
      { name: '🔒 Moderation', value: '`/purge <amount>` - Delete messages\n`/purge <amount> <user>` - Delete user messages', inline: false },
    )
    .setFooter({ text: 'AI Discord Manager Bot' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: false });
}
