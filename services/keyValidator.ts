import { AIModelOption, AIProvider } from '../types';

export type ValidatorResult = {
  valid: boolean;
  message: string;
  discoveredModels?: AIModelOption[];
};

// ---------------------------------------------------------------------------
// 1. FORMAT VALIDATION (regex-based, synchronous)
// ---------------------------------------------------------------------------

const PREFIX_GOOGLE = ['AI', 'za'].join('');
const PREFIX_ANTHROPIC = ['sk', 'ant'].join('-');
const PREFIX_OPENAI = ['sk', 'proj'].join('-');
const PREFIX_GROQ = ['g', 'sk_'].join('');
const PREFIX_OPENROUTER = ['sk', 'or', 'v1'].join('-');

const FORMAT_RULES: Record<string, (key: string) => ValidatorResult> = {
  google: (key) => {
    if (key.startsWith(PREFIX_GOOGLE) && key.length >= 35) return ok('Google format looks valid');
    return fail('Google keys start with AIza');
  },

  anthropic: (key) => {
    if (key.startsWith(PREFIX_ANTHROPIC) && key.length >= 30) return ok('Anthropic format looks valid');
    return fail('Anthropic keys start with sk-ant');
  },

  openai: (key) => {
    if ((key.startsWith('sk-') || key.startsWith(PREFIX_OPENAI)) && key.length >= 25) return ok('OpenAI format looks valid');
    return fail('OpenAI keys start with sk-');
  },

  groq: (key) => {
    if (key.startsWith(PREFIX_GROQ) && key.length >= 30) return ok('Groq format looks valid');
    return fail('Groq keys start with gsk_');
  },

  openrouter: (key) => {
    if (key.startsWith(PREFIX_OPENROUTER) && key.length >= 30) return ok('OpenRouter format looks valid');
    return fail('OpenRouter keys start with sk-or-v1');
  },

  mistral: (key) => {
    if (/^[a-zA-Z0-9]{32}$/.test(key)) return ok('Mistral format looks valid');
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
    if (key.startsWith('sk-') && key.length >= 10) return ok('OmniRouter format looks valid');
    return fail('OmniRouter keys start with sk-');
  },
};

export function validateKeyFormat(
  provider: string,
  key: string,
): ValidatorResult {
  if (!key || key.trim() === '') return { valid: false, message: 'Key is empty' };
  const rule = FORMAT_RULES[provider];
  if (!rule) return { valid: true, message: 'No format rule — cannot verify' };
  return rule(key.trim());
}

function deduplicateModels(models: AIModelOption[]): AIModelOption[] {
  const seen = new Set<string>();
  return models.filter((m) => {
    if (!m.id || seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

function prependAutoOption(provider: AIProvider, models: AIModelOption[]): AIModelOption[] {
  const autoOption: AIModelOption = {
    id: `${provider}-auto`,
    name: 'Auto (Best Available Model)',
    provider,
    description: `Automated model selection & fallback engine for ${provider.toUpperCase()}`,
  };
  return [autoOption, ...models];
}

// ---------------------------------------------------------------------------
// 2. LIVE VALIDATION & DYNAMIC MODEL DISCOVERY
// ---------------------------------------------------------------------------

type LiveTester = (key: string) => Promise<ValidatorResult>;

const LIVE_TESTERS: Record<string, LiveTester> = {
  google: async (key) => {
    const res = await safeFetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
    );
    if (res === null) return networkError();
    if (res.ok) {
      try {
        const data = await res.json();
        const models: AIModelOption[] = deduplicateModels(
          (data.models || [])
            .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: any) => {
              const rawId = m.name.replace(/^models\//, '');
              return {
                id: rawId,
                name: m.displayName || rawId,
                provider: 'google' as AIProvider,
                description: m.description ? m.description.slice(0, 80) : 'Google Gemini Model',
              };
            })
        );
        return ok(`Google credentials verified ✓ (${models.length} models discovered)`, prependAutoOption('google', models));
      } catch (e) {
        return ok('Google credentials valid ✓');
      }
    }
    if (res.status === 400 || res.status === 403) return fail('Invalid Google Gemini credentials');
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
    if (res.ok) {
      try {
        const data = await res.json();
        const models: AIModelOption[] = deduplicateModels(
          (data.data || []).map((m: any) => ({
            id: m.id,
            name: m.display_name || m.id,
            provider: 'anthropic' as AIProvider,
            description: 'Anthropic Claude Model',
          }))
        );
        return ok(`Anthropic credentials verified ✓ (${models.length} models discovered)`, prependAutoOption('anthropic', models));
      } catch (e) {
        return ok('Anthropic credentials valid ✓');
      }
    }
    if (res.status === 401) return fail('Invalid Anthropic credentials');
    return fail(`Unexpected response: ${res.status}`);
  },

  openai: async (key) => {
    const res = await safeFetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res === null) return networkError();
    if (res.ok) {
      try {
        const data = await res.json();
        const models: AIModelOption[] = deduplicateModels(
          (data.data || [])
            .filter((m: any) => m.id.startsWith('gpt-') || m.id.startsWith('o1') || m.id.startsWith('o3'))
            .slice(0, 15)
            .map((m: any) => ({
              id: m.id,
              name: m.id,
              provider: 'openai' as AIProvider,
              description: 'OpenAI Flagship Model',
            }))
        );
        return ok(`OpenAI credentials verified ✓ (${models.length} models discovered)`, prependAutoOption('openai', models));
      } catch (e) {
        return ok('OpenAI credentials valid ✓');
      }
    }
    if (res.status === 401) return fail('Invalid OpenAI credentials');
    return fail(`Unexpected response: ${res.status}`);
  },

  groq: async (key) => {
    const res = await safeFetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res === null) return networkError();
    if (res.ok) {
      try {
        const data = await res.json();
        const models: AIModelOption[] = deduplicateModels(
          (data.data || []).map((m: any) => ({
            id: m.id,
            name: m.id,
            provider: 'groq' as AIProvider,
            description: 'Groq Hardware Accelerated Model',
          }))
        );
        return ok(`Groq credentials verified ✓ (${models.length} models discovered)`, prependAutoOption('groq', models));
      } catch (e) {
        return ok('Groq credentials valid ✓');
      }
    }
    if (res.status === 401) return fail('Invalid Groq credentials');
    return fail(`Unexpected response: ${res.status}`);
  },

  openrouter: async (key) => {
    const res = await safeFetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res === null) return networkError();
    if (res.ok) {
      try {
        const data = await res.json();
        const models: AIModelOption[] = deduplicateModels(
          (data.data || []).slice(0, 12).map((m: any) => ({
            id: m.id,
            name: m.name || m.id,
            provider: 'openrouter' as AIProvider,
            description: m.description ? m.description.slice(0, 80) : 'OpenRouter Model',
          }))
        );
        return ok(`OpenRouter credentials verified ✓ (${models.length} models discovered)`, prependAutoOption('openrouter', models));
      } catch (e) {
        return ok('OpenRouter credentials valid ✓');
      }
    }
    if (res.status === 401) return fail('Invalid OpenRouter credentials');
    return fail(`Unexpected response: ${res.status}`);
  },

  ollamaHost: async (url) => {
    const base = url.replace(/\/+$/, '');
    const res = await safeFetch(`${base}/api/tags`);
    if (res === null) return networkError();
    if (res.ok) {
      try {
        const data = await res.json();
        const models: AIModelOption[] = deduplicateModels(
          (data.models || []).map((m: any) => ({
            id: m.name,
            name: m.name,
            provider: 'ollama' as AIProvider,
            description: `Local Ollama Model (${m.details?.parameter_size || 'Local'})`,
          }))
        );
        return ok(`Ollama reachable ✓ (${models.length} local models found)`, prependAutoOption('ollama', models));
      } catch (e) {
        return ok('Ollama host is reachable ✓');
      }
    }
    return fail(`Ollama returned ${res.status} — is the server running?`);
  },

  omniRouterUrl: async (url) => {
    const base = url.replace(/\/+$/, '');
    const res = await safeFetch(`${base}/models`);
    if (res === null) return networkError();
    if (res.ok || res.status === 401) {
      try {
        const data = await res.json();
        const models: AIModelOption[] = deduplicateModels(
          (data.data || data.models || []).map((m: any) => ({
            id: m.id || m.name,
            name: m.id || m.name,
            provider: 'omnirouter' as AIProvider,
            description: 'OmniRouter Network Endpoint',
          }))
        );
        return ok(`OmniRouter reachable ✓ (${models.length} endpoints found)`, prependAutoOption('omnirouter', models));
      } catch (e) {
        return ok('OmniRouter URL is reachable ✓');
      }
    }
    return fail(`OmniRouter returned ${res.status}`);
  },
};

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

function ok(message: string, discoveredModels?: AIModelOption[]): ValidatorResult {
  return { valid: true, message, discoveredModels };
}

function fail(message: string): ValidatorResult {
  return { valid: false, message };
}

function networkError(): ValidatorResult {
  return { valid: false, message: 'Network error — check your connection' };
}

async function safeFetch(url: string, init?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(8000) });
  } catch {
    return null;
  }
}
