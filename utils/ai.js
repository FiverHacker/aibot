import OpenAI from 'openai';
import config from '../config.json' with { type: 'json' };
import { executeToolCall } from './moderation.js';
import { MODERATION_TOOLS } from './moderation.js';

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

const ACTION_PROMPT = `You are an AI Discord server manager. You have FULL access to manage the server via tool calls.

When the user asks you to DO something (kick, ban, purge, create channels/roles, setup server, send messages, etc.), you MUST use a <tool_call> XML block. You can wrap it in conversation.

Format:
<tool_call>
<function=server.invoke tool="toolName" arguments={...json args...}>
</function>
</tool_call>

Examples:
- kick someone: Hello <tool_call>\n<function=server.invoke tool="kickUser" arguments={"userId":"@user","reason":"spamming"}>\n</function>\n</tool_call>
- create a category: Creating category now! <tool_call>\n<function=server.invoke tool="createChannel" arguments={"name":"development","type":"category"}>\n</function>\n</tool_call>
- create text channel under a category: <tool_call>\n<function=server.invoke tool="createChannel" arguments={"name":"general-chat","type":"text","parent":"development"}>\n</function>\n</tool_call>
- send message: Done! <tool_call>\n<function=server.invoke tool="sendToChannel" arguments={"content":"Hello everyone!"}>\n</function>\n</tool_call>
- list all channels: <tool_call>\n<function=server.invoke tool="listChannels" arguments={}>\n</function>\n</tool_call>
- create role: <tool_call>\n<function=server.invoke tool="createRole" arguments={"name":"Developer","color":"#3498DB"}>\n</function>\n</tool_call>
- delete all voice channels: <tool_call>\n<function=server.invoke tool="deleteChannelsByType" arguments={"type":"voice"}>\n</function>\n</tool_call>
- set channel topic: <tool_call>\n<function=server.invoke tool="setChannelTopic" arguments={"topic":"Welcome to the server!","channelId":"rules"}>\n</function>\n</tool_call>

Available tools: createChannel, deleteChannel, renameChannel, setChannelTopic, sendToChannel, sendToUser, say, addRole, removeRole, kickUser, banUser, unbanUser, timeoutUser, purgeMessages, announce, createRole, deleteRole, serverOwner, memberCount, serverInfo, listChannels, listRoles, onlineMembers, offlineMembers, userInfo, userJoinedAt, deleteAllChannels, deleteChannelsByType

When setting up a server: create categories first using createChannel with type="category", then create text channels with parent="categoryName". The AI decides the structure.

For normal conversation (questions, jokes, advice), just respond with regular text — no tool calls needed.`;

function extractXMLToolCalls(text) {
  const results = [];
  const regex = /<tool_call>\s*<function=server\.invoke tool="([^"]+)" arguments=(\{[\s\S]*?\})>\s*<\/function>\s*<\/tool_call>/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    try {
      const args = JSON.parse(match[2]);
      results.push({ action: match[1], args });
    } catch (e) {
      console.warn('Failed to parse tool_call arguments:', e.message);
    }
  }
  return results.length > 0 ? results : null;
}

function extractJSONActions(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(item => ({ action: item.action, args: item.args || {} }));
    } catch {}
  }

  const blockMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
  if (blockMatch) {
    try {
      const parsed = JSON.parse(blockMatch[0]);
      if (Array.isArray(parsed)) return parsed.map(item => ({ action: item.action, args: item.args || {} }));
    } catch {}
  }

  return null;
}

function extractActions(text) {
  return extractXMLToolCalls(text) || extractJSONActions(text);
}

function stripActionBlocks(text) {
  let cleaned = text.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, '').trim();
  cleaned = cleaned.replace(/\[\s*\{[\s\S]*?\}\s*\]/g, '').trim();
  return cleaned;
}

export async function askAI(userId, userName, message, channelName, context = null, enhancedMessage = null) {
  if (!config.ai.enabled) return null;

  if (!config.ai.apiKey || config.ai.apiKey.length < 10 || config.ai.apiKey.includes('YOUR_')) {
    return "AI is not configured yet. Set a valid API key in config.json or use environment variable AI_API_KEY.";
  }

  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }

  const history = conversationHistory.get(userId);

  history.push({ role: 'user', content: `${userName}: ${message}` });

  if (history.length > config.ai.maxHistory * 2) {
    history.splice(0, 2);
  }

  const canAct = context && context.userId === config.ownerId;

  const systemMessages = [
    { role: 'system', content: config.ai.systemPrompt },
    { role: 'system', content: `Current channel: #${channelName}` },
  ];

  if (canAct) {
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

    const apiOptions = {
      model: config.ai.model,
      messages,
      max_tokens: 800,
      temperature: 0.7,
    };

    if (canAct) {
      apiOptions.tools = MODERATION_TOOLS;
    }

    const response = await openai.chat.completions.create(apiOptions);

    const choice = response.choices[0]?.message;
    const text = choice?.content || '';
    const trimmed = text.trim();

    let actions = null;

    if (canAct && choice?.tool_calls && choice.tool_calls.length > 0) {
      actions = choice.tool_calls.map(tc => ({
        action: tc.function.name,
        args: JSON.parse(tc.function.arguments || '{}'),
      }));
    }

    if (canAct && !actions) {
      actions = extractActions(trimmed);
    }

    if (canAct && actions && actions.length > 0) {
      const resultLines = [];
      for (const action of actions) {
        const result = await executeToolCall(action.action, action.args || {}, context);
        resultLines.push(result.success ? result.result : result.error);
      }
      const actionResults = resultLines.join('\n');
      const cleanText = stripActionBlocks(trimmed);
      const reply = truncate([cleanText, actionResults].filter(Boolean).join('\n\n'));
      history.push({ role: 'assistant', content: reply });
      return reply;
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
