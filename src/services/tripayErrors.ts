/**
 * Tripay Error Handling
 * Centralized error types and handling for Tripay integration
 */

export enum TripayErrorCode {
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',

  // Authentication Errors
  INVALID_API_KEY = 'INVALID_API_KEY',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Validation Errors
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_PAYMENT_METHOD = 'INVALID_PAYMENT_METHOD',
  AMOUNT_TOO_LOW = 'AMOUNT_TOO_LOW',
  AMOUNT_TOO_HIGH = 'AMOUNT_TOO_HIGH',

  // Transaction Errors
  TRANSACTION_NOT_FOUND = 'TRANSACTION_NOT_FOUND',
  TRANSACTION_EXPIRED = 'TRANSACTION_EXPIRED',
  DUPLICATE_MERCHANT_REF = 'DUPLICATE_MERCHANT_REF',

  // Callback Errors
  INVALID_CALLBACK_SIGNATURE = 'INVALID_CALLBACK_SIGNATURE',
  CALLBACK_ALREADY_PROCESSED = 'CALLBACK_ALREADY_PROCESSED',

  // Database Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',

  // General Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class TripayError extends Error {
  constructor(
    public code: TripayErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'TripayError';
    Object.setPrototypeOf(this, TripayError.prototype);
  }
}

/**
 * Error messages mapping for user-friendly display
 */
export const ERROR_MESSAGES: Record<TripayErrorCode, string> = {
  [TripayErrorCode.NETWORK_ERROR]: 'Tidak dapat terhubung ke server pembayaran',
  [TripayErrorCode.TIMEOUT]: 'Koneksi timeout, silakan coba lagi',
  [TripayErrorCode.CONNECTION_REFUSED]: 'Koneksi ditolak, silakan coba lagi',
  [TripayErrorCode.INVALID_API_KEY]: 'Konfigurasi pembayaran tidak valid',
  [TripayErrorCode.INVALID_SIGNATURE]: 'Signature tidak valid',
  [TripayErrorCode.UNAUTHORIZED]: 'Tidak memiliki akses',
  [TripayErrorCode.INVALID_AMOUNT]: 'Nominal pembayaran tidak valid',
  [TripayErrorCode.INVALID_PAYMENT_METHOD]: 'Metode pembayaran tidak tersedia',
  [TripayErrorCode.AMOUNT_TOO_LOW]: 'Nominal terlalu kecil untuk metode pembayaran ini',
  [TripayErrorCode.AMOUNT_TOO_HIGH]: 'Nominal melebihi batas maksimal',
  [TripayErrorCode.TRANSACTION_NOT_FOUND]: 'Transaksi tidak ditemukan',
  [TripayErrorCode.TRANSACTION_EXPIRED]: 'Transaksi sudah kadaluarsa',
  [TripayErrorCode.DUPLICATE_MERCHANT_REF]: 'Referensi transaksi sudah digunakan',
  [TripayErrorCode.INVALID_CALLBACK_SIGNATURE]: 'Callback signature tidak valid',
  [TripayErrorCode.CALLBACK_ALREADY_PROCESSED]: 'Callback sudah diproses sebelumnya',
  [TripayErrorCode.DATABASE_ERROR]: 'Terjadi kesalahan database',
  [TripayErrorCode.INSUFFICIENT_BALANCE]: 'Saldo tidak mencukupi',
  [TripayErrorCode.UNKNOWN_ERROR]: 'Terjadi kesalahan, silakan coba lagi',
};

/**
 * Map error to user-friendly message
 */
export function mapErrorToUserMessage(code: TripayErrorCode): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[TripayErrorCode.UNKNOWN_ERROR];
}

/**
 * Map error code to HTTP status code
 */
export function mapErrorToStatusCode(code: TripayErrorCode): number {
  const statusMap: Record<TripayErrorCode, number> = {
    [TripayErrorCode.NETWORK_ERROR]: 503,
    [TripayErrorCode.TIMEOUT]: 504,
    [TripayErrorCode.CONNECTION_REFUSED]: 503,
    [TripayErrorCode.INVALID_API_KEY]: 401,
    [TripayErrorCode.INVALID_SIGNATURE]: 401,
    [TripayErrorCode.UNAUTHORIZED]: 401,
    [TripayErrorCode.INVALID_AMOUNT]: 400,
    [TripayErrorCode.INVALID_PAYMENT_METHOD]: 400,
    [TripayErrorCode.AMOUNT_TOO_LOW]: 400,
    [TripayErrorCode.AMOUNT_TOO_HIGH]: 400,
    [TripayErrorCode.TRANSACTION_NOT_FOUND]: 404,
    [TripayErrorCode.TRANSACTION_EXPIRED]: 410,
    [TripayErrorCode.DUPLICATE_MERCHANT_REF]: 409,
    [TripayErrorCode.INVALID_CALLBACK_SIGNATURE]: 403,
    [TripayErrorCode.CALLBACK_ALREADY_PROCESSED]: 200,
    [TripayErrorCode.DATABASE_ERROR]: 500,
    [TripayErrorCode.INSUFFICIENT_BALANCE]: 402,
    [TripayErrorCode.UNKNOWN_ERROR]: 500,
  };

  return statusMap[code] || 500;
}

/**
 * Parse Tripay API error response
 */
export function parseTripayError(error: any): TripayError {
  // Axios error
  if (error.response) {
    const data = error.response.data;
    const message = data?.message || 'Terjadi kesalahan';

    // Map specific error messages to error codes
    if (message.includes('amount')) {
      if (message.includes('minimum')) {
        return new TripayError(TripayErrorCode.AMOUNT_TOO_LOW, message, data);
      }
      if (message.includes('maximum')) {
        return new TripayError(TripayErrorCode.AMOUNT_TOO_HIGH, message, data);
      }
      return new TripayError(TripayErrorCode.INVALID_AMOUNT, message, data);
    }

    if (message.includes('payment method') || message.includes('channel')) {
      return new TripayError(TripayErrorCode.INVALID_PAYMENT_METHOD, message, data);
    }

    if (message.includes('not found')) {
      return new TripayError(TripayErrorCode.TRANSACTION_NOT_FOUND, message, data);
    }

    if (message.includes('expired')) {
      return new TripayError(TripayErrorCode.TRANSACTION_EXPIRED, message, data);
    }

    if (message.includes('duplicate') || message.includes('already exists')) {
      return new TripayError(TripayErrorCode.DUPLICATE_MERCHANT_REF, message, data);
    }

    if (message.includes('unauthorized') || message.includes('api key')) {
      return new TripayError(TripayErrorCode.INVALID_API_KEY, message, data);
    }

    return new TripayError(TripayErrorCode.UNKNOWN_ERROR, message, data);
  }

  // Network error
  if (error.request) {
    if (error.code === 'ECONNABORTED') {
      return new TripayError(TripayErrorCode.TIMEOUT, 'Koneksi timeout', error);
    }
    if (error.code === 'ECONNREFUSED') {
      return new TripayError(TripayErrorCode.CONNECTION_REFUSED, 'Koneksi ditolak', error);
    }
    return new TripayError(TripayErrorCode.NETWORK_ERROR, 'Tidak dapat terhubung ke server', error);
  }

  // Already a TripayError
  if (error instanceof TripayError) {
    return error;
  }

  // Unknown error
  return new TripayError(
    TripayErrorCode.UNKNOWN_ERROR,
    error.message || 'Terjadi kesalahan',
    error
  );
}

/**
 * Retry strategy with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on validation errors
      if (error instanceof TripayError) {
        const nonRetryableCodes = [
          TripayErrorCode.INVALID_AMOUNT,
          TripayErrorCode.INVALID_PAYMENT_METHOD,
          TripayErrorCode.AMOUNT_TOO_LOW,
          TripayErrorCode.AMOUNT_TOO_HIGH,
          TripayErrorCode.DUPLICATE_MERCHANT_REF,
          TripayErrorCode.INVALID_API_KEY,
        ];

        if (nonRetryableCodes.includes(error.code)) {
          throw error;
        }
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Log error for debugging
 */
export function logTripayError(error: TripayError, context?: string): void {
  console.error(`[Tripay Error${context ? ` - ${context}` : ''}]`, {
    code: error.code,
    message: error.message,
    details: error.details,
    stack: error.stack,
  });
}
