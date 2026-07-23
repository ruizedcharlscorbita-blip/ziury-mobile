export type AIProvider = 'google' | 'anthropic' | 'openai';

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
