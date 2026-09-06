const { roomTypeLabel, statusLabel } = require('./format');

const CSV_COLUMNS = [
  { key: 'clientName', label: 'Client' },
  { key: 'clientPhone', label: 'Téléphone' },
  { key: 'roomType', label: 'Chambre' },
  { key: 'checkIn', label: 'Arrivée' },
  { key: 'checkOut', label: 'Départ' },
  { key: 'status', label: 'Statut' },
  { key: 'amount', label: 'Montant (Ar)' },
];

function escapeCsvValue(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/["\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function cellValue(reservation, key) {
  switch (key) {
    case 'checkIn':
    case 'checkOut':
      return new Date(reservation[key]).toISOString().slice(0, 10);
    case 'roomType':
      return roomTypeLabel(reservation.roomType);
    case 'status':
      return statusLabel(reservation.status);
    case 'clientPhone':
      return reservation.clientPhone ?? '';
    default:
      return reservation[key];
  }
}

function reservationsToCsv(reservations) {
  const header = CSV_COLUMNS.map((column) => escapeCsvValue(column.label)).join(';');
  const rows = reservations.map((reservation) =>
    CSV_COLUMNS.map((column) => escapeCsvValue(cellValue(reservation, column.key))).join(';')
  );
  return `\uFEFF${[header, ...rows].join('\r\n')}`;
}

module.exports = { reservationsToCsv, CSV_COLUMNS };
