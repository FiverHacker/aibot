import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUTOREPLY_PATH = join(__dirname, '..', 'autoReplies.json');

function loadAutoReplies() {
  if (!existsSync(AUTOREPLY_PATH)) {
    writeFileSync(AUTOREPLY_PATH, JSON.stringify({ replies: {} }, null, 2));
    return { replies: {} };
  }
  return JSON.parse(readFileSync(AUTOREPLY_PATH, 'utf-8'));
}

function saveAutoReplies(data) {
  writeFileSync(AUTOREPLY_PATH, JSON.stringify(data, null, 2));
}

export function getAutoReplies() {
  return loadAutoReplies().replies;
}

export function setAutoReply(keyword, response) {
  const data = loadAutoReplies();
  data.replies[keyword.toLowerCase()] = response;
  saveAutoReplies(data);
  return true;
}

export function removeAutoReply(keyword) {
  const data = loadAutoReplies();
  const key = keyword.toLowerCase();
  if (data.replies[key]) {
    delete data.replies[key];
    saveAutoReplies(data);
    return true;
  }
  return false;
}

export function listAutoReplies() {
  return loadAutoReplies().replies;
}

export function checkAutoReply(content) {
  const replies = getAutoReplies();
  const lower = content.toLowerCase();
  for (const [keyword, response] of Object.entries(replies)) {
    if (lower.includes(keyword)) {
      return response;
    }
  }
  return null;
}
