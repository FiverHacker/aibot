import OpenAI from 'openai';
import config from '../config.json' with { type: 'json' };
import { executeToolCall } from './moderation.js';

function truncate(str, max = 1990) {
  if (typeof str === 'string' && str.length > max) {
    return str.substring(0, max - 3) + '...';
  }
  return str;
}

let client = null;
const conversationHistory = new Map();

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: config.ai.apiKey,
      baseURL: config.ai.baseURL,
    });
  }
  return client;
}

const ACTION_PROMPT = `You are an AI Discord server manager. You have FULL access to manage the server.

When the user asks you to DO something (kick, ban, purge, create channels/roles, setup server, send messages, etc.), you MUST include a JSON array of actions in your response. The JSON array can be anywhere in your text — at the start, middle, or end. You can also wrap it in conversation.

Format: [{"action":"actionName","args":{...}}]

Available actions:
- sendToChannel: {"content", "channelId?"}
- sendToUser: {"content", "userId"}
- say: {"content"}
- addRole: {"userId", "roleName"}
- removeRole: {"userId", "roleName"}
- kickUser: {"userId", "reason?"}
- banUser: {"userId", "reason?"}
- unbanUser: {"userId"}
- timeoutUser: {"userId", "durationMinutes"}
- purgeMessages: {"limit?"}
- createChannel: {"name"}
- deleteChannel: {"channelId?"}
- renameChannel: {"name", "channelId?"}
- announce: {"title", "message", "channelId?"}
- createRole: {"name", "color?"}
- setupServer: {} — Creates full gaming server with categories, channels, roles
- deleteDuplicateRoles: {} — Deletes duplicate roles (keeps highest)
- fixChannelPermissions: {} — Locks staff channels, makes announcements read-only
- serverOwner: {}
- memberCount: {}
- serverInfo: {}
- listChannels: {}
- listRoles: {}
- onlineMembers: {}
- offlineMembers: {}
- userInfo: {"userId"}
- userJoinedAt: {"userId"}

userId = @mention or Discord ID. channelId defaults to current channel.

Examples:
"kick @user for spamming" -> "Done. [{"action":"kickUser","args":{"userId":"@user","reason":"spamming"}}]"
"make rules and send to #rules" -> "Here are some rules I created:\\n1. Be respectful\\n2. No spam\\n[{"action":"sendToChannel","args":{"channelId":"RULES_ID","content":"**Rules**\\n..."}}]"
"setup my server" -> "Setting up your server now! [{"action":"setupServer","args":{}}]"
"who is the owner" -> "[{"action":"serverOwner","args":{}}]"
"delete 50 messages" -> "Cleaning up. [{"action":"purgeMessages","args":{"limit":50}}]"

For normal conversation (questions, jokes, advice), just respond with regular text — no JSON needed.`;

function extractJSON(text) {
  // Try direct parse first (fast path for clean responses)
  const trimmed = text.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  // Search for JSON array anywhere in text
  const jsonMatch = text.match(/\[\s*\{[^[]*\}\s*\]/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  // Try multi-line JSON with line breaks
  const blockMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
  if (blockMatch) {
    try {
      const parsed = JSON.parse(blockMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  return null;
}

export async function askAI(userId, userName, message, channelName, context = null, enhancedMessage = null) {
  if (!config.ai.enabled) return null;

  const isLocal = config.ai.baseURL?.includes('localhost') || config.ai.baseURL?.includes('127.0.0.1');
  if (!isLocal && (!config.ai.apiKey || config.ai.apiKey === 'YOUR_NVIDIA_API_KEY')) {
    return "AI is not configured yet. Please set a valid API key in config.json.";
  }

  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }

  const history = conversationHistory.get(userId);

  history.push({ role: 'user', content: `${userName}: ${message}` });

  if (history.length > config.ai.maxHistory * 2) {
    history.splice(0, 2);
  }

  const systemMessages = [
    { role: 'system', content: config.ai.systemPrompt },
    { role: 'system', content: `Current channel: #${channelName}` },
  ];

  if (context && context.userId === config.ownerId) {
    systemMessages.push({ role: 'system', content: ACTION_PROMPT });
  } else if (context) {
    systemMessages.push({
      role: 'system',
      content: 'You can answer questions and have conversations. You cannot perform moderation or server management actions.',
    });
  }

  try {
    const openai = getClient();
    const sliced = history.slice(-config.ai.maxHistory);
    const messages = [...systemMessages, ...sliced];

    if (enhancedMessage && enhancedMessage !== message) {
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          messages[i] = { ...messages[i], content: `${userName}: ${enhancedMessage}` };
          break;
        }
      }
    }

    const response = await openai.chat.completions.create({
      model: config.ai.model,
      messages,
      max_tokens: 800,
      temperature: 0.7,
    });

    const text = response.choices[0]?.message?.content || '';
    const trimmed = text.trim();

    // Try to extract and execute JSON actions
    if (context && context.userId === config.ownerId) {
      const actions = extractJSON(trimmed);
      if (actions && actions.length > 0) {
        const results = [];
        for (const action of actions) {
          const result = await executeToolCall(action.action, action.args || {}, context);
          results.push(result.success ? result.result : result.error);
        }
        // If the AI also had conversational text before/after the JSON, prepend/append it
        const cleanText = trimmed.replace(/\[\s*\{[\s\S]*?\}\s*\]/, '').trim();
        const reply = truncate(results.join('\n'));
        history.push({ role: 'assistant', content: reply });
        return reply;
      }
    }

    const finalReply = truncate(trimmed) || "I couldn't generate a response.";
    history.push({ role: 'assistant', content: finalReply });
    return finalReply;
  } catch (error) {
    console.error('AI API error:', error.message || error);
    const errorText = typeof error.message === 'string' ? error.message : String(error);
    if (errorText.includes('telegram_required')) {
      console.warn('Suppressed telegram_required error from user-facing reply.');
      return null;
    }
    const shortMsg = errorText.length > 200 ? errorText.substring(0, 200) + '...' : errorText;
    return `Sorry, I hit an error: ${shortMsg}`;
  }
}

export function clearHistory(userId) {
  conversationHistory.delete(userId);
}

export function clearAllHistory() {
  conversationHistory.clear();
}
