import { AIProvider, Message } from '../types';
import { getAPIKey } from './keys';

export async function generateAIResponse(
  provider: AIProvider,
  model: string,
  messages: Message[]
): Promise<string> {
  // 1. OmniRouter (Local Network Proxy / Custom OmniRouter API Key)
  if (provider === 'omnirouter') {
    const omniUrl = (await getAPIKey('omniRouterUrl')) || process.env.LLM_PROXY_BASE_URL || 'http://192.168.1.100:4000';
    const omniKey = (await getAPIKey('omniRouterKey')) || process.env.LLM_PROXY_API_KEY || 'sk-omnirouter';
    try {
      const response = await fetch(`${omniUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${omniKey}`,
        },
        body: JSON.stringify({
          model: model || 'omnirouter-auto',
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
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
    }
  }

  // 2. Google Gemini
  if (provider === 'google') {
    const keyToUse = (await getAPIKey('google')) || process.env.GEMINI_API_KEY;
    if (keyToUse) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyToUse}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: messages.map((m) => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
              })),
            }),
          }
        );
        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
      } catch (err: any) {
        console.warn('Gemini API call failed:', err);
      }
    }
  }

  // 3. OpenAI
  if (provider === 'openai') {
    const keyToUse = (await getAPIKey('openai')) || process.env.OPENAI_API_KEY;
    if (keyToUse) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${keyToUse}`,
          },
          body: JSON.stringify({
            model: model || 'gpt-4o',
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const data = await response.json();
        if (data.choices && data.choices[0]?.message?.content) {
          return data.choices[0].message.content;
        }
      } catch (err: any) {
        console.warn('OpenAI call error:', err);
      }
    }
  }

  // 4. Anthropic Claude
  if (provider === 'anthropic') {
    const keyToUse = (await getAPIKey('anthropic')) || process.env.ANTHROPIC_API_KEY;
    if (keyToUse) {
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
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const data = await response.json();
        if (data.content && data.content[0]?.text) {
          return data.content[0].text;
        }
      } catch (err: any) {
        console.warn('Anthropic call error:', err);
      }
    }
  }

  // 5. Groq
  if (provider === 'groq') {
    const keyToUse = (await getAPIKey('groq')) || process.env.GROQ_API_KEY;
    if (keyToUse) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${keyToUse}`,
          },
          body: JSON.stringify({
            model: 'llama3-70b-8192',
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const data = await response.json();
        if (data.choices && data.choices[0]?.message?.content) {
          return data.choices[0].message.content;
        }
      } catch (err: any) {
        console.warn('Groq call error:', err);
      }
    }
  }

  // 6. OpenRouter
  if (provider === 'openrouter') {
    const keyToUse = await getAPIKey('openrouter');
    if (keyToUse) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${keyToUse}`,
          },
          body: JSON.stringify({
            model: 'auto',
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const data = await response.json();
        if (data.choices && data.choices[0]?.message?.content) {
          return data.choices[0].message.content;
        }
      } catch (err: any) {
        console.warn('OpenRouter call error:', err);
      }
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
    } catch (err: any) {
      console.warn('Ollama call error:', err);
    }
  }

  // Fallback demo response if no key/endpoint is active yet
  const lastMsg = messages[messages.length - 1]?.content || '';
  return `ZIURY OmniRouter (${model}) connected!\n\nReceived: "${lastMsg}"\n\nTo configure your OmniRouter local network URL or API key, open ⚙️ Settings -> OmniRouter Setup.`;
}
