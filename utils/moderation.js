import { ChannelType, EmbedBuilder } from 'discord.js';
import config from '../config.json' with { type: 'json' };

const ownerId = config.ownerId;

function isOwner(userId) {
  return userId === ownerId;
}

function resolveId(input) {
  if (!input) return null;
  const m = String(input).match(/<@!?(\d+)>/);
  if (m) return m[1];
  const c = String(input).match(/<#!?(\d+)>/);
  if (c) return c[1];
  return input.trim();
}

function findChannel(guild, identifier) {
  if (!identifier) return null;
  const id = resolveId(identifier);
  return guild.channels.cache.get(id)
    || guild.channels.cache.find(c => c.name.toLowerCase() === String(identifier).toLowerCase());
}

function findRole(guild, name) {
  return guild.roles.cache.find(r => r.name.toLowerCase() === String(name).toLowerCase());
}

// ---- Action Executors ----

async function sendToUser(content, userId, context) {
  const { channel } = context;
  const id = resolveId(userId);
  await channel.send(`<@${id}> ${content}`);
  return `Sent message to <@${id}> in **#${channel.name}**.`;
}

async function sendToChannel(content, channelId, context) {
  const { guild, channel: current } = context;
  const target = channelId ? findChannel(guild, channelId) : current;
  if (!target) return 'Channel not found.';
  await target.send(content);
  return `Message sent to **#${target.name}**.`;
}

async function addRole(roleName, userId, context) {
  const { guild } = context;
  const id = resolveId(userId);
  const member = await guild.members.fetch(id);
  const role = guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
  if (!role) return `Role **${roleName}** not found.`;
  await member.roles.add(role);
  return `Added role **${role.name}** to **${member.user.tag}**.`;
}

async function removeRole(roleName, userId, context) {
  const { guild } = context;
  const id = resolveId(userId);
  const member = await guild.members.fetch(id);
  const role = guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
  if (!role) return `Role **${roleName}** not found.`;
  await member.roles.remove(role);
  return `Removed role **${role.name}** from **${member.user.tag}**.`;
}

async function kickUser(userId, reason, context) {
  const { guild } = context;
  const id = resolveId(userId);
  const member = await guild.members.fetch(id);
  await member.kick(reason);
  return `Kicked **${member.user.tag}**.`;
}

async function banUser(userId, reason, context) {
  const { guild } = context;
  const id = resolveId(userId);
  await guild.bans.create(id, { reason });
  return `Banned **${id}**.`;
}

async function unbanUser(userId, context) {
  const { guild } = context;
  const id = resolveId(userId);
  await guild.bans.remove(id);
  return `Unbanned **${id}**.`;
}

async function timeoutUser(userId, minutes, context) {
  const { guild } = context;
  const id = resolveId(userId);
  const member = await guild.members.fetch(id);
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

async function createChannel(name, context, type = 'text', parent = null) {
  const { guild } = context;
  const channelType = type === 'category' ? ChannelType.GuildCategory : ChannelType.GuildText;
  const options = { name, type: channelType, reason: 'Created by bot owner' };
  if (parent) {
    const parentChan = findChannel(guild, parent);
    if (parentChan && parentChan.type === ChannelType.GuildCategory) {
      options.parent = parentChan.id;
    }
  }
  const newChannel = await guild.channels.create(options);
  const label = type === 'category' ? 'category' : 'channel';
  return `Created ${label} **${newChannel.name}**.`;
}

async function deleteChannel(channelId, context) {
  const { channel: current, guild } = context;
  const target = channelId ? findChannel(guild, channelId) : current;
  if (!target) return 'Channel not found.';
  const name = target.name;
  await target.delete('Deleted by bot owner');
  return `Deleted channel **#${name}**.`;
}

async function renameChannel(name, channelId, context) {
  const { channel: current, guild } = context;
  const target = channelId ? findChannel(guild, channelId) : current;
  if (!target) return 'Channel not found.';
  const old = target.name;
  await target.setName(name, 'Renamed by bot owner');
  return `Renamed channel **#${old}** to **#${name}**.`;
}

async function setChannelTopic(topic, channelId, context) {
  const { channel: current, guild } = context;
  const target = channelId ? findChannel(guild, channelId) : current;
  if (!target) return 'Channel not found.';
  await target.setTopic(topic, 'Topic set by bot owner');
  return `Set topic for **#${target.name}**.`;
}

async function announce(title, message, channelId, context) {
  const { channel: current, guild } = context;
  const target = channelId ? findChannel(guild, channelId) : current;
  if (!target) return 'Channel not found.';
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(message)
    .setColor('#FF0000')
    .setTimestamp();
  await target.send({ embeds: [embed] });
  return `Announcement sent to **#${target.name}**.`;
}

async function createRole(name, color, context) {
  const { guild } = context;
  const opts = { name, reason: 'Created by bot owner' };
  if (color) opts.color = color;
  const newRole = await guild.roles.create(opts);
  return `Created role **${newRole.name}**.`;
}

async function deleteRole(roleName, context) {
  const { guild } = context;
  const role = findRole(guild, roleName);
  if (!role) return `Role **${roleName}** not found.`;
  const name = role.name;
  await role.delete('Deleted by bot owner');
  return `Deleted role **${name}**.`;
}

async function userJoinedAt(userId, context) {
  const { guild } = context;
  const id = resolveId(userId);
  const member = await guild.members.fetch(id);
  const joined = member.joinedAt;
  if (!joined) return `Could not find when **${member.user.tag}** joined.`;
  const date = joined.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const time = joined.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const days = Math.floor((Date.now() - joined.getTime()) / 86400000);
  return `**${member.user.tag}** joined on **${date}** at **${time}** (${days} days ago).`;
}

async function userInfo(userId, context) {
  const { guild } = context;
  const id = resolveId(userId);
  const member = await guild.members.fetch(id);
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
  const totalChannels = guild.channels.cache.size;
  const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
  const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
  const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
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
    `💬 Channels: ${totalChannels} total (${textChannels} text, ${voiceChannels} voice, ${categories} categories)`,
    `🎭 Roles: ${roles}`,
    `🚀 Boosts: ${boostCount} (${boostLevel})`,
  ].join('\n');
}

async function listAllChannels(context) {
  const { guild } = context;
  await guild.channels.fetch();
  const all = guild.channels.cache;
  const lines = [`**All Channels in ${guild.name}:**`];
  const categories = all.filter(c => c.type === ChannelType.GuildCategory).sort((a, b) => a.position - b.position);

  for (const cat of categories.values()) {
    lines.push(`\n📁 **${cat.name}**`);
    const children = all.filter(c => c.parentId === cat.id).sort((a, b) => a.position - b.position);
    for (const ch of children.values()) {
      const icon = ch.type === ChannelType.GuildVoice ? '🔊' : ch.type === ChannelType.GuildAnnouncement ? '📢' : ch.type === ChannelType.GuildForum ? '📋' : '#';
      lines.push(`  ${icon} ${ch.name} \`${ch.id}\``);
    }
  }

  const uncategorized = all.filter(c => !c.parentId && c.type !== ChannelType.GuildCategory).sort((a, b) => a.position - b.position);
  if (uncategorized.size > 0) {
    lines.push('\n📁 **Uncategorized**');
    for (const ch of uncategorized.values()) {
      const icon = ch.type === ChannelType.GuildVoice ? '🔊' : ch.type === ChannelType.GuildAnnouncement ? '📢' : '#';
      lines.push(`  ${icon} ${ch.name} \`${ch.id}\``);
    }
  }

  return lines.join('\n');
}

async function listRoles(context) {
  const { guild } = context;
  const roles = guild.roles.cache
    .filter(r => r.name !== '@everyone')
    .sort((a, b) => b.position - a.position)
    .map(r => `**${r.name}** (\`${r.id}\`)`)
    .join('\n');
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

async function deleteAllChannels(context) {
  const { guild } = context;
  await guild.channels.fetch();
  const all = [...guild.channels.cache.values()];
  const results = [];

  for (const channel of all) {
    try {
      const name = channel.name;
      await channel.delete('Bulk delete by bot owner');
      results.push(`🗑️ Deleted **${name}**`);
    } catch (e) {
      results.push(`❌ Failed to delete **${channel.name}**: ${e.message}`);
    }
  }

  return results.length > 0
    ? ['**Deleted all channels:**', ...results].join('\n')
    : 'No channels to delete.';
}

async function deleteChannelsByType(channelType, context) {
  const { guild } = context;
  const typeMap = {
    text: ChannelType.GuildText,
    voice: ChannelType.GuildVoice,
    category: ChannelType.GuildCategory,
    announcement: ChannelType.GuildAnnouncement,
    forum: ChannelType.GuildForum,
  };

  const targetType = typeMap[channelType.toLowerCase()];
  if (targetType === undefined) return `Unknown channel type: **${channelType}**. Use: text, voice, category, announcement, forum.`;

  await guild.channels.fetch();
  const toDelete = guild.channels.cache.filter(c => c.type === targetType);
  if (toDelete.size === 0) return `No ${channelType} channels found.`;

  const results = [];
  for (const channel of toDelete.values()) {
    try {
      const name = channel.name;
      await channel.delete(`Bulk delete ${channelType} by bot owner`);
      results.push(`🗑️ Deleted **${name}**`);
    } catch (e) {
      results.push(`❌ Failed to delete **${channel.name}**: ${e.message}`);
    }
  }

  return results.length > 0
    ? [`**Deleted all ${channelType} channels:**`, ...results].join('\n')
    : `No ${channelType} channels to delete.`;
}

// ---- Public API ----

export async function executeToolCall(toolName, args, context) {
  if (!context || !isOwner(context.userId)) {
    return { success: false, error: 'Only the bot owner can use moderation tools.' };
  }

  try {
    switch (toolName) {
      case 'purgeMessages': return await run(purgeMessages(args.limit, context));
      case 'kickUser': return await run(kickUser(args.userId, args.reason || 'No reason', context));
      case 'banUser': return await run(banUser(args.userId, args.reason || 'No reason', context));
      case 'unbanUser': return await run(unbanUser(args.userId, context));
      case 'timeoutUser': return await run(timeoutUser(args.userId, args.durationMinutes, context));
      case 'createChannel': return await run(createChannel(args.name, context, args.type, args.parent));
      case 'deleteChannel': return await run(deleteChannel(args.channelId, context));
      case 'renameChannel': return await run(renameChannel(args.name, args.channelId, context));
      case 'setChannelTopic': return await run(setChannelTopic(args.topic, args.channelId, context));
      case 'sendMessage': return await run(sendToChannel(args.content, args.channelId, context));
      case 'sendToChannel': return await run(sendToChannel(args.content, args.channelId, context));
      case 'sendToUser': return await run(sendToUser(args.content, args.userId, context));
      case 'say': return await run(sendToChannel(args.content, context.channel?.id, context));
      case 'announce': return await run(announce(args.title, args.message, args.channelId, context));
      case 'addRole': return await run(addRole(args.roleName, args.userId, context));
      case 'removeRole': return await run(removeRole(args.roleName, args.userId, context));
      case 'createRole': return await run(createRole(args.name, args.color, context));
      case 'deleteRole': return await run(deleteRole(args.name, context));
      case 'serverOwner': return await run(serverOwner(context));
      case 'memberCount': return await run(memberCount(context));
      case 'serverInfo': return await run(serverInfo(context));
      case 'listChannels': return await run(listAllChannels(context));
      case 'listRoles': return await run(listRoles(context));
      case 'onlineMembers': return await run(onlineMembers(context));
      case 'offlineMembers': return await run(offlineMembers(context));
      case 'userInfo': return await run(userInfo(args.userId, context));
      case 'userJoinedAt': return await run(userJoinedAt(args.userId, context));
      case 'deleteAllChannels': return await run(deleteAllChannels(context));
      case 'deleteChannelsByType': return await run(deleteChannelsByType(args.type, context));
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

// ---- OpenAI Tool Definitions ----

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
          userId: { type: 'string', description: 'Discord user ID or @mention of the member to kick' },
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
          userId: { type: 'string', description: 'Discord user ID or @mention to ban' },
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
          userId: { type: 'string', description: 'Discord user ID or @mention to timeout' },
          durationMinutes: { type: 'number', description: 'Duration in minutes (max 40320, default 60)' },
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
      description: 'Create a channel or category.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Channel name (lowercase, use hyphens for spaces)' },
          type: { type: 'string', description: '"text" (default) for text channel, "category" for a category' },
          parent: { type: 'string', description: 'Parent category name or ID to place this channel under (for text channels only)' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'deleteChannel',
      description: 'Delete a channel by name or ID. Omit channelId to delete the current channel.',
      parameters: {
        type: 'object',
        properties: {
          channelId: { type: 'string', description: 'Channel name, ID, or #mention (defaults to current channel)' },
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
          channelId: { type: 'string', description: 'Channel name, ID, or #mention (defaults to current channel)' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'setChannelTopic',
      description: 'Set the topic/description of a channel.',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'The topic text to set' },
          channelId: { type: 'string', description: 'Channel name, ID, or #mention (defaults to current channel)' },
        },
        required: ['topic'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'sendToChannel',
      description: 'Send a message to a channel.',
      parameters: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'Message content to send' },
          channelId: { type: 'string', description: 'Channel name, ID, or #mention (defaults to current channel)' },
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
          title: { type: 'string', description: 'Announcement title' },
          message: { type: 'string', description: 'Announcement body/description' },
          channelId: { type: 'string', description: 'Channel name, ID, or #mention (defaults to current channel)' },
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
          userId: { type: 'string', description: 'Discord user ID or @mention' },
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
          userId: { type: 'string', description: 'Discord user ID or @mention' },
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
  {
    type: 'function',
    function: {
      name: 'deleteRole',
      description: 'Delete a role by name.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Role name to delete' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'serverOwner',
      description: 'Get the owner of the server.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'memberCount',
      description: 'Get the member count of the server.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'serverInfo',
      description: 'Get detailed server information (channels, roles, boosts, etc.).',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'listChannels',
      description: 'List ALL channels in the server organized by category, with IDs.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'listRoles',
      description: 'List all roles in the server.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'onlineMembers',
      description: 'List currently online members.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'offlineMembers',
      description: 'List currently offline members.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'userInfo',
      description: 'Get information about a specific user.',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'Discord user ID or @mention' },
        },
        required: ['userId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'userJoinedAt',
      description: 'Get when a user joined the server.',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'Discord user ID or @mention' },
        },
        required: ['userId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'deleteAllChannels',
      description: 'DELETE ALL channels in the server. This is destructive and cannot be undone.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'deleteChannelsByType',
      description: 'Delete all channels of a specific type (text, voice, category, announcement, forum).',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', description: 'Channel type to delete: "text", "voice", "category", "announcement", or "forum"' },
        },
        required: ['type'],
      },
    },
  },
];
