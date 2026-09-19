import type { ErrorRequestHandler } from 'express';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : (typeof error.code === 'string' && error.code.startsWith('LIMIT_')) ? 400 : Number(error.status) || 500;
  if (status >= 500) console.error('[api]', error.message);
  res.status(status).json({ success: false, message: status === 413 ? 'Images must be 5 MB or smaller.' : status >= 500 && !(error instanceof HttpError) ? 'The request could not be completed. Please try again.' : error.message });
};
