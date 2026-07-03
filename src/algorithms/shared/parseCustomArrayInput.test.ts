import { describe, it, expect } from 'vitest';
import { parseCustomArrayInput } from '@/algorithms/shared/parseCustomArrayInput';

describe('parseCustomArrayInput', () => {
  describe('valid inputs', () => {
    it('parses a basic comma-separated list', () => {
      const result = parseCustomArrayInput('5,2,8,1,9,4');
      expect(result.error).toBeNull();
      expect(result.values).toEqual([5, 2, 8, 1, 9, 4]);
    });

    it('handles spaces around values', () => {
      const result = parseCustomArrayInput('5, 2, 8, 1');
      expect(result.error).toBeNull();
      expect(result.values).toEqual([5, 2, 8, 1]);
    });

    it('allows negative numbers', () => {
      const result = parseCustomArrayInput('-5,2,-8,1');
      expect(result.error).toBeNull();
      expect(result.values).toEqual([-5, 2, -8, 1]);
    });

    it('allows exactly 2 values (minimum)', () => {
      const result = parseCustomArrayInput('5,3');
      expect(result.error).toBeNull();
      expect(result.values).toEqual([5, 3]);
    });

    it('allows exactly 30 values (maximum)', () => {
      const input = Array.from({ length: 30 }, (_, i) => i).join(',');
      const result = parseCustomArrayInput(input);
      expect(result.error).toBeNull();
      expect(result.values).toHaveLength(30);
    });

    it('allows duplicate values', () => {
      const result = parseCustomArrayInput('5,5,5,5');
      expect(result.error).toBeNull();
      expect(result.values).toEqual([5, 5, 5, 5]);
    });

    it('allows boundary value 999', () => {
      const result = parseCustomArrayInput('5,999');
      expect(result.error).toBeNull();
      expect(result.values).toEqual([5, 999]);
    });

    it('allows boundary value -999', () => {
      const result = parseCustomArrayInput('5,-999');
      expect(result.error).toBeNull();
      expect(result.values).toEqual([5, -999]);
    });
  });

  describe('invalid inputs', () => {
    it('rejects empty string', () => {
      expect(parseCustomArrayInput('').error).not.toBeNull();
    });

    it('rejects whitespace-only string', () => {
      expect(parseCustomArrayInput('   ').error).not.toBeNull();
    });

    it('rejects non-numeric token', () => {
      expect(parseCustomArrayInput('5,abc,8').error).not.toBeNull();
    });

    it('rejects decimal numbers', () => {
      expect(parseCustomArrayInput('5,2.5,8').error).not.toBeNull();
    });

    it('rejects double commas (empty token)', () => {
      expect(parseCustomArrayInput('5,,8').error).not.toBeNull();
    });

    it('rejects trailing comma', () => {
      expect(parseCustomArrayInput('5,2,8,').error).not.toBeNull();
    });

    it('rejects leading comma', () => {
      expect(parseCustomArrayInput(',5,2,8').error).not.toBeNull();
    });

    it('rejects single value (below minimum length)', () => {
      expect(parseCustomArrayInput('5').error).not.toBeNull();
    });

    it('rejects 31 values (above maximum length)', () => {
      const input = Array.from({ length: 31 }, (_, i) => i).join(',');
      expect(parseCustomArrayInput(input).error).not.toBeNull();
    });

    it('rejects values above 999', () => {
      expect(parseCustomArrayInput('5,1000').error).not.toBeNull();
    });

    it('rejects values below -999', () => {
      expect(parseCustomArrayInput('5,-1000').error).not.toBeNull();
    });

    it('rejects scientific notation', () => {
      expect(parseCustomArrayInput('5,1e10,8').error).not.toBeNull();
    });

    it('rejects values with a plus sign', () => {
      expect(parseCustomArrayInput('5,+8,2').error).not.toBeNull();
    });
  });

  describe('error messages', () => {
    it('includes the invalid token in the error message', () => {
      const result = parseCustomArrayInput('5,notanumber,8');
      expect(result.error).toContain('notanumber');
    });

    it('mentions the actual count when too many values provided', () => {
      const input = Array.from({ length: 35 }, (_, i) => i).join(',');
      const result = parseCustomArrayInput(input);
      expect(result.error).toContain('35');
    });
  });
});
