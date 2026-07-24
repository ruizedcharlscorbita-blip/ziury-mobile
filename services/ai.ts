import { AIProvider, Message } from '../types';
import { getAPIKey, getAllDiscoveredModels } from './keys';
import {
  getAIMemories,
  getTasks,
  getEvents,
  getNotes,
  getBudgetItems,
} from './database';

async function parseSafeResponse(response: Response): Promise<{ data: any; rawText: string; isJson: boolean }> {
  const rawText = await response.text();
  try {
    const data = JSON.parse(rawText);
    return { data, rawText, isJson: true };
  } catch (e) {
    return { data: null, rawText, isJson: false };
  }
}

function cleanAIResponseText(rawText: string): string {
  if (!rawText) return '';
  let cleaned = rawText;

  // 1. Remove <thought>...</thought> or <reasoning>...</reasoning> blocks
  cleaned = cleaned.replace(/<thought>[\s\S]*?<\/thought>/gi, '');
  cleaned = cleaned.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '');

  // 2. Filter out internal chain-of-thought planning bullet lines
  const lines = cleaned.split('\n');
  const filteredLines: string[] = [];
  let isInsideThinkingBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith('* The user said') ||
      trimmed.startsWith('* The previous context') ||
      trimmed.startsWith('* Acknowledge the') ||
      trimmed.startsWith('* Maintain the') ||
      trimmed.startsWith('* Provide a quick status') ||
      trimmed.startsWith('* Call to Action') ||
      trimmed.startsWith('* Keep it casual') ||
      trimmed.startsWith('* Greeting:') ||
      trimmed.startsWith('* Status Update:')
    ) {
      isInsideThinkingBlock = true;
      continue;
    }
    if (isInsideThinkingBlock && (trimmed.startsWith('*') || trimmed === '')) {
      continue;
    } else {
      isInsideThinkingBlock = false;
      filteredLines.push(line);
    }
  }

  cleaned = filteredLines.join('\n').trim();
  return cleaned;
}

async function buildFullAppContext(): Promise<string> {
  const contextParts: string[] = [];
  const nowStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  contextParts.push(`Current Time: ${nowStr}`);

  try {
    const tasks = await getTasks();
    const pendingTasks = tasks.filter((t) => !t.isCompleted);
    if (pendingTasks.length > 0) {
      const taskLines = pendingTasks.slice(0, 8).map(
        (t) => `- [${t.priority.toUpperCase()}] ${t.title}${t.dueDate ? ` (Due: ${t.dueDate})` : ''}`
      ).join('\n');
      contextParts.push(`📋 PENDING TASKS (${pendingTasks.length} total):\n${taskLines}`);
    } else if (tasks.length > 0) {
      contextParts.push(`📋 TASKS: All tasks are completed! ✓`);
    } else {
      contextParts.push(`📋 TASKS: No active tasks registered.`);
    }
  } catch (e) {}

  try {
    const events = await getEvents();
    if (events.length > 0) {
      const eventLines = events.slice(0, 5).map(
        (e) => `- ${e.title} at ${e.startDate}${e.location ? ` (${e.location})` : ''}`
      ).join('\n');
      contextParts.push(`📅 CALENDAR SCHEDULE:\n${eventLines}`);
    } else {
      contextParts.push(`📅 CALENDAR: No upcoming events.`);
    }
  } catch (e) {}

  try {
    const budget = await getBudgetItems();
    if (budget.length > 0) {
      let income = 0;
      let expenses = 0;
      budget.forEach((b) => {
        if (b.type === 'income') income += b.amount;
        else expenses += b.amount;
      });
      const net = income - expenses;
      contextParts.push(
        `💵 BUDGET OVERVIEW (₱ PHP):\nTotal Income: ₱${income.toFixed(2)} | Total Expenses: ₱${expenses.toFixed(2)} | Net Balance: ₱${net.toFixed(2)}`
      );
    }
  } catch (e) {}

  try {
    const notes = await getNotes();
    if (notes.length > 0) {
      const noteLines = notes.slice(0, 5).map(
        (n) => `- "${n.title}": ${n.content.slice(0, 60)}`
      ).join('\n');
      contextParts.push(`📝 RECENT NOTES:\n${noteLines}`);
    }
  } catch (e) {}

  try {
    const memories = await getAIMemories();
    if (memories.length > 0) {
      const memoryLines = memories.slice(0, 5).map(
        (m) => `- [${m.category}]: ${m.fact}`
      ).join('\n');
      contextParts.push(`🧠 SAVED USER MEMORIES & FACTS:\n${memoryLines}`);
    }
  } catch (e) {}

  return `You are Ziury, an intelligent, friendly, and efficient personal Second Brain AI assistant.

CRITICAL ASSISTANT DIRECTIVES:
- Provide ONLY your final, natural, direct answer to the user.
- NEVER output internal thinking steps, chain-of-thought analysis, prompt restatements, or planning bullet points.
- Structure your response cleanly with good paragraph spacing and bullet points so it is easy to read on mobile screens.
- Use relevant emojis/icons naturally (e.g. 📋 for tasks, 📅 for schedule, 💵 for budget) when discussing user data, but keep tone conversational and concise.

[ZIURY REAL-TIME SECOND BRAIN CONTEXT]
${contextParts.join('\n\n')}`;
}

// ---------------------------------------------------------------------------
// PROVIDER CALLERS WITH MULTI-MODEL FALLBACK QUEUES
// ---------------------------------------------------------------------------

async function callGoogleWithFallback(key: string, requestedModel: string, processedMessages: Message[]): Promise<string | null> {
  const discoveredMap = await getAllDiscoveredModels();
  const discoveredGoogle = (discoveredMap['google'] || []).map((m) => m.id).filter((id) => !id.endsWith('-auto'));

  const candidates = Array.from(new Set([
    requestedModel,
    ...discoveredGoogle,
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.0-pro',
  ])).filter((m) => m && !m.includes('-auto') && m !== 'auto');

  for (const targetModel of candidates) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: processedMessages.map((m) => ({
              role: m.role === 'user' ? 'user' : m.role === 'system' ? 'user' : 'model',
              parts: [{ text: m.content }],
            })),
          }),
        }
      );

      const { data, isJson } = await parseSafeResponse(response);
      if (isJson && data && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return cleanAIResponseText(data.candidates[0].content.parts[0].text);
      }
    } catch (e) {
      console.warn(`Google model ${targetModel} failed:`, e);
    }
  }
  return null;
}

async function callOpenAIWithFallback(key: string, requestedModel: string, processedMessages: Message[]): Promise<string | null> {
  const discoveredMap = await getAllDiscoveredModels();
  const discoveredOpenAI = (discoveredMap['openai'] || []).map((m) => m.id).filter((id) => !id.endsWith('-auto'));

  const candidates = Array.from(new Set([
    requestedModel,
    ...discoveredOpenAI,
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
  ])).filter((m) => m && !m.includes('-auto') && m !== 'auto');

  for (const targetModel of candidates) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: processedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const { data, isJson } = await parseSafeResponse(response);
      if (isJson && data && data.choices && data.choices[0]?.message?.content) {
        return cleanAIResponseText(data.choices[0].message.content);
      }
    } catch (e) {
      console.warn(`OpenAI model ${targetModel} failed:`, e);
    }
  }
  return null;
}

async function callAnthropicWithFallback(key: string, requestedModel: string, processedMessages: Message[]): Promise<string | null> {
  const discoveredMap = await getAllDiscoveredModels();
  const discoveredAnthropic = (discoveredMap['anthropic'] || []).map((m) => m.id).filter((id) => !id.endsWith('-auto'));

  const candidates = Array.from(new Set([
    requestedModel,
    ...discoveredAnthropic,
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-3-haiku-20240307',
  ])).filter((m) => m && !m.includes('-auto') && m !== 'auto');

  for (const targetModel of candidates) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: targetModel,
          max_tokens: 1024,
          messages: processedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const { data, isJson } = await parseSafeResponse(response);
      if (isJson && data && data.content && data.content[0]?.text) {
        return cleanAIResponseText(data.content[0].text);
      }
    } catch (e) {
      console.warn(`Anthropic model ${targetModel} failed:`, e);
    }
  }
  return null;
}

async function callGroqWithFallback(key: string, requestedModel: string, processedMessages: Message[]): Promise<string | null> {
  const discoveredMap = await getAllDiscoveredModels();
  const discoveredGroq = (discoveredMap['groq'] || []).map((m) => m.id).filter((id) => !id.endsWith('-auto'));

  const candidates = Array.from(new Set([
    requestedModel,
    ...discoveredGroq,
    'llama3-70b-8192',
    'llama3-8b-8192',
    'mixtral-8x7b-32768',
  ])).filter((m) => m && !m.includes('-auto') && m !== 'auto');

  for (const targetModel of candidates) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: processedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const { data, isJson } = await parseSafeResponse(response);
      if (isJson && data && data.choices && data.choices[0]?.message?.content) {
        return cleanAIResponseText(data.choices[0].message.content);
      }
    } catch (e) {
      console.warn(`Groq model ${targetModel} failed:`, e);
    }
  }
  return null;
}

async function callOpenRouterWithFallback(key: string, requestedModel: string, processedMessages: Message[]): Promise<string | null> {
  const discoveredMap = await getAllDiscoveredModels();
  const discoveredOR = (discoveredMap['openrouter'] || []).map((m) => m.id).filter((id) => !id.endsWith('-auto'));

  const candidates = Array.from(new Set([
    requestedModel,
    'auto',
    ...discoveredOR,
  ])).filter((m) => m && !m.includes('-auto'));

  for (const targetModel of candidates) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: processedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const { data, isJson } = await parseSafeResponse(response);
      if (isJson && data && data.choices && data.choices[0]?.message?.content) {
        return cleanAIResponseText(data.choices[0].message.content);
      }
    } catch (e) {
      console.warn(`OpenRouter model ${targetModel} failed:`, e);
    }
  }
  return null;
}

async function callOmniRouterWithFallback(url: string, key: string, requestedModel: string, processedMessages: Message[]): Promise<string | null> {
  const cleanUrl = url.replace(/\/+$/, '');
  const endpoint = cleanUrl.endsWith('/v1')
    ? `${cleanUrl}/chat/completions`
    : `${cleanUrl}/v1/chat/completions`;

  const discoveredMap = await getAllDiscoveredModels();
  const discoveredOmni = (discoveredMap['omnirouter'] || []).map((m) => m.id).filter((id) => !id.endsWith('-auto'));

  let omniModel = requestedModel || 'openai/omnirouter-auto';
  if (!omniModel || omniModel.includes('-auto') || omniModel === 'auto') {
    omniModel = 'openai/omnirouter-auto';
  } else if (!omniModel.includes('/')) {
    omniModel = `openai/${omniModel}`;
  }

  const candidates = Array.from(new Set([
    omniModel,
    'openai/omnirouter-auto',
    ...discoveredOmni,
  ]));

  for (const targetModel of candidates) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: processedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const { data, isJson } = await parseSafeResponse(response);
      if (isJson && data && data.choices && data.choices[0]?.message?.content) {
        return cleanAIResponseText(data.choices[0].message.content);
      }
    } catch (e) {
      console.warn(`OmniRouter model ${targetModel} failed:`, e);
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// MAIN GENERATE ENTRYPOINT WITH CROSS-PROVIDER FAILOVER
// ---------------------------------------------------------------------------

export async function generateAIResponse(
  provider: AIProvider,
  model: string,
  messages: Message[]
): Promise<string> {
  let processedMessages = [...messages];
  try {
    const fullContext = await buildFullAppContext();
    const systemMemoryMsg: Message = {
      id: 'sys_app_ctx_' + Date.now(),
      conversationId: messages[0]?.conversationId || 'default',
      role: 'system',
      content: fullContext,
      createdAt: Date.now(),
    };
    processedMessages = [systemMemoryMsg, ...messages];
  } catch (err) {
    console.warn('Could not load full app context:', err);
  }

  const tryProvider = async (targetProvider: AIProvider, targetModel: string): Promise<string | null> => {
    if (targetProvider === 'google') {
      const key = (await getAPIKey('google')) || process.env.GEMINI_API_KEY;
      if (key) return await callGoogleWithFallback(key, targetModel, processedMessages);
    }
    if (targetProvider === 'openai') {
      const key = (await getAPIKey('openai')) || process.env.OPENAI_API_KEY;
      if (key) return await callOpenAIWithFallback(key, targetModel, processedMessages);
    }
    if (targetProvider === 'anthropic') {
      const key = (await getAPIKey('anthropic')) || process.env.ANTHROPIC_API_KEY;
      if (key) return await callAnthropicWithFallback(key, targetModel, processedMessages);
    }
    if (targetProvider === 'groq') {
      const key = (await getAPIKey('groq')) || process.env.GROQ_API_KEY;
      if (key) return await callGroqWithFallback(key, targetModel, processedMessages);
    }
    if (targetProvider === 'openrouter') {
      const key = await getAPIKey('openrouter');
      if (key) return await callOpenRouterWithFallback(key, targetModel, processedMessages);
    }
    if (targetProvider === 'omnirouter') {
      const url = (await getAPIKey('omniRouterUrl')) || process.env.LLM_PROXY_BASE_URL;
      const key = (await getAPIKey('omniRouterKey')) || process.env.LLM_PROXY_API_KEY;
      if (url && key) return await callOmniRouterWithFallback(url, key, targetModel, processedMessages);
    }
    return null;
  };

  const primaryResult = await tryProvider(provider, model);
  if (primaryResult) return primaryResult;

  const fallbackOrder: AIProvider[] = [
    'google',
    'omnirouter',
    'openai',
    'anthropic',
    'groq',
    'openrouter',
    'ollama',
  ];

  for (const altProvider of fallbackOrder) {
    if (altProvider === provider) continue;
    const fallbackResult = await tryProvider(altProvider, `${altProvider}-auto`);
    if (fallbackResult) {
      return `[Auto-Fallback via ${altProvider.toUpperCase()}]\n\n${fallbackResult}`;
    }
  }

  return `⚠️ Unable to generate AI response.\n\nPlease check your API Key credentials or host connection in ⚙️ Settings.`;
}
