import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const requiredPermissions = ['ManageGuild'];

export const data = new SlashCommandBuilder()
  .setName('embed')
  .setDescription('Send a custom embed to a channel')
  .addChannelOption(opt => opt.setName('channel').setDescription('Target channel').setRequired(true))
  .addStringOption(opt => opt.setName('title').setDescription('Embed title').setRequired(true))
  .addStringOption(opt => opt.setName('description').setDescription('Embed description').setRequired(true))
  .addStringOption(opt => opt.setName('color').setDescription('Hex color (e.g., #FF5733)'))
  .addStringOption(opt => opt.setName('thumbnail').setDescription('Thumbnail image URL'))
  .addStringOption(opt => opt.setName('image').setDescription('Main image URL'))
  .addStringOption(opt => opt.setName('footer').setDescription('Footer text'))
  .addStringOption(opt => opt.setName('field1_name').setDescription('Field 1 name'))
  .addStringOption(opt => opt.setName('field1_value').setDescription('Field 1 value'))
  .addStringOption(opt => opt.setName('field2_name').setDescription('Field 2 name'))
  .addStringOption(opt => opt.setName('field2_value').setDescription('Field 2 value'));

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel');
  const title = interaction.options.getString('title');
  const description = interaction.options.getString('description');
  const color = interaction.options.getString('color') || '#5865F2';
  const thumbnail = interaction.options.getString('thumbnail');
  const image = interaction.options.getString('image');
  const footer = interaction.options.getString('footer');

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color.replace('#', ''))
    .setTimestamp();

  if (thumbnail) embed.setThumbnail(thumbnail);
  if (image) embed.setImage(image);
  if (footer) embed.setFooter({ text: footer });

  const f1n = interaction.options.getString('field1_name');
  const f1v = interaction.options.getString('field1_value');
  const f2n = interaction.options.getString('field2_name');
  const f2v = interaction.options.getString('field2_value');

  if (f1n && f1v) embed.addFields({ name: f1n, value: f1v, inline: true });
  if (f2n && f2v) embed.addFields({ name: f2n, value: f2v, inline: true });

  await channel.send({ embeds: [embed] });
  await interaction.reply({ content: `✅ Embed sent to ${channel}`, ephemeral: true });
}
