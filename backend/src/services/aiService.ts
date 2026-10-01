import { AppError } from '../utils/appError';
import { ALLOWED_MODULES, isForbiddenAiRequest, sanitizeAiContext } from './aiGuard';

export class AiService {
  constructor(private baseUrl: string) {}

  async chat(input: {
    message: string;
    language: 'fr' | 'en' | 'ar';
    role: string;
    context?: Record<string, unknown>;
    facts?: Record<string, unknown>;
  }) {
    if (!input.message?.trim()) {
      throw new AppError('message is required', 400);
    }
    if (isForbiddenAiRequest(input.message)) {
      throw new AppError('This request is not allowed', 403);
    }
    const module = String(input.context?.module || 'support');
    const safeModule = ALLOWED_MODULES.includes(module) ? module : 'support';
    const payload = {
      message: input.message.slice(0, 2000),
      language: input.language,
      role: input.role,
      context: { ...sanitizeAiContext(input.context), module: safeModule },
      facts: input.role === 'ADMIN' ? input.facts || {} : {}
    };
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new AppError('AI service unavailable', 503);
    }
    return response.json();
  }
}
