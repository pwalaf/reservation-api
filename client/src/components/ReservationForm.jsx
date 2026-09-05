import { useState } from 'react';
import { ROOM_TYPE_LABELS } from '../format.js';

const initialForm = {
  clientName: '',
  clientPhone: '',
  roomType: 'simple',
  checkIn: '',
  checkOut: '',
  amount: '',
};

function toFormValues(reservation) {
  return {
    clientName: reservation.clientName,
    clientPhone: reservation.clientPhone ?? '',
    roomType: reservation.roomType,
    checkIn: reservation.checkIn.slice(0, 10),
    checkOut: reservation.checkOut.slice(0, 10),
    amount: String(reservation.amount),
  };
}

export default function ReservationForm({ reservation, onSubmit, onClose }) {
  const isEdit = Boolean(reservation);
  const [form, setForm] = useState(isEdit ? toFormValues(reservation) : initialForm);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (form.checkIn && form.checkOut && form.checkOut <= form.checkIn) {
      setError('La date de départ doit être postérieure à la date d\'arrivée.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ ...form, amount: Number(form.amount) });
    } catch (submitError) {
      setError(submitError.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h2 className="modal-title">{isEdit ? 'Modifier la réservation' : 'Nouvelle réservation'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="clientName">Nom du client</label>
            <input id="clientName" required value={form.clientName} onChange={update('clientName')} />
          </div>

          <div className="field">
            <label htmlFor="clientPhone">Téléphone (optionnel)</label>
            <input id="clientPhone" value={form.clientPhone} onChange={update('clientPhone')} />
          </div>

          <div className="field">
            <label htmlFor="roomType">Type de chambre</label>
            <select id="roomType" value={form.roomType} onChange={update('roomType')}>
              {Object.entries(ROOM_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="checkIn">Arrivée</label>
              <input id="checkIn" type="date" required value={form.checkIn} onChange={update('checkIn')} />
            </div>
            <div className="field">
              <label htmlFor="checkOut">Départ</label>
              <input id="checkOut" type="date" required value={form.checkOut} onChange={update('checkOut')} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="amount">Montant (Ar)</label>
            <input id="amount" type="number" min="0" required value={form.amount} onChange={update('amount')} />
          </div>

          {error && <p className="field-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer la réservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
