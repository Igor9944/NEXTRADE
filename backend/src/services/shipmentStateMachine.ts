import { ShipmentStatus } from '../types/shipment';

export const SHIPMENT_STATUSES: ShipmentStatus[] = [
  'PREPARATION',
  'PRISE_EN_CHARGE',
  'EXPEDIEE',
  'EN_TRANSIT',
  'ARRIVEE',
  'ARRIVEE_AGENCE',
  'DOUANE',
  'EN_LIVRAISON',
  'LIVREE',
  'ECHEC_LIVRAISON',
  'ANNULEE'
];

export const SHIPMENT_TIMELINE: ShipmentStatus[] = [
  'PREPARATION',
  'PRISE_EN_CHARGE',
  'EXPEDIEE',
  'EN_TRANSIT',
  'ARRIVEE_AGENCE',
  'EN_LIVRAISON',
  'LIVREE'
];

const FORWARD_RANK: Record<ShipmentStatus, number> = {
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
  ANNULEE: 99
};

export function isShipmentStatus(value: string): value is ShipmentStatus {
  return SHIPMENT_STATUSES.includes(value as ShipmentStatus);
}

export function canTransitionShipmentStatus(
  from: ShipmentStatus,
  to: ShipmentStatus,
  options: { allowCancel: boolean }
): boolean {
  if (from === to) {
    return false;
  }

  if (from === 'LIVREE' || from === 'ANNULEE') {
    return false;
  }

  if (to === 'ANNULEE') {
    return options.allowCancel;
  }

  if (from === 'ECHEC_LIVRAISON') {
    return to === 'EN_LIVRAISON';
  }

  if (to === 'ECHEC_LIVRAISON') {
    return from === 'EN_LIVRAISON';
  }

  if (to === 'LIVREE') {
    return from === 'EN_LIVRAISON';
  }

  return FORWARD_RANK[to] > FORWARD_RANK[from];
}

export function allowedNextStatuses(
  from: ShipmentStatus,
  options: { allowCancel: boolean }
): ShipmentStatus[] {
  return SHIPMENT_STATUSES.filter((status) => canTransitionShipmentStatus(from, status, options));
}
