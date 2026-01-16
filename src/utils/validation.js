/**
 * Email validation regex
 * Validates standard email format: user@domain.tld
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validate user data
 * @param {Object} data - User data to validate
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
function validateUserData(data) {
  const errors = [];

  // Check if data exists
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid data format'] };
  }

  // Validate name
  if (!data.name) {
    errors.push('Name is required');
  } else if (typeof data.name !== 'string') {
    errors.push('Name must be a string');
  } else if (data.name.trim().length === 0) {
    errors.push('Name cannot be empty or whitespace only');
  } else if (data.name.length > 100) {
    errors.push('Name must be 100 characters or less');
  }

  // Validate email
  if (!data.email) {
    errors.push('Email is required');
  } else if (typeof data.email !== 'string') {
    errors.push('Email must be a string');
  } else if (!validateEmail(data.email)) {
    errors.push('Email format is invalid');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateUserData,
  validateEmail
};
