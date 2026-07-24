import { AIProvider, Message } from '../types';
import { getAPIKey } from './keys';
import { getAIMemories } from './database';

export async function generateAIResponse(
  provider: AIProvider,
  model: string,
  messages: Message[]
): Promise<string> {
  // Prep context with SQLite AI memories if available
  let processedMessages = [...messages];
  try {
    const memories = await getAIMemories();
    if (memories.length > 0) {
      const memoryText = memories
        .slice(0, 5)
        .map((m) => `- [${m.category}]: ${m.fact}`)
        .join('\n');
      const systemMemoryMsg: Message = {
        id: 'sys_mem_' + Date.now(),
        conversationId: messages[0]?.conversationId || 'default',
        role: 'system',
        content: `[ZIURY LOCAL MEMORY CONTEXT]\nUser facts & saved memories:\n${memoryText}`,
        createdAt: Date.now(),
      };
      processedMessages = [systemMemoryMsg, ...messages];
    }
  } catch (err) {
    console.warn('Could not load AI memories for context:', err);
  }

  // 1. OmniRouter (Local Network Proxy / Custom OmniRouter API Key)
  if (provider === 'omnirouter') {
    const omniUrl = (await getAPIKey('omniRouterUrl')) || process.env.LLM_PROXY_BASE_URL;
    const omniKey = (await getAPIKey('omniRouterKey')) || process.env.LLM_PROXY_API_KEY;

    if (!omniUrl || !omniKey) {
      return `⚠️ No OmniRouter credentials entered.\n\nPlease open ⚙️ Settings -> OmniRouter Configuration and enter your OmniRouter Base URL and API Key to enable AI responses.`;
    }

    try {
      const cleanUrl = omniUrl.replace(/\/+$/, '');
      const endpoint = cleanUrl.endsWith('/v1')
        ? `${cleanUrl}/chat/completions`
        : `${cleanUrl}/v1/chat/completions`;

      let omniModel = model || 'openai/omnirouter-auto';
      if (omniModel === 'omnirouter-auto') {
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
      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      }
      if (data.error?.message) {
        return `OmniRouter Error: ${data.error.message}`;
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
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyToUse}`,
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
      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
      if (data.error?.message) return `Gemini Error: ${data.error.message}`;
    } catch (err: any) {
      console.warn('Gemini API call failed:', err);
    }
  }

  // 3. OpenAI
  if (provider === 'openai') {
    const keyToUse = (await getAPIKey('openai')) || process.env.OPENAI_API_KEY;
    if (!keyToUse) {
      return `⚠️ No OpenAI API key entered.\n\nPlease open ⚙️ Settings and enter your OpenAI API Key.`;
    }
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keyToUse}`,
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          messages: processedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      }
      if (data.error?.message) return `OpenAI Error: ${data.error.message}`;
    } catch (err: any) {
      console.warn('OpenAI call error:', err);
    }
  }

  // 4. Anthropic Claude
  if (provider === 'anthropic') {
    const keyToUse = (await getAPIKey('anthropic')) || process.env.ANTHROPIC_API_KEY;
    if (!keyToUse) {
      return `⚠️ No Anthropic API key entered.\n\nPlease open ⚙️ Settings and enter your Anthropic API Key.`;
    }
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': keyToUse,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: processedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      if (data.content && data.content[0]?.text) {
        return data.content[0].text;
      }
      if (data.error?.message) return `Anthropic Error: ${data.error.message}`;
    } catch (err: any) {
      console.warn('Anthropic call error:', err);
    }
  }

  // 5. Groq
  if (provider === 'groq') {
    const keyToUse = (await getAPIKey('groq')) || process.env.GROQ_API_KEY;
    if (!keyToUse) {
      return `⚠️ No Groq API key entered.\n\nPlease open ⚙️ Settings and enter your Groq API Key.`;
    }
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keyToUse}`,
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: processedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      }
      if (data.error?.message) return `Groq Error: ${data.error.message}`;
    } catch (err: any) {
      console.warn('Groq call error:', err);
    }
  }

  // 6. OpenRouter
  if (provider === 'openrouter') {
    const keyToUse = await getAPIKey('openrouter');
    if (!keyToUse) {
      return `⚠️ No OpenRouter API key entered.\n\nPlease open ⚙️ Settings and enter your OpenRouter API Key.`;
    }
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keyToUse}`,
        },
        body: JSON.stringify({
          model: 'auto',
          messages: processedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      }
      if (data.error?.message) return `OpenRouter Error: ${data.error.message}`;
    } catch (err: any) {
      console.warn('OpenRouter call error:', err);
    }
  }

  // 7. Local Ollama
  if (provider === 'ollama') {
    const host = (await getAPIKey('ollamaHost')) || process.env.OLLAMA_HOST || 'http://localhost:11434';
    try {
      const response = await fetch(`${host}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          prompt: messages[messages.length - 1]?.content || '',
          stream: false,
        }),
      });
      const data = await response.json();
      if (data.response) {
        return data.response;
      }
      if (data.error) return `Ollama Error: ${data.error}`;
    } catch (err: any) {
      console.warn('Ollama call error:', err);
      return `⚠️ Unable to connect to Local Ollama at ${host}.\n\nPlease ensure Ollama is running locally.`;
    }
  }

  return `⚠️ No API key configured for ${provider.toUpperCase()}.\n\nPlease open ⚙️ Settings to configure your credentials.`;
}
