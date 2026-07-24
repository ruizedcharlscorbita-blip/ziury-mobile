import { AIModelOption } from '../types';

export const AVAILABLE_MODELS: AIModelOption[] = [
  {
    id: 'openai/omnirouter-auto',
    name: 'OmniRouter (Auto LAN/API)',
    provider: 'omnirouter',
    description: 'Dynamic local network proxy or OmniRouter API key endpoint',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    description: 'Fast, intelligent, and ideal for everyday tasks',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Advanced reasoning and complex problem solving',
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (Experimental)',
    provider: 'google',
    description: 'Next-gen real-time experimental model from Google',
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'High precision, coding expertise, and natural writing',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Flagship multimodal model by OpenAI',
  },
  {
    id: 'llama3-70b-8192',
    name: 'Llama 3 70B (Groq)',
    provider: 'groq',
    description: 'Ultra-fast Llama 3 70B inference on Groq hardware',
  },
  {
    id: 'auto',
    name: 'OpenRouter (Auto)',
    provider: 'openrouter',
    description: 'Unified router to access 100+ AI models',
  },
  {
    id: 'mistral-large-latest',
    name: 'Mistral Large',
    provider: 'mistral',
    description: 'Top-tier reasoning model by Mistral AI',
  },
  {
    id: 'llama3',
    name: 'Local Ollama (Llama 3)',
    provider: 'ollama',
    description: 'Fully offline local LLM server running on device / LAN',
  },
];

export const DEFAULT_PROVIDER = 'omnirouter';
export const DEFAULT_MODEL = 'openai/omnirouter-auto';
