import { Events } from 'discord.js';
import { updatePresence } from '../utils/presence.js';

export default {
  name: Events.GuildDelete,
  async execute(guild) {
    console.log(`Left guild: ${guild.name} (${guild.id})`);
    updatePresence(guild.client);
  },
};
