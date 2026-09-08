require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const reservationsRouter = require('./routes/reservations.routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors(
    allowedOrigins.length > 0
      ? { origin: allowedOrigins }
      : undefined
  )
);
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/ping', (req, res) => res.status(200).send('pong'));
app.use('/api/reservations', reservationsRouter);

app.use((req, res) => res.status(404).json({ error: 'route_introuvable' }));

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] API réservations en écoute sur le port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('[server] échec du démarrage:', err.message);
  process.exit(1);
});
