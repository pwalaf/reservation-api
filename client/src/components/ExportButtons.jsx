import { reservationsApi } from '../api.js';

function triggerDownload(url) {
  const link = document.createElement('a');
  link.href = url;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function ExportButtons({ queryParams }) {
  function handleExport(format) {
    triggerDownload(reservationsApi.exportUrl(format, queryParams));
  }

  return (
    <div className="export-buttons" role="group" aria-label="Exporter les réservations filtrées">
      <button type="button" className="btn" onClick={() => handleExport('csv')}>
        Export CSV
      </button>
      <button type="button" className="btn" onClick={() => handleExport('pdf')}>
        Export PDF
      </button>
    </div>
  );
}
