const SORT_OPTIONS = [
  { value: 'checkIn', label: 'Arrivée — la plus proche' },
  { value: '-checkIn', label: 'Arrivée — la plus lointaine' },
  { value: '-createdAt', label: 'Ajoutées récemment' },
  { value: 'clientName', label: 'Client (A → Z)' },
  { value: '-amount', label: 'Montant — décroissant' },
  { value: 'amount', label: 'Montant — croissant' },
];

export default function SortSelect({ value, onChange }) {
  return (
    <div className="field sort-field">
      <label htmlFor="sort-select">Trier par</label>
      <select id="sort-select" value={value} onChange={(event) => onChange(event.target.value)}>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
