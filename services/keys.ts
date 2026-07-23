import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { APIKeys } from '../types';

const SECURE_STORE_KEYS: Record<keyof APIKeys, string> = {
  google: 'ziury_key_google',
  anthropic: 'ziury_key_anthropic',
  openai: 'ziury_key_openai',
  groq: 'ziury_key_groq',
  openrouter: 'ziury_key_openrouter',
  cerebras: 'ziury_key_cerebras',
  mistral: 'ziury_key_mistral',
  ollamaHost: 'ziury_key_ollama_host',
  omniRouterUrl: 'ziury_key_omni_url',
  omniRouterKey: 'ziury_key_omni_key',
};

export async function saveAPIKey(provider: keyof APIKeys, key: string): Promise<void> {
  const storeKey = SECURE_STORE_KEYS[provider];
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storeKey, key);
    }
  } else {
    await SecureStore.setItemAsync(storeKey, key);
  }
}

export async function getAPIKey(provider: keyof APIKeys): Promise<string | null> {
  const storeKey = SECURE_STORE_KEYS[provider];
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(storeKey);
    }
    return null;
  }
  return await SecureStore.getItemAsync(storeKey);
}

export async function getAllAPIKeys(): Promise<APIKeys> {
  const google = await getAPIKey('google');
  const anthropic = await getAPIKey('anthropic');
  const openai = await getAPIKey('openai');
  const groq = await getAPIKey('groq');
  const openrouter = await getAPIKey('openrouter');
  const cerebras = await getAPIKey('cerebras');
  const mistral = await getAPIKey('mistral');
  const ollamaHost = await getAPIKey('ollamaHost');
  const omniRouterUrl = await getAPIKey('omniRouterUrl');
  const omniRouterKey = await getAPIKey('omniRouterKey');

  return {
    google: google || undefined,
    anthropic: anthropic || undefined,
    openai: openai || undefined,
    groq: groq || undefined,
    openrouter: openrouter || undefined,
    cerebras: cerebras || undefined,
    mistral: mistral || undefined,
    ollamaHost: ollamaHost || 'http://localhost:11434',
    omniRouterUrl: omniRouterUrl || 'http://localhost:20128/v1',
    omniRouterKey: omniRouterKey || 'sk-54ed274bf8ec01d3-007f28-3ddd2a56',
  };
}
