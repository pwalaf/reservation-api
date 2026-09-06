const PDFDocument = require('pdfkit');
const { formatAmount, formatDate, roomTypeLabel, statusLabel } = require('./format');

const COLUMNS = [
  { label: 'Client', width: 120, align: 'left', get: (r) => r.clientName },
  { label: 'Chambre', width: 70, align: 'left', get: (r) => roomTypeLabel(r.roomType) },
  { label: 'Séjour', width: 130, align: 'left', get: (r) => `${formatDate(r.checkIn)} - ${formatDate(r.checkOut)}` },
  { label: 'Statut', width: 80, align: 'left', get: (r) => statusLabel(r.status) },
  { label: 'Montant', width: 90, align: 'right', get: (r) => formatAmount(r.amount) }, 
];

const ROW_HEIGHT = 20;

function reservationsToPdf(reservations, { title = 'Réservations' } = {}) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const startX = doc.page.margins.left;
  const tableWidth = COLUMNS.reduce((sum, column) => sum + column.width, 0);

  doc.fontSize(16).font('Helvetica-Bold').text(title);
  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#736c60')
    .text(`Généré le ${formatDate(new Date())} — ${reservations.length} réservation(s)`);
  doc.fillColor('#201e1a').moveDown(1);

  let y = doc.y;

  function ensureSpace() {
    if (y > doc.page.height - doc.page.margins.bottom - ROW_HEIGHT) {
      doc.addPage();
      y = doc.page.margins.top;
    }
  }

  function drawRow(values, { bold = false } = {}) {
    ensureSpace();
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
    let x = startX;
    
    values.forEach((value, index) => {
      const column = COLUMNS[index];
      
      doc.text(String(value), x, y, { 
        width: column.width, 
        ellipsis: true,
        align: column.align 
      });
      x += column.width;
    });
    y += ROW_HEIGHT;
  }

  drawRow(
    COLUMNS.map((column) => column.label),
    { bold: true }
  );
  doc
    .moveTo(startX, y - 4)
    .lineTo(startX + tableWidth, y - 4)
    .strokeColor('#e6e2d9')
    .stroke();

  reservations.forEach((reservation) => {
    drawRow(COLUMNS.map((column) => column.get(reservation)));
  });

  doc.end();
  return doc;
}

module.exports = { reservationsToPdf };
