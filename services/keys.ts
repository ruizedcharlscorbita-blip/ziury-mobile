import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { APIKeys } from '../types';

const SECURE_STORE_KEYS = {
  google: 'ziury_api_key_google',
  anthropic: 'ziury_api_key_anthropic',
  openai: 'ziury_api_key_openai',
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
  return {
    google: google || undefined,
    anthropic: anthropic || undefined,
    openai: openai || undefined,
  };
}

export async function deleteAPIKey(provider: keyof APIKeys): Promise<void> {
  const storeKey = SECURE_STORE_KEYS[provider];
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storeKey);
    }
  } else {
    await SecureStore.deleteItemAsync(storeKey);
  }
}
