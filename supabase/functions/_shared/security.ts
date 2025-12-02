/**
 * Security Utilities
 * IP validation, signature verification, and input sanitization
 */

import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';
import { TRIPAY_IP_WHITELIST, DEVELOPMENT_IPS } from './constants.ts';

/**
 * Parse CIDR notation and check if IP is in range
 */
function ipToNumber(ip: string): number {
  const parts = ip.split('.');
  return parts.reduce((acc, part, i) => {
    return acc + (parseInt(part) << (24 - i * 8));
  }, 0);
}

function cidrToRange(cidr: string): { start: number; end: number } {
  const [ip, bits] = cidr.split('/');
  const mask = ~((1 << (32 - parseInt(bits))) - 1);
  const start = ipToNumber(ip) & mask;
  const end = start | ~mask;
  return { start, end };
}

/**
 * Extract source IP from request headers
 * Handles proxy headers (X-Forwarded-For, X-Real-IP)
 */
export function getSourceIP(req: Request): string {
  // Check X-Forwarded-For header (may contain multiple IPs)
  const forwardedFor = req.headers.get('X-Forwarded-For');
  if (forwardedFor) {
    // Take the first IP (original client)
    return forwardedFor.split(',')[0].trim();
  }

  // Check X-Real-IP header
  const realIP = req.headers.get('X-Real-IP');
  if (realIP) {
    return realIP.trim();
  }

  // Fallback to connection remote address (not available in Deno Deploy)
  return 'unknown';
}

/**
 * Validate if IP is in Tripay whitelist
 */
export function isValidTripayIP(ip: string): boolean {
  // Allow development IPs
  if (DEVELOPMENT_IPS.includes(ip)) {
    return true;
  }

  // Check if IP is IPv4
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
    console.warn('⚠️ Non-IPv4 address detected:', ip);
    return false;
  }

  const ipNum = ipToNumber(ip);

  // Check against each CIDR range
  for (const cidr of TRIPAY_IP_WHITELIST) {
    const { start, end } = cidrToRange(cidr);
    if (ipNum >= start && ipNum <= end) {
      return true;
    }
  }

  return false;
}

/**
 * Verify HMAC SHA-256 signature
 * Uses constant-time comparison to prevent timing attacks
 */
export function verifySignature(
  rawBody: string,
  signature: string,
  privateKey: string
): boolean {
  const hmac = createHmac('sha256', privateKey);
  hmac.update(rawBody);
  const calculatedSignature = hmac.digest('hex');

  // Constant-time comparison
  if (calculatedSignature.length !== signature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < calculatedSignature.length; i++) {
    result |= calculatedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Generate HMAC SHA-256 signature for Tripay requests
 */
export function generateSignature(
  merchantCode: string,
  merchantRef: string,
  amount: number,
  privateKey: string
): string {
  const signatureString = `${merchantCode}${merchantRef}${amount}`;
  const hmac = createHmac('sha256', privateKey);
  hmac.update(signatureString);
  return hmac.digest('hex');
}

/**
 * Sanitize input to prevent SQL injection and XSS
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  return input
    // Remove SQL injection patterns
    .replace(/['";\\]/g, '')
    // Remove XSS patterns
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Trim whitespace
    .trim();
}

/**
 * Validate transaction data structure
 */
export function validateTransactionData(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.reference || typeof data.reference !== 'string') {
    errors.push('Invalid reference');
  }

  if (!data.merchant_ref || typeof data.merchant_ref !== 'string') {
    errors.push('Invalid merchant_ref');
  }

  if (!data.status || !['PAID', 'UNPAID', 'EXPIRED', 'FAILED'].includes(data.status)) {
    errors.push('Invalid status');
  }

  if (typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push('Invalid amount');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate callback payload structure
 */
export function validateCallbackPayload(payload: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  const requiredFields = [
    'reference',
    'merchant_ref',
    'payment_method',
    'status',
    'amount',
  ];

  for (const field of requiredFields) {
    if (!payload[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate status enum
  if (payload.status && !['PAID', 'UNPAID', 'EXPIRED', 'FAILED'].includes(payload.status)) {
    errors.push('Invalid status value');
  }

  // Validate numeric fields
  if (payload.amount && (typeof payload.amount !== 'number' || payload.amount <= 0)) {
    errors.push('Invalid amount value');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
