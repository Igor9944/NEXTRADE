const FORBIDDEN = [
  'password',
  'password_hash',
  'jwt',
  'token',
  'secret',
  'api_key',
  'payment_secret',
  'cvv',
  'pan'
];

export function isForbiddenAiRequest(message: string): boolean {
  const text = message.toLowerCase();
  return FORBIDDEN.some((item) => text.includes(item))
    || text.includes('mot de passe')
    || text.includes('mots de passe')
    || /modifier.*(transaction|paiement|permission)/i.test(message)
    || /autre client|other client|عميل آخر/i.test(message);
}

export function sanitizeAiContext(input: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!input || typeof input !== 'object') {
    return {};
  }
  const allowed = ['module', 'order_id', 'document_id', 'shipment_id'];
  const out: Record<string, unknown> = {};
  for (const key of allowed) {
    if (input[key] !== undefined && input[key] !== null) {
      out[key] = String(input[key]).slice(0, 80);
    }
  }
  return out;
}

export const ALLOWED_MODULES = ['support', 'orders', 'documents', 'import-export', 'shipments', 'analytics', 'payments'];
