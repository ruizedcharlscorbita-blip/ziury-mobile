/**
 * services/keyValidator.ts
 *
 * Validates API keys for every BYOK provider used in Ziury.
 *
 * Two-level validation:
 *  1. FORMAT – cheap regex check (instant, no network).
 *  2. LIVE   – minimal authenticated request to provider (async, returns 401/403 on bad key).
 *
 * Usage:
 *   import { validateKeyFormat, testKeyLive } from '../services/keyValidator';
 *
 *   const fmt = validateKeyFormat('openai', key);   // { valid, message }
 *   const live = await testKeyLive('openai', key);  // { valid, message }
 */

export type ValidatorResult = {
  valid: boolean;
  message: string;
};

// ---------------------------------------------------------------------------
// 1. FORMAT VALIDATION (regex-based, synchronous)
// ---------------------------------------------------------------------------

/**
 * Known prefix/length patterns for each provider.
 * Intentionally permissive — enough to catch obvious typos.
 */
const FORMAT_RULES: Record<string, (key: string) => ValidatorResult> = {
  google: (key) => {
    // Google AI Studio keys start with "AIza" and are 39 chars total
    if (/^AIza[0-9A-Za-z_-]{35}$/.test(key)) return ok('Google key looks valid');
    return fail('Google keys start with "AIza" and are 39 characters');
  },

  anthropic: (key) => {
    // Anthropic keys start with "sk-ant-"
    if (/^sk-ant-[a-zA-Z0-9_-]{40,}$/.test(key)) return ok('Anthropic key looks valid');
    return fail('Anthropic keys start with "sk-ant-"');
  },

  openai: (key) => {
    // OpenAI project keys: "sk-proj-" or legacy "sk-"
    if (/^sk-(proj-)?[a-zA-Z0-9_-]{32,}$/.test(key)) return ok('OpenAI key looks valid');
    return fail('OpenAI keys start with "sk-" or "sk-proj-"');
  },

  groq: (key) => {
    // Groq keys start "gsk_"
    if (/^gsk_[a-zA-Z0-9]{40,}$/.test(key)) return ok('Groq key looks valid');
    return fail('Groq keys start with "gsk_"');
  },

  openrouter: (key) => {
    // OpenRouter keys start "sk-or-v1-"
    if (/^sk-or-v1-[a-zA-Z0-9]{40,}$/.test(key)) return ok('OpenRouter key looks valid');
    return fail('OpenRouter keys start with "sk-or-v1-"');
  },

  cerebras: (key) => {
    // Cerebras keys start "csk-"
    if (/^csk-[a-zA-Z0-9]{40,}$/.test(key)) return ok('Cerebras key looks valid');
    return fail('Cerebras keys start with "csk-"');
  },

  mistral: (key) => {
    // Mistral keys are 32 alphanumeric characters
    if (/^[a-zA-Z0-9]{32}$/.test(key)) return ok('Mistral key looks valid');
    return fail('Mistral keys are 32 alphanumeric characters');
  },

  ollamaHost: (url) => {
    try {
      new URL(url);
      return ok('Ollama host URL looks valid');
    } catch {
      return fail('Must be a valid URL (e.g. http://localhost:11434)');
    }
  },

  omniRouterUrl: (url) => {
    try {
      new URL(url);
      return ok('OmniRouter URL looks valid');
    } catch {
      return fail('Must be a valid URL (e.g. http://localhost:20128/v1)');
    }
  },

  omniRouterKey: (key) => {
    // OmniRouter local keys: "sk-" prefix
    if (/^sk-[a-zA-Z0-9_-]{8,}$/.test(key)) return ok('OmniRouter key looks valid');
    return fail('OmniRouter keys start with "sk-"');
  },
};

/**
 * Synchronous format check. Returns instantly — no network call.
 */
export function validateKeyFormat(
  provider: string,
  key: string,
): ValidatorResult {
  if (!key || key.trim() === '') return { valid: false, message: 'Key is empty' };
  const rule = FORMAT_RULES[provider];
  if (!rule) return { valid: true, message: 'No format rule — cannot verify' };
  return rule(key.trim());
}

// ---------------------------------------------------------------------------
// 2. LIVE VALIDATION (actual authenticated API call, async)
// ---------------------------------------------------------------------------

type LiveTester = (key: string) => Promise<ValidatorResult>;

const LIVE_TESTERS: Record<string, LiveTester> = {
  google: async (key) => {
    const res = await safeFetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
    );
    if (res === null) return networkError();
    if (res.ok) return ok('Google key is valid ✓');
    if (res.status === 400 || res.status === 403) return fail('Invalid Google Gemini API key');
    return fail(`Unexpected response: ${res.status}`);
  },

  anthropic: async (key) => {
    const res = await safeFetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
    });
    if (res === null) return networkError();
    if (res.ok) return ok('Anthropic key is valid ✓');
    if (res.status === 401) return fail('Invalid Anthropic API key');
    return fail(`Unexpected response: ${res.status}`);
  },

  openai: async (key) => {
    const res = await safeFetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res === null) return networkError();
    if (res.ok) return ok('OpenAI key is valid ✓');
    if (res.status === 401) return fail('Invalid OpenAI API key');
    return fail(`Unexpected response: ${res.status}`);
  },

  groq: async (key) => {
    const res = await safeFetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res === null) return networkError();
    if (res.ok) return ok('Groq key is valid ✓');
    if (res.status === 401) return fail('Invalid Groq API key');
    return fail(`Unexpected response: ${res.status}`);
  },

  openrouter: async (key) => {
    const res = await safeFetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res === null) return networkError();
    if (res.ok) return ok('OpenRouter key is valid ✓');
    if (res.status === 401) return fail('Invalid OpenRouter API key');
    return fail(`Unexpected response: ${res.status}`);
  },

  ollamaHost: async (url) => {
    const base = url.replace(/\/+$/, '');
    const res = await safeFetch(`${base}/api/tags`);
    if (res === null) return networkError();
    if (res.ok) return ok('Ollama is reachable ✓');
    return fail(`Ollama returned ${res.status} — is the server running?`);
  },

  omniRouterUrl: async (url) => {
    const base = url.replace(/\/+$/, '');
    const res = await safeFetch(`${base}/models`);
    if (res === null) return networkError();
    if (res.ok || res.status === 401) return ok('OmniRouter URL is reachable ✓');
    return fail(`OmniRouter returned ${res.status}`);
  },
};

/**
 * Async live test — makes a real API request to confirm the key works.
 * Times out after 8 seconds.
 */
export async function testKeyLive(
  provider: string,
  key: string,
): Promise<ValidatorResult> {
  if (!key || key.trim() === '') return fail('Key is empty');
  const tester = LIVE_TESTERS[provider];
  if (!tester) return { valid: true, message: 'Live test not available for this provider' };
  try {
    return await tester(key.trim());
  } catch (e: any) {
    return fail(`Test error: ${e?.message ?? 'Unknown error'}`);
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function ok(message: string): ValidatorResult {
  return { valid: true, message };
}

function fail(message: string): ValidatorResult {
  return { valid: false, message };
}

function networkError(): ValidatorResult {
  return { valid: false, message: 'Network error — check your connection' };
}

/** Wraps fetch; returns null on network failure instead of throwing. */
async function safeFetch(url: string, init?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(8000) });
  } catch {
    return null;
  }
}
