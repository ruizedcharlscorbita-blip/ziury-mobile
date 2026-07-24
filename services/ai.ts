import { AIProvider, Message } from '../types';
import { getAPIKey } from './keys';
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

  return `[ZIURY REAL-TIME SECOND BRAIN CONTEXT]\n${contextParts.join('\n\n')}`;
}

export async function generateAIResponse(
  provider: AIProvider,
  model: string,
  messages: Message[]
): Promise<string> {
  // Prep context with full SQLite app state context
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

  // 1. OmniRouter (Local Network Proxy / Custom OmniRouter API Key)
  if (provider === 'omnirouter') {
    const omniUrl = (await getAPIKey('omniRouterUrl')) || process.env.LLM_PROXY_BASE_URL;
    const omniKey = (await getAPIKey('omniRouterKey')) || process.env.LLM_PROXY_API_KEY;

    if (!omniUrl || !omniKey) {
      return `⚠️ No OmniRouter credentials entered.\n\nPlease open ⚙️ Settings -> OmniRouter Setup and enter your OmniRouter Base URL and API Key to connect.`;
    }

    try {
      const cleanUrl = omniUrl.replace(/\/+$/, '');
      const endpoint = cleanUrl.endsWith('/v1')
        ? `${cleanUrl}/chat/completions`
        : `${cleanUrl}/v1/chat/completions`;

      let omniModel = model || 'openai/omnirouter-auto';
      if (!omniModel || omniModel.includes('-auto') || omniModel === 'auto') {
        omniModel = 'openai/omnirouter-auto';
      } else if (!omniModel.includes('/')) {
        omniModel = `openai/${omniModel}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${omniKey}`,
        },
        body: JSON.stringify({
          model: omniModel,
          messages: processedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const { data, rawText, isJson } = await parseSafeResponse(response);

      if (isJson && data) {
        if (data.choices && data.choices[0]?.message?.content) {
          return data.choices[0].message.content;
        }
        if (data.error?.message) {
          return `OmniRouter Error: ${data.error.message}`;
        }
      }

      if (!response.ok) {
        return `⚠️ OmniRouter Error (${response.status}): ${rawText.slice(0, 150) || 'Server returned non-JSON response'}`;
      }
    } catch (err: any) {
      console.warn('OmniRouter network call error:', err);
      return `⚠️ Network Error: Unable to connect to OmniRouter at ${omniUrl}.\n\nPlease make sure your server is running and accessible.`;
    }
  }

  // 2. Google Gemini
  if (provider === 'google') {
    const keyToUse = (await getAPIKey('google')) || process.env.GEMINI_API_KEY;
    if (!keyToUse) {
      return `⚠️ No Google Gemini API key entered.\n\nPlease open ⚙️ Settings and enter your Google Gemini API Key.`;
    }
    try {
      let targetModel = model || 'gemini-1.5-flash';
      if (!targetModel || targetModel.includes('-auto') || targetModel === 'auto' || targetModel.includes('2.5')) {
        targetModel = 'gemini-1.5-flash';
      }
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${keyToUse}`,
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
      const { data, rawText, isJson } = await parseSafeResponse(response);
      if (isJson && data) {
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
        if (data.error?.message) return `Gemini Error: ${data.error.message}`;
      }
      return `⚠️ Gemini Response Error (${response.status}): ${rawText.slice(0, 150)}`;
    } catch (err: any) {
      console.warn('Gemini API call failed:', err);
      return `⚠️ Gemini Connection Error: ${err?.message || 'Unable to connect to Google Gemini API.'}`;
    }
  }

  // 3. OpenAI
  if (provider === 'openai') {
    const keyToUse = (await getAPIKey('openai')) || process.env.OPENAI_API_KEY;
    if (!keyToUse) {
      return `⚠️ No OpenAI API key entered.\n\nPlease open ⚙️ Settings and enter your OpenAI API Key.`;
    }
    try {
      let targetModel = model || 'gpt-4o';
      if (!targetModel || targetModel.includes('-auto') || targetModel === 'auto') {
        targetModel = 'gpt-4o';
      }
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keyToUse}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: processedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const { data, rawText, isJson } = await parseSafeResponse(response);
      if (isJson && data) {
        if (data.choices && data.choices[0]?.message?.content) {
          return data.choices[0].message.content;
        }
        if (data.error?.message) return `OpenAI Error: ${data.error.message}`;
      }
      return `⚠️ OpenAI Response Error (${response.status}): ${rawText.slice(0, 150)}`;
    } catch (err: any) {
      console.warn('OpenAI call error:', err);
      return `⚠️ OpenAI Error: ${err?.message || 'Unable to connect to OpenAI.'}`;
    }
  }

  // 4. Anthropic Claude
  if (provider === 'anthropic') {
    const keyToUse = (await getAPIKey('anthropic')) || process.env.ANTHROPIC_API_KEY;
    if (!keyToUse) {
      return `⚠️ No Anthropic API key entered.\n\nPlease open ⚙️ Settings and enter your Anthropic API Key.`;
    }
    try {
      let targetModel = model || 'claude-3-5-sonnet-20241022';
      if (!targetModel || targetModel.includes('-auto') || targetModel === 'auto') {
        targetModel = 'claude-3-5-sonnet-20241022';
      }
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': keyToUse,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: targetModel,
          max_tokens: 1024,
          messages: processedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const { data, rawText, isJson } = await parseSafeResponse(response);
      if (isJson && data) {
        if (data.content && data.content[0]?.text) {
          return data.content[0].text;
        }
        if (data.error?.message) return `Anthropic Error: ${data.error.message}`;
      }
      return `⚠️ Anthropic Response Error (${response.status}): ${rawText.slice(0, 150)}`;
    } catch (err: any) {
      console.warn('Anthropic call error:', err);
      return `⚠️ Anthropic Error: ${err?.message || 'Unable to connect to Anthropic.'}`;
    }
  }

  // 5. Groq
  if (provider === 'groq') {
    const keyToUse = (await getAPIKey('groq')) || process.env.GROQ_API_KEY;
    if (!keyToUse) {
      return `⚠️ No Groq API key entered.\n\nPlease open ⚙️ Settings and enter your Groq API Key.`;
    }
    try {
      let targetModel = model || 'llama3-70b-8192';
      if (!targetModel || targetModel.includes('-auto') || targetModel === 'auto') {
        targetModel = 'llama3-70b-8192';
      }
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keyToUse}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: processedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const { data, rawText, isJson } = await parseSafeResponse(response);
      if (isJson && data) {
        if (data.choices && data.choices[0]?.message?.content) {
          return data.choices[0].message.content;
        }
        if (data.error?.message) return `Groq Error: ${data.error.message}`;
      }
      return `⚠️ Groq Response Error (${response.status}): ${rawText.slice(0, 150)}`;
    } catch (err: any) {
      console.warn('Groq call error:', err);
      return `⚠️ Groq Error: ${err?.message || 'Unable to connect to Groq.'}`;
    }
  }

  // 6. OpenRouter
  if (provider === 'openrouter') {
    const keyToUse = await getAPIKey('openrouter');
    if (!keyToUse) {
      return `⚠️ No OpenRouter API key entered.\n\nPlease open ⚙️ Settings and enter your OpenRouter API Key.`;
    }
    try {
      let targetModel = model || 'auto';
      if (!targetModel || targetModel.includes('-auto')) {
        targetModel = 'auto';
      }
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keyToUse}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: processedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const { data, rawText, isJson } = await parseSafeResponse(response);
      if (isJson && data) {
        if (data.choices && data.choices[0]?.message?.content) {
          return data.choices[0].message.content;
        }
        if (data.error?.message) return `OpenRouter Error: ${data.error.message}`;
      }
      return `⚠️ OpenRouter Response Error (${response.status}): ${rawText.slice(0, 150)}`;
    } catch (err: any) {
      console.warn('OpenRouter call error:', err);
      return `⚠️ OpenRouter Error: ${err?.message || 'Unable to connect to OpenRouter.'}`;
    }
  }

  // 7. Local Ollama
  if (provider === 'ollama') {
    const host = (await getAPIKey('ollamaHost')) || process.env.OLLAMA_HOST || 'http://localhost:11434';
    try {
      let targetModel = model || 'llama3';
      if (!targetModel || targetModel.includes('-auto') || targetModel === 'auto') {
        targetModel = 'llama3';
      }
      const response = await fetch(`${host}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: targetModel,
          prompt: messages[messages.length - 1]?.content || '',
          stream: false,
        }),
      });
      const { data, rawText, isJson } = await parseSafeResponse(response);
      if (isJson && data) {
        if (data.response) {
          return data.response;
        }
        if (data.error) return `Ollama Error: ${data.error}`;
      }
      return `⚠️ Ollama Response Error (${response.status}): ${rawText.slice(0, 150)}`;
    } catch (err: any) {
      console.warn('Ollama call error:', err);
      return `⚠️ Unable to connect to Local Ollama at ${host}.\n\nPlease ensure Ollama is running locally.`;
    }
  }

  return `⚠️ No API key configured for ${provider.toUpperCase()}.\n\nPlease open ⚙️ Settings to configure your credentials.`;
}
