import React from 'react';
import { ShipmentStatus, SHIPMENT_TIMELINE } from '../types/shipment';

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
  LIVREE: 6
};

export function ShipmentTimeline({ status }: { status: ShipmentStatus }) {
  const current = RANK[status] ?? 0;
  const delivered = status === 'LIVREE';

  return (
    <ol className="space-y-2">
      {SHIPMENT_TIMELINE.map((step) => {
        const rank = RANK[step.status];
        const active = status === step.status || (step.status === 'ARRIVEE_AGENCE' && (status === 'ARRIVEE' || status === 'DOUANE'));
        const mark = delivered || current > rank ? '✓' : active ? '●' : '○';
        return (
          <li key={step.status} className="flex items-center gap-3 text-sm sm:text-base">
            <span className={active ? 'text-blue-700 font-semibold' : delivered || current > rank ? 'text-green-700' : 'text-gray-400'}>
              {mark} {step.label}
            </span>
          </li>
        );
      })}
      {status === 'ANNULEE' && <li className="text-red-600 font-semibold">● Annulée</li>}
      {status === 'ECHEC_LIVRAISON' && <li className="text-orange-600 font-semibold">● Échec de livraison</li>}
    </ol>
  );
}
