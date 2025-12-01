/**
 * Unit Tests for Tripay Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateTotalAmount,
  generateClosedPaymentSignature,
  generateOpenPaymentSignature,
  validateCallbackSignature,
} from '../tripay.service';
import type { TripayPaymentMethod } from '../tripay.service';

describe('Tripay Service', () => {
  describe('calculateTotalAmount', () => {
    it('should calculate total with flat and percentage fee', () => {
      const method: TripayPaymentMethod = {
        code: 'BRIVA',
        name: 'BRI Virtual Account',
        fee_merchant: { flat: 4000, percent: 1.5 },
        fee_customer: { flat: 0, percent: 0 },
        total_fee: { flat: 4000, percent: 1.5 },
        minimum_fee: 0,
        maximum_fee: 0,
        icon_url: '',
        active: true,
      };

      const total = calculateTotalAmount(100000, method);
      
      // 100000 + 4000 (flat) + 1500 (1.5% of 100000) = 105500
      expect(total).toBe(105500);
    });

    it('should apply minimum fee if calculated fee is lower', () => {
      const method: TripayPaymentMethod = {
        code: 'BRIVA',
        name: 'BRI Virtual Account',
        fee_merchant: { flat: 100, percent: 0 },
        fee_customer: { flat: 0, percent: 0 },
        total_fee: { flat: 100, percent: 0 },
        minimum_fee: 1000,
        maximum_fee: 0,
        icon_url: '',
        active: true,
      };

      const total = calculateTotalAmount(10000, method);
      
      // 10000 + 1000 (minimum fee) = 11000
      expect(total).toBe(11000);
    });

    it('should apply maximum fee if calculated fee is higher', () => {
      const method: TripayPaymentMethod = {
        code: 'BRIVA',
        name: 'BRI Virtual Account',
        fee_merchant: { flat: 0, percent: 5 },
        fee_customer: { flat: 0, percent: 0 },
        total_fee: { flat: 0, percent: 5 },
        minimum_fee: 0,
        maximum_fee: 5000,
        icon_url: '',
        active: true,
      };

      const total = calculateTotalAmount(200000, method);
      
      // 200000 + 5000 (max fee, instead of 10000 which is 5%) = 205000
      expect(total).toBe(205000);
    });

    it('should handle zero fees', () => {
      const method: TripayPaymentMethod = {
        code: 'QRIS',
        name: 'QRIS',
        fee_merchant: { flat: 0, percent: 0 },
        fee_customer: { flat: 0, percent: 0 },
        total_fee: { flat: 0, percent: 0 },
        minimum_fee: 0,
        maximum_fee: 0,
        icon_url: '',
        active: true,
      };

      const total = calculateTotalAmount(50000, method);
      
      expect(total).toBe(50000);
    });
  });

  describe('generateClosedPaymentSignature', () => {
    it('should generate correct HMAC-SHA256 signature for Closed Payment', async () => {
      const merchantCode = 'T12345';
      const merchantRef = 'INV-001';
      const amount = 100000;
      const privateKey = 'test-private-key';

      const signature = await generateClosedPaymentSignature(
        merchantCode,
        merchantRef,
        amount,
        privateKey
      );

      // Signature should be a hex string
      expect(signature).toMatch(/^[a-f0-9]{64}$/);
      expect(typeof signature).toBe('string');
      expect(signature.length).toBe(64);
    });

    it('should generate different signatures for different inputs', async () => {
      const privateKey = 'test-private-key';

      const sig1 = await generateClosedPaymentSignature('T12345', 'INV-001', 100000, privateKey);
      const sig2 = await generateClosedPaymentSignature('T12345', 'INV-002', 100000, privateKey);
      const sig3 = await generateClosedPaymentSignature('T12345', 'INV-001', 200000, privateKey);

      expect(sig1).not.toBe(sig2);
      expect(sig1).not.toBe(sig3);
      expect(sig2).not.toBe(sig3);
    });

    it('should generate same signature for same inputs', async () => {
      const privateKey = 'test-private-key';

      const sig1 = await generateClosedPaymentSignature('T12345', 'INV-001', 100000, privateKey);
      const sig2 = await generateClosedPaymentSignature('T12345', 'INV-001', 100000, privateKey);

      expect(sig1).toBe(sig2);
    });
  });

  describe('generateOpenPaymentSignature', () => {
    it('should generate correct HMAC-SHA256 signature for Open Payment', async () => {
      const merchantCode = 'T12345';
      const channel = 'BRIVA';
      const merchantRef = 'OPEN-001';
      const privateKey = 'test-private-key';

      const signature = await generateOpenPaymentSignature(
        merchantCode,
        channel,
        merchantRef,
        privateKey
      );

      // Signature should be a hex string
      expect(signature).toMatch(/^[a-f0-9]{64}$/);
      expect(typeof signature).toBe('string');
      expect(signature.length).toBe(64);
    });

    it('should generate different signatures for different channels', async () => {
      const privateKey = 'test-private-key';

      const sig1 = await generateOpenPaymentSignature('T12345', 'BRIVA', 'OPEN-001', privateKey);
      const sig2 = await generateOpenPaymentSignature('T12345', 'BNIVA', 'OPEN-001', privateKey);

      expect(sig1).not.toBe(sig2);
    });

    it('should use different format than Closed Payment', async () => {
      const privateKey = 'test-private-key';

      const closedSig = await generateClosedPaymentSignature('T12345', 'INV-001', 100000, privateKey);
      const openSig = await generateOpenPaymentSignature('T12345', 'BRIVA', 'INV-001', privateKey);

      expect(closedSig).not.toBe(openSig);
    });
  });

  describe('validateCallbackSignature', () => {
    it('should validate correct callback signature', async () => {
      const payload = JSON.stringify({ merchant_ref: 'INV-001', status: 'PAID' });
      const privateKey = 'test-private-key';

      // Generate signature
      const encoder = new TextEncoder();
      const keyData = encoder.encode(privateKey);
      const messageData = encoder.encode(payload);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const signature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Validate
      const isValid = await validateCallbackSignature(payload, signature, privateKey);

      expect(isValid).toBe(true);
    });

    it('should reject invalid callback signature', async () => {
      const payload = JSON.stringify({ merchant_ref: 'INV-001', status: 'PAID' });
      const privateKey = 'test-private-key';
      const invalidSignature = 'invalid-signature-123';

      const isValid = await validateCallbackSignature(payload, invalidSignature, privateKey);

      expect(isValid).toBe(false);
    });

    it('should reject signature with wrong private key', async () => {
      const payload = JSON.stringify({ merchant_ref: 'INV-001', status: 'PAID' });
      const privateKey1 = 'test-private-key-1';
      const privateKey2 = 'test-private-key-2';

      // Generate signature with key1
      const encoder = new TextEncoder();
      const keyData = encoder.encode(privateKey1);
      const messageData = encoder.encode(payload);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const signature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Validate with key2
      const isValid = await validateCallbackSignature(payload, signature, privateKey2);

      expect(isValid).toBe(false);
    });

    it('should reject signature with modified payload', async () => {
      const payload1 = JSON.stringify({ merchant_ref: 'INV-001', status: 'PAID' });
      const payload2 = JSON.stringify({ merchant_ref: 'INV-001', status: 'FAILED' });
      const privateKey = 'test-private-key';

      // Generate signature for payload1
      const encoder = new TextEncoder();
      const keyData = encoder.encode(privateKey);
      const messageData = encoder.encode(payload1);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const signature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Validate with payload2
      const isValid = await validateCallbackSignature(payload2, signature, privateKey);

      expect(isValid).toBe(false);
    });
  });
});
