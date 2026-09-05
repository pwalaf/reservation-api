const { ZodError } = require('zod');

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'validation_error',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'id_invalide' });
  }

  console.error('[unhandled]', err);
  return res.status(500).json({ error: 'erreur_interne' });
}

module.exports = { errorHandler, ApiError };
