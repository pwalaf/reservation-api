import { useEffect, useState, useCallback, useRef } from 'react';
import { reservationsApi } from './api.js';
import { useToast } from './components/ToastProvider.jsx';
import StatsBar from './components/StatsBar.jsx';
import FilterTabs from './components/FilterTabs.jsx';
import FiltersPanel from './components/FiltersPanel.jsx';
import SortSelect from './components/SortSelect.jsx';
import ExportButtons from './components/ExportButtons.jsx';
import Pagination from './components/Pagination.jsx';
import ReservationsTable from './components/ReservationsTable.jsx';
import ReservationForm from './components/ReservationForm.jsx';

const LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 300;

const initialFilters = {
  status: 'toutes',
  roomType: '',
  search: '',
  checkInFrom: '',
  checkInTo: '',
  sort: 'checkIn',
};

function toQueryParams(filters) {
  return {
    status: filters.status === 'toutes' ? undefined : filters.status,
    roomType: filters.roomType || undefined,
    search: filters.search || undefined,
    checkInFrom: filters.checkInFrom || undefined,
    checkInTo: filters.checkInTo || undefined,
    sort: filters.sort,
  };
}

export default function App() {
  const toast = useToast();
  const [reservations, setReservations] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState('');
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchTimer = useRef(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [reservationsResponse, statsData] = await Promise.all([
        reservationsApi.list({ ...toQueryParams(filters), page, limit: LIMIT }),
        reservationsApi.stats(),
      ]);
      setReservations(reservationsResponse.data);
      setMeta(reservationsResponse.meta);
      setStats(statsData);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function updateFilters(patch) {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }

  function handleSearchInput(value) {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      updateFilters({ search: value });
    }, SEARCH_DEBOUNCE_MS);
  }

  function resetPanelFilters() {
    updateFilters({ roomType: '', checkInFrom: '', checkInTo: '' });
  }

  async function handleCreate(payload) {
    await reservationsApi.create(payload);
    setShowForm(false);
    toast.success('Réservation créée.');
    await loadData();
  }

  async function handleUpdate(payload) {
    await reservationsApi.update(editingReservation._id, payload);
    setEditingReservation(null);
    toast.success('Réservation mise à jour.');
    await loadData();
  }

  async function handleStatusChange(id, status) {
    const previous = reservations;
    setReservations((current) =>
      current.map((reservation) => (reservation._id === id ? { ...reservation, status } : reservation))
    );
    try {
      await reservationsApi.updateStatus(id, status);
      toast.success('Statut mis à jour.');
      await loadData();
    } catch (updateError) {
      setReservations(previous);
      toast.error(updateError.message);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Supprimer cette réservation ?');
    if (!confirmed) return;

    try {
      await reservationsApi.remove(id);
      toast.success('Réservation supprimée.');
      await loadData();
    } catch (deleteError) {
      toast.error(deleteError.message);
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

      {stats && <StatsBar stats={stats} />}

      <div className="toolbar">
        <FilterTabs active={filters.status} onChange={(status) => updateFilters({ status })} />
        <input
          type="search"
          className="search-input"
          placeholder="Rechercher un client..."
          value={searchInput}
          onChange={(event) => handleSearchInput(event.target.value)}
        />
      </div>

      <div className="toolbar toolbar-secondary">
        <FiltersPanel
          roomType={filters.roomType}
          checkInFrom={filters.checkInFrom}
          checkInTo={filters.checkInTo}
          onChange={updateFilters}
          onReset={resetPanelFilters}
        />
        <SortSelect value={filters.sort} onChange={(sort) => updateFilters({ sort })} />
        <ExportButtons queryParams={toQueryParams(filters)} />
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <ReservationsTable
            reservations={reservations}
            onStatusChange={handleStatusChange}
            onEdit={setEditingReservation}
            onDelete={handleDelete}
          />
          <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} onChange={setPage} />
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
