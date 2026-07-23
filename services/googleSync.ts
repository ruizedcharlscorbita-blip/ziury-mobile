import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { GoogleSyncStatus, Note, Task, CalendarEvent } from '../types';
import {
  saveNote,
  saveTask,
  saveEvent,
  getNotes,
  getTasks,
  getEvents,
} from './database';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_AUTH_STORAGE_KEY = 'ziury_google_auth_token';
const GOOGLE_USER_STORAGE_KEY = 'ziury_google_user_profile';

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  given_name?: string;
  picture?: string;
}

export const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/calendar.events',
];

// OAuth Discovery Document for Google
export const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export async function saveGoogleToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.setItem(GOOGLE_AUTH_STORAGE_KEY, token);
  } else {
    await SecureStore.setItemAsync(GOOGLE_AUTH_STORAGE_KEY, token);
  }
}

export async function getGoogleToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') return window.localStorage.getItem(GOOGLE_AUTH_STORAGE_KEY);
    return null;
  }
  return await SecureStore.getItemAsync(GOOGLE_AUTH_STORAGE_KEY);
}

export async function saveGoogleUser(profile: GoogleUserProfile): Promise<void> {
  const json = JSON.stringify(profile);
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.setItem(GOOGLE_USER_STORAGE_KEY, json);
  } else {
    await SecureStore.setItemAsync(GOOGLE_USER_STORAGE_KEY, json);
  }
}

export async function getGoogleUser(): Promise<GoogleUserProfile | null> {
  try {
    let json: string | null = null;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') json = window.localStorage.getItem(GOOGLE_USER_STORAGE_KEY);
    } else {
      json = await SecureStore.getItemAsync(GOOGLE_USER_STORAGE_KEY);
    }
    return json ? JSON.parse(json) : null;
  } catch (e) {
    return null;
  }
}

export async function logoutGoogle(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(GOOGLE_AUTH_STORAGE_KEY);
      window.localStorage.removeItem(GOOGLE_USER_STORAGE_KEY);
    }
  } else {
    await SecureStore.deleteItemAsync(GOOGLE_AUTH_STORAGE_KEY);
    await SecureStore.deleteItemAsync(GOOGLE_USER_STORAGE_KEY);
  }
}

// Fetch Google User Profile
export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleUserProfile | null> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.ok) {
      const data = await response.json();
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        given_name: data.given_name,
        picture: data.picture,
      };
    }
  } catch (err) {
    console.warn('Failed to fetch Google User Info:', err);
  }
  return null;
}

// Import Real Data from Google APIs
export async function syncGoogleData(accessToken: string): Promise<{
  tasksCount: number;
  eventsCount: number;
}> {
  const now = Date.now();
  let tasksCount = 0;
  let eventsCount = 0;

  // 1. Fetch Real Google Tasks
  try {
    const taskListsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (taskListsRes.ok) {
      const taskListsData = await taskListsRes.json();
      const primaryList = taskListsData.items?.[0]?.id || '@default';

      const tasksRes = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${primaryList}/tasks`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        if (tasksData.items) {
          for (const item of tasksData.items) {
            const taskObj: Task = {
              id: 'gtask_' + item.id,
              title: item.title || 'Untitled Task',
              dueDate: item.due ? item.due.split('T')[0] : undefined,
              isCompleted: item.status === 'completed',
              priority: 'medium',
              category: 'Google Tasks',
              createdAt: now,
            };
            await saveTask(taskObj);
            tasksCount++;
          }
        }
      }
    }
  } catch (e) {
    console.warn('Google Tasks API sync warning:', e);
  }

  // 2. Fetch Real Google Calendar Events
  try {
    const timeMin = new Date().toISOString();
    const calendarRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=20&singleEvents=true&orderBy=startTime`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (calendarRes.ok) {
      const calData = await calendarRes.json();
      if (calData.items) {
        for (const item of calData.items) {
          const start = item.start?.dateTime || item.start?.date || now;
          const evtObj: CalendarEvent = {
            id: 'gevent_' + item.id,
            title: item.summary || 'Google Calendar Event',
            startDate: typeof start === 'string' ? start.replace('T', ' ').slice(0, 16) : new Date(start).toISOString(),
            location: item.location || 'Google Calendar',
            isAllDay: !item.start?.dateTime,
            createdAt: now,
          };
          await saveEvent(evtObj);
          eventsCount++;
        }
      }
    }
  } catch (e) {
    console.warn('Google Calendar API sync warning:', e);
  }

  return { tasksCount, eventsCount };
}
