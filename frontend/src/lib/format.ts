/**
 * Formatters partagés pour prix, dates, statuts.
 * Utilisés dans toutes les pages pour garantir la cohérence.
 */

/** Formate un montant avec symbole de devise. */
export function formatPrice(
  value: number | string | null | undefined,
  currency = 'EUR'
): string {
  if (value === null || value === undefined || value === '') return '—';
  const numeric = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numeric)) return String(value);
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

/** Formate une date ISO en date lisible. */
export function formatDate(
  value: string | Date | null | undefined,
  locale = 'fr-FR'
): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

/** Formate une date ISO en date + heure lisible. */
export function formatDateTime(
  value: string | Date | null | undefined,
  locale = 'fr-FR'
): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

/** Formate une date en "il y a X minutes/heures/jours". */
export function formatRelativeDate(
  value: string | Date | null | undefined
): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '—';
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return formatDate(date);
}

/** Capitalise la première lettre et remplace les _ par des espaces. */
export function formatStatus(status: string): string {
  if (!status) return '—';
  return status
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

/** Formate un nombre entier ou décimal. */
export function formatNumber(
  value: number | string | null | undefined
): string {
  if (value === null || value === undefined || value === '') return '—';
  const numeric = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numeric)) return String(value);
  return new Intl.NumberFormat('fr-FR').format(numeric);
}
