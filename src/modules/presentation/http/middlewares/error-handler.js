import { NotFoundError } from '../../../application/errors/not-found.error.js';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import { logger } from '../../../shared/logger/console-logger.js';

function getStatusCode(error) {
  if (error instanceof NotFoundError) {
    return 404;
  }

  if (error instanceof ValidationError) {
    return 400;
  }

  return 500;
}

function getMessage(error) {
  if (error instanceof ValidationError) {
    return error.message;
  }

  return 'Erro interno do servidor';
}

export function httpErrorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = getStatusCode(error);
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel]('HTTP', `${req.method} ${req.originalUrl}`, {
    error: error.message,
    statusCode,
  });

  return res.status(statusCode).json({ error: getMessage(error) });
}
