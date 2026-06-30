import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WHITELIST_PATH = join(__dirname, '..', 'whitelist.json');

function loadWhitelist() {
  if (!existsSync(WHITELIST_PATH)) {
    writeFileSync(WHITELIST_PATH, JSON.stringify({ users: [] }, null, 2));
    return { users: [] };
  }
  return JSON.parse(readFileSync(WHITELIST_PATH, 'utf-8'));
}

function saveWhitelist(data) {
  writeFileSync(WHITELIST_PATH, JSON.stringify(data, null, 2));
}

export function isWhitelisted(userId) {
  const data = loadWhitelist();
  return data.users.includes(userId);
}

export function addToWhitelist(userId) {
  const data = loadWhitelist();
  if (!data.users.includes(userId)) {
    data.users.push(userId);
    saveWhitelist(data);
    return true;
  }
  return false;
}

export function removeFromWhitelist(userId) {
  const data = loadWhitelist();
  const index = data.users.indexOf(userId);
  if (index !== -1) {
    data.users.splice(index, 1);
    saveWhitelist(data);
    return true;
  }
  return false;
}

export function getWhitelist() {
  return loadWhitelist().users;
}

export function isOwner(userId, ownerId) {
  return userId === ownerId;
}
