import { ActivityType } from 'discord.js';

export function updatePresence(client) {
  const count = client.guilds.cache.size;

  client.user.setPresence({
    activities: [{
      type: ActivityType.Custom,
      name: 'Custom Status',
      state: `🤖 AI Discord Manager | ${count} server${count !== 1 ? 's' : ''}`,
    }],
    status: 'online',
  });
}
