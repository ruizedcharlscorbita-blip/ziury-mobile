import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import {
  Conversation,
  Message,
  Note,
  Task,
  CalendarEvent,
  TimelineItem,
  BudgetItem,
  AIMemory,
} from '../types';

let db: any = null;

export async function initDatabase(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    db = await SQLite.openDatabaseAsync('ziury_second_brain.db');
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
        modelUsed TEXT
      );

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT,
        audioUri TEXT,
        imageUri TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        dueDate TEXT,
        isCompleted INTEGER NOT NULL DEFAULT 0,
        priority TEXT NOT NULL DEFAULT 'medium',
        category TEXT,
        createdAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT,
        location TEXT,
        isAllDay INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS timeline_items (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        refId TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS budget_items (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        note TEXT,
        timestamp INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ai_memories (
        id TEXT PRIMARY KEY NOT NULL,
        category TEXT NOT NULL,
        fact TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      );
    `);
  } catch (e) {
    console.warn('SQLite init warning:', e);
  }
}

// ── CONVERSATIONS & MESSAGES ──────────────────────────────────────────────
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

// ── NOTES ─────────────────────────────────────────────────────────────────
export async function saveNote(note: Note): Promise<void> {
  if (Platform.OS === 'web' || !db) {
    saveToLocalStorage('note_' + note.id, note);
  } else {
    await db.runAsync(
      `INSERT OR REPLACE INTO notes (id, title, content, tags, audioUri, imageUri, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        note.id,
        note.title,
        note.content,
        JSON.stringify(note.tags || []),
        note.audioUri || null,
        note.imageUri || null,
        note.createdAt,
        note.updatedAt,
      ]
    );
  }
  await addTimelineItem({
    id: 'tl_note_' + note.id,
    type: 'note',
    refId: note.id,
    title: note.title,
    summary: note.content.slice(0, 60),
    timestamp: note.createdAt,
  });
}

export async function getNotes(): Promise<Note[]> {
  if (Platform.OS === 'web' || !db) {
    return getFromLocalStoragePrefix<Note>('note_');
  }
  const rows = await db.getAllAsync('SELECT * FROM notes ORDER BY updatedAt DESC');
  return rows.map((r: any) => ({
    ...r,
    tags: r.tags ? JSON.parse(r.tags) : [],
  }));
}

export async function deleteNote(id: string): Promise<void> {
  if (Platform.OS === 'web' || !db) {
    removeFromLocalStorage('note_' + id);
    removeFromLocalStorage('tl_note_' + id);
    return;
  }
  await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
  await db.runAsync('DELETE FROM timeline_items WHERE id = ?', ['tl_note_' + id]);
}

// ── TASKS ─────────────────────────────────────────────────────────────────
export async function saveTask(task: Task): Promise<void> {
  if (Platform.OS === 'web' || !db) {
    saveToLocalStorage('task_' + task.id, task);
  } else {
    await db.runAsync(
      `INSERT OR REPLACE INTO tasks (id, title, dueDate, isCompleted, priority, category, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.title,
        task.dueDate || null,
        task.isCompleted ? 1 : 0,
        task.priority,
        task.category || 'General',
        task.createdAt,
      ]
    );
  }
  await addTimelineItem({
    id: 'tl_task_' + task.id,
    type: 'task',
    refId: task.id,
    title: task.title,
    summary: `Task (${task.priority.toUpperCase()}) ${task.isCompleted ? '✓ Completed' : 'Pending'}`,
    timestamp: task.createdAt,
  });
}

export async function getTasks(): Promise<Task[]> {
  if (Platform.OS === 'web' || !db) {
    return getFromLocalStoragePrefix<Task>('task_');
  }
  const rows = await db.getAllAsync('SELECT * FROM tasks ORDER BY createdAt DESC');
  return rows.map((r: any) => ({
    ...r,
    isCompleted: Boolean(r.isCompleted),
  }));
}

export async function deleteTask(id: string): Promise<void> {
  if (Platform.OS === 'web' || !db) {
    removeFromLocalStorage('task_' + id);
    removeFromLocalStorage('tl_task_' + id);
    return;
  }
  await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
  await db.runAsync('DELETE FROM timeline_items WHERE id = ?', ['tl_task_' + id]);
}

// ── EVENTS ────────────────────────────────────────────────────────────────
export async function saveEvent(evt: CalendarEvent): Promise<void> {
  if (Platform.OS === 'web' || !db) {
    saveToLocalStorage('evt_' + evt.id, evt);
  } else {
    await db.runAsync(
      `INSERT OR REPLACE INTO events (id, title, startDate, endDate, location, isAllDay, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        evt.id,
        evt.title,
        evt.startDate,
        evt.endDate || null,
        evt.location || null,
        evt.isAllDay ? 1 : 0,
        evt.createdAt,
      ]
    );
  }
  await addTimelineItem({
    id: 'tl_evt_' + evt.id,
    type: 'event',
    refId: evt.id,
    title: evt.title,
    summary: `Event at ${evt.startDate}`,
    timestamp: evt.createdAt,
  });
}

export async function getEvents(): Promise<CalendarEvent[]> {
  if (Platform.OS === 'web' || !db) {
    return getFromLocalStoragePrefix<CalendarEvent>('evt_');
  }
  const rows = await db.getAllAsync('SELECT * FROM events ORDER BY startDate ASC');
  return rows.map((r: any) => ({
    ...r,
    isAllDay: Boolean(r.isAllDay),
  }));
}

// ── TIMELINE ──────────────────────────────────────────────────────────────
export async function addTimelineItem(item: TimelineItem): Promise<void> {
  if (Platform.OS === 'web' || !db) {
    saveToLocalStorage('tl_' + item.id, item);
    return;
  }
  await db.runAsync(
    `INSERT OR REPLACE INTO timeline_items (id, type, refId, title, summary, timestamp)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [item.id, item.type, item.refId, item.title, item.summary, item.timestamp]
  );
}

export async function getTimelineItems(): Promise<TimelineItem[]> {
  if (Platform.OS === 'web' || !db) {
    return getFromLocalStoragePrefix<TimelineItem>('tl_').sort((a, b) => b.timestamp - a.timestamp);
  }
  const rows = await db.getAllAsync('SELECT * FROM timeline_items ORDER BY timestamp DESC');
  return rows as TimelineItem[];
}

// ── BUDGET ────────────────────────────────────────────────────────────────
export async function saveBudgetItem(item: BudgetItem): Promise<void> {
  if (Platform.OS === 'web' || !db) {
    saveToLocalStorage('bgt_' + item.id, item);
  } else {
    await db.runAsync(
      `INSERT OR REPLACE INTO budget_items (id, type, amount, category, note, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [item.id, item.type, item.amount, item.category, item.note || '', item.timestamp]
    );
  }
}

export async function getBudgetItems(): Promise<BudgetItem[]> {
  if (Platform.OS === 'web' || !db) {
    return getFromLocalStoragePrefix<BudgetItem>('bgt_').sort((a, b) => b.timestamp - a.timestamp);
  }
  const rows = await db.getAllAsync('SELECT * FROM budget_items ORDER BY timestamp DESC');
  return rows as BudgetItem[];
}

// ── AI MEMORIES ────────────────────────────────────────────────────────────
export async function saveAIMemory(mem: AIMemory): Promise<void> {
  if (Platform.OS === 'web' || !db) {
    saveToLocalStorage('mem_' + mem.id, mem);
  } else {
    await db.runAsync(
      `INSERT OR REPLACE INTO ai_memories (id, category, fact, createdAt)
       VALUES (?, ?, ?, ?)`,
      [mem.id, mem.category, mem.fact, mem.createdAt]
    );
  }
}

export async function getAIMemories(): Promise<AIMemory[]> {
  if (Platform.OS === 'web' || !db) {
    return getFromLocalStoragePrefix<AIMemory>('mem_').sort((a, b) => b.createdAt - a.createdAt);
  }
  const rows = await db.getAllAsync('SELECT * FROM ai_memories ORDER BY createdAt DESC');
  return rows as AIMemory[];
}

// ── BACKUP & DATA EXPORT/IMPORT/CLEAR ─────────────────────────────────────
export async function exportAllDataJSON(): Promise<string> {
  const notes = await getNotes();
  const tasks = await getTasks();
  const events = await getEvents();
  const timeline = await getTimelineItems();
  const budget = await getBudgetItems();
  const memories = await getAIMemories();

  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    notes,
    tasks,
    events,
    timeline,
    budget,
    memories,
  };

  return JSON.stringify(data, null, 2);
}

export async function importDataJSON(jsonStr: string): Promise<void> {
  const parsed = JSON.parse(jsonStr);
  if (Array.isArray(parsed.notes)) {
    for (const n of parsed.notes) await saveNote(n);
  }
  if (Array.isArray(parsed.tasks)) {
    for (const t of parsed.tasks) await saveTask(t);
  }
  if (Array.isArray(parsed.events)) {
    for (const e of parsed.events) await saveEvent(e);
  }
  if (Array.isArray(parsed.budget)) {
    for (const b of parsed.budget) await saveBudgetItem(b);
  }
  if (Array.isArray(parsed.memories)) {
    for (const m of parsed.memories) await saveAIMemory(m);
  }
}

export async function clearAllDatabaseData(): Promise<void> {
  if (Platform.OS === 'web' || !db) {
    if (typeof window !== 'undefined') window.localStorage.clear();
  } else {
    await db.execAsync(`
      DELETE FROM conversations;
      DELETE FROM messages;
      DELETE FROM notes;
      DELETE FROM tasks;
      DELETE FROM events;
      DELETE FROM timeline_items;
      DELETE FROM budget_items;
      DELETE FROM ai_memories;
    `);
  }
}

// ── WEB FALLBACK HELPERS ──────────────────────────────────────────────────
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

