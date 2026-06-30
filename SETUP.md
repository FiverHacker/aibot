# Discord Bot Setup Guide

## Step 1: Create a Discord Bot Application

1. Go to https://discord.com/developers/applications
2. Click **"New Application"** → name it (e.g., "AI Server Manager")
3. Go to **"Bot"** tab → click **"Reset Token"** → copy the token
4. Under **Privileged Gateway Intents**, enable:
   - ✅ MESSAGE CONTENT INTENT
   - ✅ SERVER MEMBERS INTENT
5. Click **"Save Changes"**

## Step 2: Invite Bot to Your Server

1. Go to **"OAuth2" → "URL Generator"**
2. Scopes: ✅ `bot` ✅ `applications.commands`
3. Bot Permissions: ✅ `Send Messages` ✅ `Read Messages` ✅ `Embed Links` ✅ `Manage Messages` ✅ `Mention Everyone` ✅ `Kick Members` ✅ `Ban Members` ✅ `Manage Channels` ✅ `Manage Roles`
4. Copy the generated URL → open in browser → select your server

## Step 3: Get IDs

1. Open Discord → **Settings → Advanced → Developer Mode: ON**
2. Right-click your server icon → **"Copy ID"** → put in `guildId`
3. Right-click your username → **"Copy ID"** → put in `ownerId`
4. Go to **OAuth2 → "General"** → copy **"Client ID"** → put in `clientId`

## Step 4: Choose Your AI Provider

### Option A: Local Model (Ollama) — 100% Free, Unlimited, No Keys

1. Install Ollama from https://ollama.com/
2. Open PowerShell and pull a model:
   ```powershell
   ollama pull llama3.1
   ```
   (Other good free models: `deepseek-coder-v2`, `qwen2.5`, `mistral`)
3. Leave `config.json` as-is — it's already set to `http://localhost:11434/v1`
4. Keep Ollama running in the background while the bot is on

### Option B: Cloudflare Workers AI — 10,000 free neurons/day

1. Go to https://dash.cloudflare.com/ → sign up (email, no card)
2. Copy your **Account ID** from the right sidebar under "API"
3. Go to **"My Profile" → "API Tokens"** → **"Create Token"**
   - Use the **"Workers AI"** template → set permissions to **"Workers AI: Use"**
   - Copy the generated token
4. In `config.json`, change to:
   ```json
   "apiKey": "YOUR_CLOUDFLARE_API_TOKEN",
   "baseURL": "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/ai/v1",
   "model": "@cf/meta/llama-3.1-8b-instruct"
   ```

## Step 5: Edit config.json

Open `config.json` and fill in your values. The `ownerId` user has access to all moderation/AI tools.

## Step 6: Install & Run

Open PowerShell and run:

```powershell
cd discord-bot
npm start
```

You should see: `Logged in as YourBotName#1234`

## Commands Reference

### General (anyone can use)
| Command | Description |
|---------|-------------|
| `/help` | Show all commands |
| `/serverinfo` | Server stats |
| `/userinfo [user]` | User details |

### Whitelist (manage server permission)
| Command | Description |
|---------|-------------|
| `/whitelist add @user` | Add to whitelist |
| `/whitelist remove @user` | Remove from whitelist |
| `/whitelist list` | Show all whitelisted |
| `/whitelist check @user` | Check if user is whitelisted |

### Messaging (manage server permission)
| Command | Description |
|---------|-------------|
| `/embed channel title description` | Send rich embed |
| `/announce channel title message` | Send announcement |
| `/autoreply add keyword response` | Set keyword auto-reply |
| `/autoreply remove keyword` | Remove auto-reply |
| `/autoreply list` | List all auto-replies |

### AI (whitelisted only)
| Command | Description |
|---------|-------------|
| `/ai ask question` | Ask AI directly |
| `/ai clear` | Clear your chat history |
| Mention the bot in chat | AI auto-replies |

### Moderation (manage messages permission)
| Command | Description |
|---------|-------------|
| `/purge amount [user]` | Delete messages |

### AI Moderation (owner only)
Mention the bot and ask naturally:
- "kick @user for spamming"
- "delete all messages"
- "ban @user"
- "create a channel called announcements"
- Any server management action

