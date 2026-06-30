import { Events } from 'discord.js';
import { updatePresence } from '../utils/presence.js';

export default {
  name: Events.GuildCreate,
  async execute(guild) {
    console.log(`Joined guild: ${guild.name} (${guild.id})`);
    updatePresence(guild.client);
  },
};
