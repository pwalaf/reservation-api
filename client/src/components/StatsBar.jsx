import { formatAmount, monthLabel, roomTypeLabel } from '../format.js';

export default function StatsBar({ stats }) {
  const totalConfirmedRevenue = stats.revenuParMois.reduce((sum, m) => sum + m.revenu, 0);
  const totalConfirmedReservations = stats.revenuParMois.reduce(
    (sum, m) => sum + m.nombreReservations,
    0
  );
  const topRoom = stats.occupationParTypeChambre[0];

  return (
    <div className="stats">
      <div className="stat-card">
        <p className="stat-label">Revenu confirmé</p>
        <p className="stat-value">{formatAmount(totalConfirmedRevenue)}</p>
        <p className="stat-meta">
          {totalConfirmedReservations} réservation{totalConfirmedReservations > 1 ? 's' : ''} confirmée{totalConfirmedReservations > 1 ? 's' : ''}
        </p>
      </div>
      <div className="stat-card">
        <p className="stat-label">Chambre la plus demandée</p>
        <p className="stat-value">{stats.chambrePlusDemandee ? roomTypeLabel(stats.chambrePlusDemandee) : '—'}</p>
        <p className="stat-meta">{topRoom ? `${topRoom.nombreReservations} réservations` : 'Aucune donnée'}</p>
      </div>
      <div className="stat-card">
        <p className="stat-label">Total réservations</p>
        <p className="stat-value">
          {stats.occupationParTypeChambre.reduce((sum, entry) => sum + entry.nombreReservations, 0)}
        </p>
        <p className="stat-meta">Tous statuts confondus</p>
      </div>
    </div>
  );
}
