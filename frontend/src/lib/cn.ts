/**
 * Helper léger pour combiner des classes Tailwind conditionnellement.
 * Pas de dépendance externe — implémentation minimaliste.
 */
export function cn(...classes: (string | undefined | null | false | 0)[]): string {
  return classes.filter(Boolean).join(' ');
}
