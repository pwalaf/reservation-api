const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI manquant dans .env');
  }

  mongoose.connection.on('connected', () => {
    console.log('[db] connecté à MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[db] erreur de connexion:', err.message);
  });

  await mongoose.connect(uri);
}

module.exports = { connectDB };
