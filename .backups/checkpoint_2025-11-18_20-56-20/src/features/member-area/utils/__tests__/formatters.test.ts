import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatRelativeTime
} from '../formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers as Indonesian Rupiah', () => {
      const result = formatCurrency(10000);
      expect(result).toContain('Rp');
      expect(result).toContain('10.000');
    });

    it('formats large numbers with proper thousand separators', () => {
      const result = formatCurrency(1000000);
      expect(result).toContain('Rp');
      expect(result).toContain('1.000.000');
    });

    it('formats zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toContain('Rp');
      expect(result).toContain('0');
    });

    it('formats decimal numbers without fraction digits', () => {
      const result = formatCurrency(10000.99);
      expect(result).toContain('Rp');
      expect(result).toContain('10.000');
    });

    it('handles negative numbers', () => {
      const result = formatCurrency(-5000);
      expect(result).toContain('5.000');
    });
  });

  describe('formatDate', () => {
    it('formats Date object correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toMatch(/15|Jan|2024/);
    });

    it('formats date string correctly', () => {
      const result = formatDate('2024-03-20T15:45:00Z');
      expect(result).toMatch(/20|Mar|2024/);
    });

    it('handles different months', () => {
      const date = new Date('2024-12-25T00:00:00Z');
      const result = formatDate(date);
      expect(result).toMatch(/25|Des|2024/);
    });
  });

  describe('formatDateTime', () => {
    it('formats Date object with time', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateTime(date);
      expect(result).toMatch(/15|Jan|2024/);
      expect(result).toMatch(/\d{2}\.\d{2}/); // Time format
    });

    it('formats date string with time', () => {
      const result = formatDateTime('2024-03-20T15:45:00Z');
      expect(result).toMatch(/20|Mar|2024/);
      expect(result).toMatch(/\d{2}\.\d{2}/);
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with thousand separators', () => {
      expect(formatNumber(1000)).toBe('1.000');
    });

    it('formats large numbers correctly', () => {
      expect(formatNumber(1234567)).toBe('1.234.567');
    });

    it('formats zero correctly', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('formats decimal numbers', () => {
      const result = formatNumber(1234.56);
      expect(result).toContain('1.234');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns "Baru saja" for times less than 60 seconds ago', () => {
      const date = new Date('2024-01-15T11:59:30Z');
      expect(formatRelativeTime(date)).toBe('Baru saja');
    });

    it('returns minutes for times less than 1 hour ago', () => {
      const date = new Date('2024-01-15T11:45:00Z');
      expect(formatRelativeTime(date)).toBe('15 menit yang lalu');
    });

    it('returns hours for times less than 24 hours ago', () => {
      const date = new Date('2024-01-15T09:00:00Z');
      expect(formatRelativeTime(date)).toBe('3 jam yang lalu');
    });

    it('returns days for times less than 7 days ago', () => {
      const date = new Date('2024-01-13T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('2 hari yang lalu');
    });

    it('returns formatted date for times more than 7 days ago', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const result = formatRelativeTime(date);
      expect(result).toMatch(/01|Jan|2024/);
    });

    it('handles string dates', () => {
      const result = formatRelativeTime('2024-01-15T11:55:00Z');
      expect(result).toBe('5 menit yang lalu');
    });
  });
});
