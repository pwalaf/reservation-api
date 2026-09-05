const ROOM_TYPE_LABELS = {
  simple: 'Simple',
  double: 'Double',
  suite: 'Suite',
  dortoir: 'Dortoir',
};

const STATUS_LABELS = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  annulee: 'Annulée',
};

const MONTH_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export function formatAmount(amount) {
  return `${new Intl.NumberFormat('fr-FR').format(amount)} Ar`;
}

export function formatDate(isoString) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

export function roomTypeLabel(roomType) {
  return ROOM_TYPE_LABELS[roomType] ?? roomType;
}

export function statusLabel(status) {
  return STATUS_LABELS[status] ?? status;
}

export function monthLabel(monthNumber) {
  return MONTH_LABELS[monthNumber - 1] ?? String(monthNumber);
}

export { ROOM_TYPE_LABELS, STATUS_LABELS };
