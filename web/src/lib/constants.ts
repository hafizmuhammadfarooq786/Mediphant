// Medical interaction rules - centralized constants
export const MEDICAL_DISCLAIMER = "This is for informational purposes only and does not constitute medical advice. Always consult with a healthcare professional for medical guidance.";

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 60000, // 1 minute
  MAX_REQUESTS: 100, // per window
} as const;

// Query history configuration
export const QUERY_HISTORY_CONFIG = {
  MAX_ITEMS: 10,
  RETENTION_DAYS: 30,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  INTERACTIONS: '/api/interactions',
  FAQ: '/api/faq',
  HISTORY: '/api/history',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
  VALIDATION_FAILED: 'Validation failed',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  METHOD_NOT_ALLOWED: 'Method not allowed',
  REQUIRED_FIELD: 'This field is required',
  DUPLICATE_MEDICATIONS: 'Please provide two different medications',
  INVALID_MEDICATION_NAME: 'Invalid characters in medication name',
  MEDICATION_NAME_TOO_LONG: 'Medication name too long',
  QUERY_REQUIRED: 'Query parameter "q" is required',
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  MEDICATION_NAME: /^[a-zA-Z0-9\s\-\.]+$/,
  MAX_MEDICATION_LENGTH: 100,
  MIN_MEDICATION_LENGTH: 1,
} as const;