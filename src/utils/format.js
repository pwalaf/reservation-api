const ROOM_TYPE_LABELS = { simple: 'Simple', double: 'Double', suite: 'Suite', dortoir: 'Dortoir' };
const STATUS_LABELS = { en_attente: 'En attente', confirmee: 'Confirmée', annulee: 'Annulée' };

function formatAmount(amount) {
  return `${new Intl.NumberFormat('fr-FR').format(amount)} Ar`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(value)
  );
}

function roomTypeLabel(roomType) {
  return ROOM_TYPE_LABELS[roomType] ?? roomType;
}

function statusLabel(status) {
  return STATUS_LABELS[status] ?? status;
}

module.exports = { formatAmount, formatDate, roomTypeLabel, statusLabel };
