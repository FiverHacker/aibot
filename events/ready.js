import { Events } from 'discord.js';
import config from '../config.json' with { type: 'json' };
import { updatePresence } from '../utils/presence.js';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}`);
    updatePresence(client);

    try {
      const commands = [];
      const commandFiles = await import('../commands/index.js');
      for (const cmd of Object.values(commandFiles)) {
        if (cmd.data) commands.push(cmd.data.toJSON());
      }

      const rest = client.rest;
      rest.setToken(config.token);

      await rest.put(
        `/applications/${client.user.id}/commands`,
        { body: commands }
      );
      console.log(`Registered ${commands.length} global commands`);
    } catch (error) {
      console.error('Failed to register commands:', error);
    }
  },
};
