export type AIProvider =
  | 'google'
  | 'anthropic'
  | 'openai'
  | 'groq'
  | 'openrouter'
  | 'cerebras'
  | 'mistral'
  | 'ollama'
  | 'omnirouter';

export interface AIModelOption {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
}

export interface APIKeys {
  google?: string;
  anthropic?: string;
  openai?: string;
  groq?: string;
  openrouter?: string;
  cerebras?: string;
  mistral?: string;
  ollamaHost?: string;
  omniRouterUrl?: string;
  omniRouterKey?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  modelUsed?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  provider: AIProvider;
  model: string;
  preview?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  audioUri?: string;
  imageUri?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  title: string;
  dueDate?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  createdAt: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
  isAllDay?: boolean;
  createdAt: number;
}

export type TimelineType = 'note' | 'task' | 'event' | 'photo' | 'voice' | 'chat';

export interface TimelineItem {
  id: string;
  type: TimelineType;
  refId: string;
  title: string;
  summary: string;
  timestamp: number;
}

export interface BudgetItem {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note?: string;
  timestamp: number;
}

export interface GoogleSyncStatus {
  connected: boolean;
  accountEmail: string;
  lastSyncedAt?: number;
  syncedNotesCount: number;
  syncedTasksCount: number;
  syncedEventsCount: number;
}
