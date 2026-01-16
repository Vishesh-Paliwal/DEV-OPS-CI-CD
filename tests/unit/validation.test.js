const { validateUserData, validateEmail } = require('../../src/utils/validation');

/**
 * Unit tests for validation utilities
 * Validates: Requirements 1.7
 */
describe('Email Validation', () => {
  test('should accept valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user@domain.co.uk')).toBe(true);
    expect(validateEmail('name+tag@company.org')).toBe(true);
  });

  test('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('missing@domain')).toBe(false);
    expect(validateEmail('@nodomain.com')).toBe(false);
    expect(validateEmail('no@.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });

  test('should handle null and undefined', () => {
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
  });

  test('should trim whitespace before validation', () => {
    expect(validateEmail('  user@example.com  ')).toBe(true);
  });
});

describe('User Data Validation', () => {
  test('should accept valid user data', () => {
    const result = validateUserData({
      name: 'John Doe',
      email: 'john@example.com'
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject missing name', () => {
    const result = validateUserData({
      email: 'john@example.com'
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Name is required');
  });

  test('should reject missing email', () => {
    const result = validateUserData({
      name: 'John Doe'
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Email is required');
  });

  test('should reject empty name', () => {
    const result = validateUserData({
      name: '   ',
      email: 'john@example.com'
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Name cannot be empty or whitespace only');
  });

  test('should reject invalid email format', () => {
    const result = validateUserData({
      name: 'John Doe',
      email: 'invalid-email'
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Email format is invalid');
  });

  test('should reject name longer than 100 characters', () => {
    const longName = 'a'.repeat(101);
    const result = validateUserData({
      name: longName,
      email: 'john@example.com'
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Name must be 100 characters or less');
  });

  test('should reject null or undefined data', () => {
    expect(validateUserData(null).valid).toBe(false);
    expect(validateUserData(undefined).valid).toBe(false);
  });

  test('should return multiple errors for multiple issues', () => {
    const result = validateUserData({
      name: '',
      email: 'invalid'
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
