import React from 'react';
import { ShipmentStatus, SHIPMENT_TIMELINE } from '../types/shipment';
import { cn } from '../lib/cn';

const RANK: Record<string, number> = {
  PREPARATION: 0,
  PRISE_EN_CHARGE: 1,
  EXPEDIEE: 2,
  EN_TRANSIT: 3,
  ARRIVEE: 4,
  ARRIVEE_AGENCE: 4,
  DOUANE: 4,
  EN_LIVRAISON: 5,
  ECHEC_LIVRAISON: 5,
  LIVREE: 6,
};

export function ShipmentTimeline({ status }: { status: ShipmentStatus }) {
  const current = RANK[status] ?? 0;
  const delivered = status === 'LIVREE';

  return (
    <ol className="space-y-2" aria-label="Avancement de l'expédition">
      {SHIPMENT_TIMELINE.map((step) => {
        const rank = RANK[step.status];
        const active =
          status === step.status ||
          (step.status === 'ARRIVEE_AGENCE' &&
            (status === 'ARRIVEE' || status === 'DOUANE'));
        const done = delivered || current > rank;

        return (
          <li key={step.status} className="flex items-center gap-3 text-sm">
            {/* Indicateur */}
            <span
              aria-hidden="true"
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                done
                  ? 'border-success-500 bg-success-500 text-white'
                  : active
                  ? 'border-nextrade-blue bg-nextrade-blue text-white'
                  : 'border-slate-200 bg-white text-nextrade-muted'
              )}
            >
              {done ? '✓' : active ? '●' : '○'}
            </span>

            {/* Label */}
            <span
              className={cn(
                'font-medium',
                done
                  ? 'text-success-700'
                  : active
                  ? 'text-nextrade-blue'
                  : 'text-nextrade-muted'
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}

      {/* Statuts spéciaux */}
      {status === 'ANNULEE' && (
        <li className="flex items-center gap-3 text-sm">
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-danger-500 bg-danger-50 text-xs text-danger-500"
          >
            ✕
          </span>
          <span className="font-semibold text-danger-600">Annulée</span>
        </li>
      )}
      {status === 'ECHEC_LIVRAISON' && (
        <li className="flex items-center gap-3 text-sm">
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-warning-500 bg-warning-50 text-xs text-warning-700"
          >
            !
          </span>
          <span className="font-semibold text-warning-700">Échec de livraison</span>
        </li>
      )}
    </ol>
  );
}
