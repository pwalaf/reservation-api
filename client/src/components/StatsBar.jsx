import { formatAmount, monthLabel, roomTypeLabel } from '../format.js';

export default function StatsBar({ stats }) {
  const latestMonth = stats.revenuParMois.at(-1);
  const revenueLabel = latestMonth
    ? `${monthLabel(latestMonth._id.mois)} ${latestMonth._id.annee}`
    : 'Aucune donnée';
  const topRoom = stats.occupationParTypeChambre[0];

  return (
    <div className="stats">
      <div className="stat-card">
        <p className="stat-label">Revenu confirmé</p>
        <p className="stat-value">{formatAmount(latestMonth?.revenu ?? 0)}</p>
        <p className="stat-meta">{revenueLabel}</p>
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
