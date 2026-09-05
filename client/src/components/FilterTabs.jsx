const TABS = [
  { value: 'toutes', label: 'Toutes' },
  { value: 'confirmee', label: 'Confirmées' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'annulee', label: 'Annulées' },
];

export default function FilterTabs({ active, onChange }) {
  return (
    <div className="tabs">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          className="tab"
          data-active={active === tab.value}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
