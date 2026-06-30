import { Events } from 'discord.js';
import { isWhitelisted, isOwner } from '../utils/whitelist.js';
import config from '../config.json' with { type: 'json' };

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user } = interaction;

    try {
      const commands = await import('../commands/index.js');
      const command = commands[commandName];

      if (!command) return;

      // Owner bypasses all checks
      if (isOwner(user.id, config.ownerId)) {
        return await command.execute(interaction);
      }

      if (command.ownerOnly) {
        return interaction.reply({ content: 'This command is only for the bot owner.', ephemeral: true });
      }

      if (command.requiredPermissions) {
        const missing = command.requiredPermissions.filter(
          perm => !interaction.member?.permissions?.has(perm)
        );
        if (missing.length > 0) {
          return interaction.reply({
            content: `You need the **${missing.join(', ')}** permission(s) to use this command.`,
            ephemeral: true,
          });
        }
      }

      if (command.whitelistOnly && !isWhitelisted(user.id)) {
        return interaction.reply({ content: 'You are not whitelisted to use this command. Contact the server admin.', ephemeral: true });
      }

      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${commandName}:`, error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'An error occurred while executing this command.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'An error occurred while executing this command.', ephemeral: true });
      }
    }
  },
};
