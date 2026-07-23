import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { Conversation, Message } from '../types';

let db: any = null;

export async function initDatabase(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    db = await SQLite.openDatabaseAsync('ziury_memory.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        preview TEXT
      );
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY NOT NULL,
        conversationId TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        modelUsed TEXT,
        FOREIGN KEY (conversationId) REFERENCES conversations (id) ON DELETE CASCADE
      );
    `);
  } catch (e) {
    console.warn('SQLite init warning:', e);
  }
}

export async function saveConversation(conv: Conversation): Promise<void> {
  if (Platform.OS === 'web' || !db) {
    saveToLocalStorage('conv_' + conv.id, conv);
    return;
  }
  await db.runAsync(
    `INSERT OR REPLACE INTO conversations (id, title, createdAt, updatedAt, provider, model, preview)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [conv.id, conv.title, conv.createdAt, conv.updatedAt, conv.provider, conv.model, conv.preview || '']
  );
}

export async function getConversations(): Promise<Conversation[]> {
  if (Platform.OS === 'web' || !db) {
    return getFromLocalStoragePrefix<Conversation>('conv_');
  }
  const rows = await db.getAllAsync('SELECT * FROM conversations ORDER BY updatedAt DESC');
  return rows as Conversation[];
}

export async function saveMessage(msg: Message): Promise<void> {
  if (Platform.OS === 'web' || !db) {
    saveToLocalStorage('msg_' + msg.id, msg);
    return;
  }
  await db.runAsync(
    `INSERT OR REPLACE INTO messages (id, conversationId, role, content, createdAt, modelUsed)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [msg.id, msg.conversationId, msg.role, msg.content, msg.createdAt, msg.modelUsed || '']
  );
}

export async function getMessagesForConversation(conversationId: string): Promise<Message[]> {
  if (Platform.OS === 'web' || !db) {
    const all = getFromLocalStoragePrefix<Message>('msg_');
    return all.filter((m) => m.conversationId === conversationId).sort((a, b) => a.createdAt - b.createdAt);
  }
  const rows = await db.getAllAsync(
    'SELECT * FROM messages WHERE conversationId = ? ORDER BY createdAt ASC',
    [conversationId]
  );
  return rows as Message[];
}

export async function deleteConversation(conversationId: string): Promise<void> {
  if (Platform.OS === 'web' || !db) {
    removeFromLocalStorage('conv_' + conversationId);
    return;
  }
  await db.runAsync('DELETE FROM messages WHERE conversationId = ?', [conversationId]);
  await db.runAsync('DELETE FROM conversations WHERE id = ?', [conversationId]);
}

// Web fallback helpers
function saveToLocalStorage(key: string, data: any) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(data));
  }
}

function getFromLocalStoragePrefix<T>(prefix: string): T[] {
  if (typeof window === 'undefined') return [];
  const results: T[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(prefix)) {
      try {
        const val = JSON.parse(window.localStorage.getItem(k) || '');
        results.push(val);
      } catch (e) {}
    }
  }
  return results;
}

function removeFromLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(key);
  }
}
