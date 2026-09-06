import { useState } from 'react';
import { ROOM_TYPE_LABELS } from '../format.js';

export default function FiltersPanel({ roomType, checkInFrom, checkInTo, onChange, onReset }) {
  const [open, setOpen] = useState(false);
  const activeCount = [roomType, checkInFrom, checkInTo].filter(Boolean).length;

  return (
    <div className="filters-panel">
      <button
        type="button"
        className="btn filters-toggle"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        Filtres
        {activeCount > 0 && <span className="filters-badge">{activeCount}</span>}
      </button>

      {open && (
        <div className="filters-panel-body">
          <div className="field">
            <label htmlFor="filter-roomType">Type de chambre</label>
            <select
              id="filter-roomType"
              value={roomType}
              onChange={(event) => onChange({ roomType: event.target.value })}
            >
              <option value="">Toutes</option>
              {Object.entries(ROOM_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Empilées, pas côte à côte : un input date natif refuse de
              descendre sous ~130px, ce qui débordait dans un panneau de
              280-320px avec deux colonnes. */}
          <div className="field">
            <label htmlFor="filter-checkInFrom">Arrivée à partir du</label>
            <input
              id="filter-checkInFrom"
              type="date"
              value={checkInFrom}
              onChange={(event) => onChange({ checkInFrom: event.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="filter-checkInTo">Arrivée jusqu'au</label>
            <input
              id="filter-checkInTo"
              type="date"
              value={checkInTo}
              onChange={(event) => onChange({ checkInTo: event.target.value })}
            />
          </div>

          {activeCount > 0 && (
            <button type="button" className="filters-reset" onClick={onReset}>
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}
