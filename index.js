import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import config from './config.json' with { type: 'json' };

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.Channel],
});

// Load events
const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  try {
    const { default: event } = await import(`./events/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`Loaded event: ${event.name}`);
  } catch (err) {
    console.error(`Failed to load event ${file}:`, err);
  }
}

try {
  await client.login(config.token);
  console.log(`Logged in as ${client.user?.tag}`);
} catch (err) {
  console.error('Login failed:', err);
  process.exit(1);
}

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down...`);
  client.destroy();
  process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

// Prevent crash on Discord API errors (e.g. unknown message on reply)
client.on('error', (err) => {
  if (err.code === 50035) return; // Invalid Form Body — handled per-call
  console.error('Discord client error:', err.message);
});
