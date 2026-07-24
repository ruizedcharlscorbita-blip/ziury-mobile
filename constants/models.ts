import { AIModelOption } from '../types';

/**
 * AVAILABLE_MODELS is populated dynamically upon live API key validation.
 * No static pre-populated model options exist by default.
 */
export const AVAILABLE_MODELS: AIModelOption[] = [];

export const DEFAULT_PROVIDER = 'omnirouter';
export const DEFAULT_MODEL = 'openai/omnirouter-auto';
