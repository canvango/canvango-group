/**
 * Environment utilities for Vite
 * Provides safe access to environment variables
 */

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const mode = import.meta.env.MODE;

/**
 * Get environment variable with fallback
 */
export function getEnv(key: string, fallback: string = ''): string {
  return import.meta.env[key] || fallback;
}

/**
 * Check if running in development mode
 */
export function isDev(): boolean {
  return isDevelopment;
}

/**
 * Check if running in production mode
 */
export function isProd(): boolean {
  return isProduction;
}
