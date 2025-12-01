/**
 * Unit Tests for Tripay Error Handling
 */

import { describe, it, expect } from 'vitest';
import {
  TripayError,
  TripayErrorCode,
  mapErrorToUserMessage,
  mapErrorToStatusCode,
  parseTripayError,
} from '../tripayErrors';

describe('Tripay Error Handling', () => {
  describe('TripayError', () => {
    it('should create error with code and message', () => {
      const error = new TripayError(
        TripayErrorCode.INVALID_AMOUNT,
        'Invalid amount provided'
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TripayError);
      expect(error.code).toBe(TripayErrorCode.INVALID_AMOUNT);
      expect(error.message).toBe('Invalid amount provided');
      expect(error.name).toBe('TripayError');
    });

    it('should store additional details', () => {
      const details = { min: 10000, max: 1000000 };
      const error = new TripayError(
        TripayErrorCode.AMOUNT_TOO_LOW,
        'Amount too low',
        details
      );

      expect(error.details).toEqual(details);
    });
  });

  describe('mapErrorToUserMessage', () => {
    it('should return user-friendly message for known error codes', () => {
      const message = mapErrorToUserMessage(TripayErrorCode.NETWORK_ERROR);
      expect(message).toBe('Tidak dapat terhubung ke server pembayaran');
    });

    it('should return generic message for unknown error codes', () => {
      const message = mapErrorToUserMessage('UNKNOWN_CODE' as TripayErrorCode);
      expect(message).toBe('Terjadi kesalahan, silakan coba lagi');
    });

    it('should have messages for all error codes', () => {
      const errorCodes = Object.values(TripayErrorCode);
      
      errorCodes.forEach(code => {
        const message = mapErrorToUserMessage(code);
        expect(message).toBeTruthy();
        expect(typeof message).toBe('string');
      });
    });
  });

  describe('mapErrorToStatusCode', () => {
    it('should map network errors to 503', () => {
      expect(mapErrorToStatusCode(TripayErrorCode.NETWORK_ERROR)).toBe(503);
      expect(mapErrorToStatusCode(TripayErrorCode.CONNECTION_REFUSED)).toBe(503);
    });

    it('should map timeout to 504', () => {
      expect(mapErrorToStatusCode(TripayErrorCode.TIMEOUT)).toBe(504);
    });

    it('should map auth errors to 401', () => {
      expect(mapErrorToStatusCode(TripayErrorCode.INVALID_API_KEY)).toBe(401);
      expect(mapErrorToStatusCode(TripayErrorCode.UNAUTHORIZED)).toBe(401);
    });

    it('should map validation errors to 400', () => {
      expect(mapErrorToStatusCode(TripayErrorCode.INVALID_AMOUNT)).toBe(400);
      expect(mapErrorToStatusCode(TripayErrorCode.INVALID_PAYMENT_METHOD)).toBe(400);
    });

    it('should map not found to 404', () => {
      expect(mapErrorToStatusCode(TripayErrorCode.TRANSACTION_NOT_FOUND)).toBe(404);
    });

    it('should map unknown errors to 500', () => {
      expect(mapErrorToStatusCode(TripayErrorCode.UNKNOWN_ERROR)).toBe(500);
    });
  });

  describe('parseTripayError', () => {
    it('should parse axios error with response', () => {
      const axiosError = {
        response: {
          data: {
            message: 'Amount is below minimum',
            code: 'AMOUNT_TOO_LOW',
          },
        },
      };

      const error = parseTripayError(axiosError);

      expect(error).toBeInstanceOf(TripayError);
      expect(error.code).toBe(TripayErrorCode.AMOUNT_TOO_LOW);
      expect(error.message).toBe('Amount is below minimum');
    });

    it('should detect amount errors from message', () => {
      const axiosError = {
        response: {
          data: {
            message: 'Amount must be at least 10000',
          },
        },
      };

      const error = parseTripayError(axiosError);

      expect(error.code).toBe(TripayErrorCode.AMOUNT_TOO_LOW);
    });

    it('should detect payment method errors', () => {
      const axiosError = {
        response: {
          data: {
            message: 'Payment method not available',
          },
        },
      };

      const error = parseTripayError(axiosError);

      expect(error.code).toBe(TripayErrorCode.INVALID_PAYMENT_METHOD);
    });

    it('should detect not found errors', () => {
      const axiosError = {
        response: {
          data: {
            message: 'Transaction not found',
          },
        },
      };

      const error = parseTripayError(axiosError);

      expect(error.code).toBe(TripayErrorCode.TRANSACTION_NOT_FOUND);
    });

    it('should parse network errors', () => {
      const networkError = {
        request: {},
        code: 'ECONNABORTED',
      };

      const error = parseTripayError(networkError);

      expect(error.code).toBe(TripayErrorCode.TIMEOUT);
    });

    it('should handle connection refused', () => {
      const networkError = {
        request: {},
        code: 'ECONNREFUSED',
      };

      const error = parseTripayError(networkError);

      expect(error.code).toBe(TripayErrorCode.CONNECTION_REFUSED);
    });

    it('should return TripayError as-is', () => {
      const originalError = new TripayError(
        TripayErrorCode.INVALID_AMOUNT,
        'Test error'
      );

      const error = parseTripayError(originalError);

      expect(error).toBe(originalError);
    });

    it('should handle unknown errors', () => {
      const unknownError = new Error('Something went wrong');

      const error = parseTripayError(unknownError);

      expect(error.code).toBe(TripayErrorCode.UNKNOWN_ERROR);
      expect(error.message).toBe('Something went wrong');
    });
  });
});
