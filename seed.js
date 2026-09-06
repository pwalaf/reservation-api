// Peuple la base avec des données réalistes pour la démo/vidéo : plusieurs
// mois, plusieurs types de chambre, quelques réservations annulées pour que
// les filtres et l'agrégation aient un vrai résultat à montrer. Chaque
// réservation reçoit un historique de statuts cohérent (création puis,
// selon le cas, confirmation ou annulation quelques heures plus tard) pour
// que le calcul de délai moyen de confirmation ait des données à agréger.
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./src/config/db');
const { Reservation } = require('./src/models/Reservation');

function withHistory(entry, hoursToResolve) {
  const created = new Date(entry.checkIn);
  created.setDate(created.getDate() - 20); // réservation faite ~20 jours avant l'arrivée
  const history = [{ status: 'en_attente', changedAt: created }];

  if (entry.status !== 'en_attente') {
    const resolved = new Date(created.getTime() + hoursToResolve * 60 * 60 * 1000);
    history.push({ status: entry.status, changedAt: resolved });
  }

  return { ...entry, statusHistory: history };
}

const sample = [
  withHistory({ clientName: 'Rakoto Andry', roomType: 'double', checkIn: '2026-06-03', checkOut: '2026-06-05', status: 'confirmee', amount: 120000 }, 4),
  withHistory({ clientName: 'Hery Rasoanaivo', roomType: 'suite', checkIn: '2026-06-10', checkOut: '2026-06-13', status: 'confirmee', amount: 340000 }, 12),
  withHistory({ clientName: 'Nirina Rabe', roomType: 'simple', checkIn: '2026-06-15', checkOut: '2026-06-16', status: 'annulee', amount: 45000 }, 30),
  withHistory({ clientName: 'Voahangy Randria', roomType: 'dortoir', checkIn: '2026-06-20', checkOut: '2026-06-22', status: 'confirmee', amount: 60000 }, 2),
  withHistory({ clientName: 'Jean-Claude Ravelo', roomType: 'double', checkIn: '2026-07-02', checkOut: '2026-07-04', status: 'confirmee', amount: 130000 }, 8),
  withHistory({ clientName: 'Soa Andrianina', roomType: 'suite', checkIn: '2026-07-08', checkOut: '2026-07-11', status: 'en_attente', amount: 350000 }, 0),
  withHistory({ clientName: 'Fanja Rakotomalala', roomType: 'simple', checkIn: '2026-07-14', checkOut: '2026-07-15', status: 'confirmee', amount: 48000 }, 1),
  withHistory({ clientName: 'Tojo Andriamahefa', roomType: 'double', checkIn: '2026-07-20', checkOut: '2026-07-23', status: 'confirmee', amount: 195000 }, 6),
];

async function run() {
  await connectDB();
  await Reservation.deleteMany({});
  await Reservation.insertMany(sample);
  console.log(`[seed] ${sample.length} réservations insérées`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[seed] échec:', err.message);
  process.exit(1);
});
