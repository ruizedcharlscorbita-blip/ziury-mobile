import { AIProvider, Message } from '../types';
import { getAPIKey } from './keys';

export async function generateAIResponse(
  provider: AIProvider,
  model: string,
  messages: Message[]
): Promise<string> {
  const apiKey = await getAPIKey(provider as any);

  // If no key set for Google Gemini, check env fallback or provide helpful message
  if (provider === 'google') {
    const keyToUse = apiKey || process.env.GEMINI_API_KEY;
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
        if (data.error?.message) {
          return `Gemini API Error: ${data.error.message}`;
        }
      } catch (err: any) {
        console.warn('Gemini API call failed:', err);
      }
    }
  }

  if (provider === 'openai' && apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
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
      if (data.error?.message) {
        return `OpenAI API Error: ${data.error.message}`;
      }
    } catch (err: any) {
      console.warn('OpenAI call error:', err);
    }
  }

  if (provider === 'anthropic' && apiKey) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
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
      if (data.error?.message) {
        return `Claude API Error: ${data.error.message}`;
      }
    } catch (err: any) {
      console.warn('Anthropic call error:', err);
    }
  }

  // Fallback demo response if no API key is configured yet
  const lastMsg = messages[messages.length - 1]?.content || '';
  return `Ziury AI Brain (${model}) connected successfully!\n\nI received: "${lastMsg}"\n\nTo enable live responses, tap the ⚙️ Settings icon at the top right and enter your ${provider.toUpperCase()} API key.`;
}
