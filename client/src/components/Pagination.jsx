export default function Pagination({ page, totalPages, total, onChange }) {
  if (total === 0) return null;

  return (
    <div className="pagination">
      <button type="button" className="btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Précédent
      </button>
      <span className="pagination-info">
        Page {page} / {totalPages} — {total} réservation{total > 1 ? 's' : ''}
      </span>
      <button
        type="button"
        className="btn"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Suivant
      </button>
    </div>
  );
}
