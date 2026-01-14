import logger from './logger.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleError(error, context = '') {
  logger.error(`Error in ${context}`, error, {
    statusCode: error.statusCode,
    isOperational: error.isOperational
  });

  if (!error.isOperational) {
    // Critical error - might want to alert/restart
    console.error('💥 CRITICAL ERROR:', error);
  }
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}