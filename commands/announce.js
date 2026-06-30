import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const requiredPermissions = ['ManageGuild'];

export const data = new SlashCommandBuilder()
  .setName('announce')
  .setDescription('Send an announcement to a channel')
  .addChannelOption(opt => opt.setName('channel').setDescription('Target channel').setRequired(true))
  .addStringOption(opt => opt.setName('title').setDescription('Announcement title').setRequired(true))
  .addStringOption(opt => opt.setName('message').setDescription('Announcement message').setRequired(true))
  .addStringOption(opt => opt.setName('color').setDescription('Hex color (default: #FF0000)'))
  .addStringOption(opt => opt.setName('ping').setDescription('Role to ping (role ID)'))
  .addBooleanOption(opt => opt.setName('everyone').setDescription('Ping @everyone'));

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel');
  const title = interaction.options.getString('title');
  const message = interaction.options.getString('message');
  const color = interaction.options.getString('color') || '#FF0000';
  const pingRole = interaction.options.getString('ping');
  const pingEveryone = interaction.options.getBoolean('everyone');

  const embed = new EmbedBuilder()
    .setTitle(`📢 ${title}`)
    .setDescription(message)
    .setColor(color.replace('#', ''))
    .setFooter({ text: `Announcement by ${interaction.user.tag}` })
    .setTimestamp();

  let pingText = '';
  if (pingEveryone) pingText = '@everyone ';
  if (pingRole) pingText += `<@&${pingRole}>`;

  await channel.send({ content: pingText || undefined, embeds: [embed] });
  await interaction.reply({ content: `✅ Announcement sent to ${channel}`, ephemeral: true });
}
