import {
  isValidUrl,
  isValidEmail,
  isValidPhone,
  isValidAmount
} from '../validators';

describe('validators', () => {
  describe('isValidUrl', () => {
    it('validates correct HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('http://www.example.com')).toBe(true);
    });

    it('validates correct HTTPS URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://www.example.com')).toBe(true);
    });

    it('validates URLs with paths', () => {
      expect(isValidUrl('https://example.com/path/to/page')).toBe(true);
    });

    it('validates URLs with query parameters', () => {
      expect(isValidUrl('https://example.com?param=value')).toBe(true);
    });

    it('validates URLs with ports', () => {
      expect(isValidUrl('https://example.com:8080')).toBe(true);
    });

    it('rejects invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(true); // FTP is valid URL
    });

    it('rejects empty strings', () => {
      expect(isValidUrl('')).toBe(false);
    });

    it('rejects malformed URLs', () => {
      expect(isValidUrl('http://')).toBe(false);
      expect(isValidUrl('https://')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@example.com')).toBe(true);
      expect(isValidEmail('user+tag@example.co.id')).toBe(true);
    });

    it('validates emails with numbers', () => {
      expect(isValidEmail('user123@example.com')).toBe(true);
      expect(isValidEmail('123@example.com')).toBe(true);
    });

    it('validates emails with hyphens', () => {
      expect(isValidEmail('user-name@example.com')).toBe(true);
    });

    it('rejects emails without @', () => {
      expect(isValidEmail('userexample.com')).toBe(false);
    });

    it('rejects emails without domain', () => {
      expect(isValidEmail('user@')).toBe(false);
    });

    it('rejects emails without username', () => {
      expect(isValidEmail('@example.com')).toBe(false);
    });

    it('rejects emails with spaces', () => {
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('user@ example.com')).toBe(false);
    });

    it('rejects empty strings', () => {
      expect(isValidEmail('')).toBe(false);
    });

    it('rejects emails without TLD', () => {
      expect(isValidEmail('user@example')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('validates Indonesian phone numbers with +62', () => {
      expect(isValidPhone('+628123456789')).toBe(true);
      expect(isValidPhone('+6281234567890')).toBe(true);
    });

    it('validates Indonesian phone numbers with 62', () => {
      expect(isValidPhone('628123456789')).toBe(true);
    });

    it('validates Indonesian phone numbers with 0', () => {
      expect(isValidPhone('08123456789')).toBe(true);
      expect(isValidPhone('081234567890')).toBe(true);
    });

    it('validates phone numbers with spaces', () => {
      expect(isValidPhone('+62 812 3456 789')).toBe(true);
      expect(isValidPhone('0812 3456 7890')).toBe(true);
    });

    it('rejects phone numbers that are too short', () => {
      expect(isValidPhone('+62812345')).toBe(false);
      expect(isValidPhone('0812345')).toBe(false);
    });

    it('rejects phone numbers that are too long', () => {
      expect(isValidPhone('+628123456789012')).toBe(false);
    });

    it('rejects phone numbers with invalid prefix', () => {
      expect(isValidPhone('1234567890')).toBe(false);
      expect(isValidPhone('+1234567890')).toBe(false);
    });

    it('rejects empty strings', () => {
      expect(isValidPhone('')).toBe(false);
    });

    it('rejects phone numbers with letters', () => {
      expect(isValidPhone('+62812345678a')).toBe(false);
    });
  });

  describe('isValidAmount', () => {
    it('validates amounts above minimum', () => {
      expect(isValidAmount(100, 0)).toBe(true);
      expect(isValidAmount(10000, 5000)).toBe(true);
    });

    it('validates amounts equal to minimum', () => {
      expect(isValidAmount(10000, 10000)).toBe(true);
    });

    it('validates amounts below maximum', () => {
      expect(isValidAmount(5000, 0, 10000)).toBe(true);
    });

    it('validates amounts equal to maximum', () => {
      expect(isValidAmount(10000, 0, 10000)).toBe(true);
    });

    it('rejects amounts below minimum', () => {
      expect(isValidAmount(5000, 10000)).toBe(false);
    });

    it('rejects amounts above maximum', () => {
      expect(isValidAmount(15000, 0, 10000)).toBe(false);
    });

    it('uses default minimum of 0', () => {
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount(-100)).toBe(false);
    });

    it('validates zero when minimum is zero', () => {
      expect(isValidAmount(0, 0)).toBe(true);
    });

    it('validates amounts in range', () => {
      expect(isValidAmount(50000, 10000, 100000)).toBe(true);
    });

    it('handles decimal amounts', () => {
      expect(isValidAmount(10000.50, 10000, 20000)).toBe(true);
    });
  });
});
