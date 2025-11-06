/**
 * Zetsubou.life SDK Exceptions
 * 
 * Custom exception classes for handling API errors and SDK issues.
 */

export interface ErrorData {
  code?: string;
  message?: string;
  status_code?: number;
  request_id?: string;
  timestamp?: string;
  details?: any;
}

export class ZetsubouError extends Error {
  public readonly errorData: ErrorData;
  public readonly code: string;
  public readonly statusCode?: number;

  constructor(message: string, errorData: ErrorData = {}) {
    super(message);
    this.name = 'ZetsubouError';
    this.errorData = errorData;
    this.code = errorData.code || 'UNKNOWN_ERROR';
    this.statusCode = errorData.status_code;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ZetsubouError);
    }
  }
}

export class AuthenticationError extends ZetsubouError {
  constructor(message: string, errorData: ErrorData = {}) {
    super(message, errorData);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends ZetsubouError {
  public readonly retryAfter: number;

  constructor(message: string, errorData: ErrorData = {}, retryAfter: number = 60) {
    super(message, errorData);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class ValidationError extends ZetsubouError {
  constructor(message: string, errorData: ErrorData = {}) {
    super(message, errorData);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ZetsubouError {
  constructor(message: string, errorData: ErrorData = {}) {
    super(message, errorData);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends ZetsubouError {
  constructor(message: string, errorData: ErrorData = {}) {
    super(message, errorData);
    this.name = 'ServerError';
  }
}

export class WebhookError extends ZetsubouError {
  constructor(message: string, errorData: ErrorData = {}) {
    super(message, errorData);
    this.name = 'WebhookError';
  }
}

export class TimeoutError extends ZetsubouError {
  constructor(message: string, errorData: ErrorData = {}) {
    super(message, errorData);
    this.name = 'TimeoutError';
  }
}

export class ConnectionError extends ZetsubouError {
  constructor(message: string, errorData: ErrorData = {}) {
    super(message, errorData);
    this.name = 'ConnectionError';
  }
}