/**
 * Encryption Service
 * AES-256-GCM encryption/decryption for sensitive account data
 */

import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

export interface EncryptedData {
  encrypted: true;
  version: number;
  data: {
    ciphertext: string; // Base64 encoded
    iv: string;         // Base64 encoded
    tag: string;        // Base64 encoded authentication tag
  };
}

export interface DecryptedData {
  [key: string]: any;
}

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits authentication tag

/**
 * Get encryption key from environment
 * Key should be 32 bytes (256 bits) base64 encoded
 */
function getEncryptionKey(): CryptoKey {
  const masterKeyB64 = Deno.env.get('ENCRYPTION_MASTER_KEY');
  
  if (!masterKeyB64) {
    throw new Error('ENCRYPTION_MASTER_KEY not configured');
  }

  // Decode base64 key
  const keyData = Uint8Array.from(atob(masterKeyB64), c => c.charCodeAt(0));
  
  if (keyData.length !== 32) {
    throw new Error('ENCRYPTION_MASTER_KEY must be 32 bytes (256 bits)');
  }

  // Import key for AES-GCM
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate random IV (Initialization Vector)
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Convert Uint8Array to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypt plaintext data using AES-256-GCM
 * Returns encrypted data with IV and authentication tag
 */
export async function encrypt(plaintext: string | object): Promise<EncryptedData> {
  try {
    // Convert object to JSON string if needed
    const plaintextStr = typeof plaintext === 'string' 
      ? plaintext 
      : JSON.stringify(plaintext);

    // Get encryption key
    const key = await getEncryptionKey();

    // Generate random IV
    const iv = generateIV();

    // Convert plaintext to Uint8Array
    const encoder = new TextEncoder();
    const plaintextBytes = encoder.encode(plaintextStr);

    // Encrypt using AES-GCM
    const ciphertextWithTag = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
        tagLength: TAG_LENGTH * 8, // bits
      },
      key,
      plaintextBytes
    );

    // Split ciphertext and authentication tag
    // GCM appends the tag to the ciphertext
    const ciphertextBytes = new Uint8Array(ciphertextWithTag.slice(0, -TAG_LENGTH));
    const tagBytes = new Uint8Array(ciphertextWithTag.slice(-TAG_LENGTH));

    // Convert to base64 for storage
    const ciphertext = arrayBufferToBase64(ciphertextBytes);
    const ivB64 = arrayBufferToBase64(iv);
    const tag = arrayBufferToBase64(tagBytes);

    return {
      encrypted: true,
      version: 1,
      data: {
        ciphertext,
        iv: ivB64,
        tag,
      },
    };
  } catch (error) {
    console.error('❌ Encryption failed:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt encrypted data using AES-256-GCM
 * Verifies authentication tag before decryption
 */
export async function decrypt(encrypted: EncryptedData): Promise<DecryptedData> {
  try {
    // Validate encrypted data structure
    if (!encrypted.encrypted || !encrypted.data) {
      throw new Error('Invalid encrypted data structure');
    }

    const { ciphertext, iv, tag } = encrypted.data;

    if (!ciphertext || !iv || !tag) {
      throw new Error('Missing encryption components');
    }

    // Get encryption key
    const key = await getEncryptionKey();

    // Convert base64 to Uint8Array
    const ciphertextBytes = base64ToArrayBuffer(ciphertext);
    const ivBytes = base64ToArrayBuffer(iv);
    const tagBytes = base64ToArrayBuffer(tag);

    // Combine ciphertext and tag for GCM
    const ciphertextWithTag = new Uint8Array(ciphertextBytes.length + tagBytes.length);
    ciphertextWithTag.set(ciphertextBytes, 0);
    ciphertextWithTag.set(tagBytes, ciphertextBytes.length);

    // Decrypt using AES-GCM
    const plaintextBytes = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: ivBytes,
        tagLength: TAG_LENGTH * 8, // bits
      },
      key,
      ciphertextWithTag
    );

    // Convert to string
    const decoder = new TextDecoder();
    const plaintextStr = decoder.decode(plaintextBytes);

    // Try to parse as JSON, otherwise return as string
    try {
      return JSON.parse(plaintextStr);
    } catch {
      return { value: plaintextStr };
    }
  } catch (error) {
    console.error('❌ Decryption failed:', error);
    throw new Error('Decryption failed - data may be corrupted or key is incorrect');
  }
}

/**
 * Check if data is encrypted
 */
export function isEncrypted(data: any): data is EncryptedData {
  return (
    data &&
    typeof data === 'object' &&
    data.encrypted === true &&
    data.data &&
    typeof data.data.ciphertext === 'string' &&
    typeof data.data.iv === 'string' &&
    typeof data.data.tag === 'string'
  );
}

/**
 * Encrypt account data (supports both old and new formats)
 * If data is already encrypted, return as-is
 */
export async function encryptAccountData(data: any): Promise<EncryptedData> {
  // If already encrypted, return as-is
  if (isEncrypted(data)) {
    return data;
  }

  // Encrypt plaintext data
  return await encrypt(data);
}

/**
 * Decrypt account data (supports both old and new formats)
 * If data is plaintext, return as-is (backward compatibility)
 */
export async function decryptAccountData(data: any): Promise<DecryptedData> {
  // If encrypted, decrypt it
  if (isEncrypted(data)) {
    return await decrypt(data);
  }

  // If plaintext (old format), return as-is
  return data;
}

/**
 * Generate a new encryption key (for initial setup)
 * Returns base64 encoded 256-bit key
 */
export function generateEncryptionKey(): string {
  const key = crypto.getRandomValues(new Uint8Array(32)); // 256 bits
  return arrayBufferToBase64(key);
}
