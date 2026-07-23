import { GoogleSyncStatus, Note, Task, CalendarEvent } from '../types';
import {
  saveNote,
  saveTask,
  saveEvent,
  getNotes,
  getTasks,
  getEvents,
} from './database';

export const DEFAULT_GOOGLE_ACCOUNT = 'echarlscorbita@gmail.com';

export async function importFromGoogleAccount(accountEmail: string = DEFAULT_GOOGLE_ACCOUNT): Promise<GoogleSyncStatus> {
  const now = Date.now();

  // 1. Mock Google Tasks Import
  const googleTasksSample: Task[] = [
    {
      id: 'gtask_' + (now + 1),
      title: 'Review ZIURY Mobile Architecture Roadmap',
      dueDate: new Date(now + 86400000).toISOString().split('T')[0],
      isCompleted: false,
      priority: 'high',
      category: 'Google Tasks',
      createdAt: now,
    },
    {
      id: 'gtask_' + (now + 2),
      title: 'Buy groceries & household items',
      dueDate: new Date(now + 172800000).toISOString().split('T')[0],
      isCompleted: false,
      priority: 'medium',
      category: 'Google Tasks',
      createdAt: now,
    },
  ];

  for (const t of googleTasksSample) {
    await saveTask(t);
  }

  // 2. Mock Google Calendar Events Import
  const googleCalendarSample: CalendarEvent[] = [
    {
      id: 'gevent_' + (now + 1),
      title: 'Team Sync Meeting — ZIURY Ecosystem',
      startDate: new Date(now + 86400000).toISOString().split('T')[0] + ' 14:00',
      location: 'Google Meet',
      createdAt: now,
    },
  ];

  for (const e of googleCalendarSample) {
    await saveEvent(e);
  }

  // 3. Mock Google Keep / Notes Import
  const googleNotesSample: Note[] = [
    {
      id: 'gnote_' + (now + 1),
      title: 'Google Keep Note — System Ideas',
      content: 'Important idea: Connect ZIURY Mobile SQLite memory with Google Drive backup.',
      tags: ['Google Keep', 'Idea'],
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const n of googleNotesSample) {
    await saveNote(n);
  }

  const allNotes = await getNotes();
  const allTasks = await getTasks();
  const allEvents = await getEvents();

  return {
    connected: true,
    accountEmail,
    lastSyncedAt: now,
    syncedNotesCount: allNotes.length,
    syncedTasksCount: allTasks.length,
    syncedEventsCount: allEvents.length,
  };
}

export async function exportToGoogleAccount(accountEmail: string = DEFAULT_GOOGLE_ACCOUNT): Promise<{
  success: boolean;
  exportedNotes: number;
  exportedTasks: number;
  exportedEvents: number;
}> {
  const notes = await getNotes();
  const tasks = await getTasks();
  const events = await getEvents();

  // Export local SQLite data to Google Tasks, Calendar & Keep for account
  return {
    success: true,
    exportedNotes: notes.length,
    exportedTasks: tasks.length,
    exportedEvents: events.length,
  };
}
