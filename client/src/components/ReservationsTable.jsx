import { formatAmount, formatDate, roomTypeLabel, STATUS_LABELS } from '../format.js';

export default function ReservationsTable({ reservations, onStatusChange, onEdit, onDelete }) {
  if (reservations.length === 0) {
    return (
      <div className="table-wrap">
        <div className="empty-state">
          <p className="empty-state-title">Aucune réservation</p>
          <p>Aucun résultat pour ce filtre.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Chambre</th>
            <th>Séjour</th>
            <th>Statut</th>
            <th className="cell-amount">Montant</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation._id}>
              <td>{reservation.clientName}</td>
              <td>{roomTypeLabel(reservation.roomType)}</td>
              <td className="cell-dates">
                {formatDate(reservation.checkIn)} — {formatDate(reservation.checkOut)}
              </td>
              <td>
                <select
                  className="status-select"
                  data-status={reservation.status}
                  value={reservation.status}
                  onChange={(event) => onStatusChange(reservation._id, event.target.value)}
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="cell-amount">{formatAmount(reservation.amount)}</td>
              <td>
                <button type="button" className="btn-danger-text" onClick={() => onEdit(reservation)}>
                  Modifier
                </button>
                <button
                  type="button"
                  className="btn-danger-text"
                  onClick={() => onDelete(reservation._id)}
                  aria-label={`Supprimer la réservation de ${reservation.clientName}`}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
