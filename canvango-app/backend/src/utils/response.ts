import { Response } from 'express';
import { ApiSuccess, ApiError } from '../types/index.js';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiSuccess<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: any
): Response => {
  const response: ApiError = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
  return res.status(statusCode).json(response);
};

// Helper functions for creating response objects (not sending)
export const successResponse = <T>(data: T, message?: string): ApiSuccess<T> => {
  return {
    success: true,
    data,
    message,
  };
};

export const errorResponse = (code: string, message: string, details?: any): ApiError => {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
};
