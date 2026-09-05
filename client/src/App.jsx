import { useEffect, useState, useCallback, useMemo } from 'react';
import { reservationsApi } from './api.js';
import StatsBar from './components/StatsBar.jsx';
import FilterTabs from './components/FilterTabs.jsx';
import ReservationsTable from './components/ReservationsTable.jsx';
import ReservationForm from './components/ReservationForm.jsx';

export default function App() {
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('toutes');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [reservationsData, statsData] = await Promise.all([
        reservationsApi.list(),
        reservationsApi.stats(),
      ]);
      setReservations(reservationsData);
      setStats(statsData);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visibleReservations = useMemo(() => {
    const byStatus =
      activeTab === 'toutes' ? reservations : reservations.filter((r) => r.status === activeTab);
    const term = searchTerm.trim().toLowerCase();
    if (!term) return byStatus;
    return byStatus.filter((r) => r.clientName.toLowerCase().includes(term));
  }, [reservations, activeTab, searchTerm]);

  async function handleCreate(payload) {
    await reservationsApi.create(payload);
    setShowForm(false);
    await loadData();
  }

  async function handleUpdate(payload) {
    await reservationsApi.update(editingReservation._id, payload);
    setEditingReservation(null);
    await loadData();
  }

  async function handleStatusChange(id, status) {
    setReservations((current) =>
      current.map((reservation) => (reservation._id === id ? { ...reservation, status } : reservation))
    );
    try {
      await reservationsApi.updateStatus(id, status);
      await loadData();
    } catch (updateError) {
      setError(updateError.message);
      await loadData();
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Supprimer cette réservation ?');
    if (!confirmed) return;

    try {
      await reservationsApi.remove(id);
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1 className="app-title">Réservations</h1>
          <p className="app-subtitle">Vue d'ensemble des séjours et de l'occupation</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
          Nouvelle réservation
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          {stats && <StatsBar stats={stats} />}

          <div className="toolbar">
            <FilterTabs active={activeTab} onChange={setActiveTab} />
            <input
              type="search"
              className="search-input"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <ReservationsTable
            reservations={visibleReservations}
            onStatusChange={handleStatusChange}
            onEdit={setEditingReservation}
            onDelete={handleDelete}
          />
        </>
      )}

      {showForm && <ReservationForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      {editingReservation && (
        <ReservationForm
          reservation={editingReservation}
          onSubmit={handleUpdate}
          onClose={() => setEditingReservation(null)}
        />
      )}
    </div>
  );
}
