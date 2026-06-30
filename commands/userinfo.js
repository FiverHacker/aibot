import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Display info about a user')
  .addUserOption(opt => opt.setName('user').setDescription('The user to look up'));

export async function execute(interaction) {
  const target = interaction.options.getUser('user') || interaction.user;
  const member = interaction.guild.members.cache.get(target.id);

  const embed = new EmbedBuilder()
    .setTitle(target.tag)
    .setThumbnail(target.displayAvatarURL({ size: 256 }))
    .setColor(member?.displayHexColor || '#5865F2')
    .addFields(
      { name: 'ID', value: target.id, inline: true },
      { name: 'Bot', value: target.bot ? 'Yes' : 'No', inline: true },
      { name: 'Joined Server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A', inline: true },
      { name: 'Account Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
    )
    .setTimestamp();

  if (member && member.roles.cache.size > 1) {
    const roles = member.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => r.toString())
      .join(', ');
    embed.addFields({ name: 'Roles', value: roles.slice(0, 1024) || 'None' });
  }

  await interaction.reply({ embeds: [embed] });
}
