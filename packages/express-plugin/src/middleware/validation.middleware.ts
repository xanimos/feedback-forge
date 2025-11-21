import type { Request, Response, NextFunction } from 'express';

/**
 * Validation error response
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: string[],
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate request body has required string fields
 */
export function validateRequiredFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const field of fields) {
      const value = req.body[field];
      if (value === undefined || value === null) {
        errors.push(`${field} is required`);
      } else if (typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      } else if (value.trim() === '') {
        errors.push(`${field} cannot be empty`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    next();
  };
}

/**
 * Validate optional fields are strings if present
 */
export function validateOptionalFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const field of fields) {
      const value = req.body[field];
      if (value !== undefined && value !== null && typeof value !== 'string') {
        errors.push(`${field} must be a string if provided`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    next();
  };
}
