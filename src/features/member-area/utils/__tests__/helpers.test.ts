import {
  truncateText,
  copyToClipboard,
  debounce,
  generateId
} from '../helpers';

describe('helpers', () => {
  describe('truncateText', () => {
    it('returns original text when shorter than maxLength', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('returns original text when equal to maxLength', () => {
      expect(truncateText('Hello', 5)).toBe('Hello');
    });

    it('truncates text longer than maxLength', () => {
      expect(truncateText('Hello World', 8)).toBe('Hello Wo...');
    });

    it('adds ellipsis to truncated text', () => {
      const result = truncateText('This is a long text', 10);
      expect(result).toBe('This is a ...');
      expect(result.length).toBe(13); // 10 + 3 for '...'
    });

    it('handles empty strings', () => {
      expect(truncateText('', 10)).toBe('');
    });

    it('handles maxLength of 0', () => {
      expect(truncateText('Hello', 0)).toBe('...');
    });

    it('handles very long text', () => {
      const longText = 'a'.repeat(1000);
      const result = truncateText(longText, 50);
      expect(result.length).toBe(53);
      expect(result.endsWith('...')).toBe(true);
    });
  });

  describe('copyToClipboard', () => {
    beforeEach(() => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn()
        }
      });
    });

    it('copies text to clipboard successfully', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);
      
      const result = await copyToClipboard('test text');
      
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
    });

    it('handles empty strings', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);
      
      const result = await copyToClipboard('');
      
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('');
    });

    it('handles long text', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);
      
      const longText = 'a'.repeat(1000);
      const result = await copyToClipboard(longText);
      
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(longText);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('delays function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);
      
      debouncedFn();
      
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(1000);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('cancels previous calls when called multiple times', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);
      
      debouncedFn();
      jest.advanceTimersByTime(500);
      
      debouncedFn();
      jest.advanceTimersByTime(500);
      
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(500);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('passes arguments to debounced function', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);
      
      debouncedFn('arg1', 'arg2');
      
      jest.advanceTimersByTime(1000);
      
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('uses latest arguments when called multiple times', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);
      
      debouncedFn('first');
      jest.advanceTimersByTime(500);
      
      debouncedFn('second');
      jest.advanceTimersByTime(1000);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('second');
    });

    it('handles zero wait time', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 0);
      
      debouncedFn();
      
      jest.advanceTimersByTime(0);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('handles multiple rapid calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);
      
      for (let i = 0; i < 10; i++) {
        debouncedFn(i);
        jest.advanceTimersByTime(100);
      }
      
      jest.advanceTimersByTime(1000);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(9);
    });
  });

  describe('generateId', () => {
    it('generates a string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });

    it('generates non-empty strings', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(0);
    });

    it('generates unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });

    it('generates IDs with reasonable length', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(10);
      expect(id.length).toBeLessThan(30);
    });

    it('generates alphanumeric IDs', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+$/);
    });

    it('generates different IDs on consecutive calls', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });
});
