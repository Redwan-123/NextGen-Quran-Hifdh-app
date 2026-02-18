export function createHttpError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const payload = {
    error: err.message || 'Unexpected error',
    details: err.details || null
  };

  if (status >= 500) {
    console.error('Server error:', err);
  }

  res.status(status).json(payload);
}
