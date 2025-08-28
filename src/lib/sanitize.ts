import DOMPurify from 'dompurify';

// Configure DOMPurify for safe HTML sanitization
const createDOMPurify = () => {
  if (typeof window !== 'undefined') {
    return DOMPurify;
  }
  
  // Server-side fallback - basic text sanitization
  return {
    sanitize: (input: string) => {
      // Basic HTML entity encoding for server-side
      return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
  };
};

const purify = createDOMPurify();

export function sanitizeText(input: string): string {
  if (!input) return '';
  
  if (typeof window !== 'undefined') {
    // Client-side: use DOMPurify with configuration
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
    });
  } else {
    // Server-side: basic text sanitization
    return purify.sanitize(input);
  }
}

export function sanitizeRichText(input: string): string {
  if (!input) return '';
  
  if (typeof window !== 'undefined') {
    // Client-side: use DOMPurify with configuration
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
      ALLOWED_ATTR: []
    });
  } else {
    // Server-side: basic text sanitization
    return purify.sanitize(input);
  }
}

export function sanitizeUsername(input: string): string {
  if (!input) return '';
  
  // Username: only lowercase letters, numbers, and hyphens
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/--+/g, '-'); // Replace multiple hyphens with single
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 30) {
    return { valid: false, error: 'Username must be no more than 30 characters' };
  }
  
  if (!/^[a-z0-9-]{3,30}$/.test(username)) {
    return { valid: false, error: 'Username can only contain lowercase letters, numbers, and hyphens' };
  }
  
  if (username.startsWith('-') || username.endsWith('-')) {
    return { valid: false, error: 'Username cannot start or end with a hyphen' };
  }
  
  if (username.includes('--')) {
    return { valid: false, error: 'Username cannot contain consecutive hyphens' };
  }
  
  const reserved = [
    'app', 'auth', 'api', 'admin', 'cdn', 'img', 'static', 'www', 
    'support', 'status', 'mail', 'm', 'dev', 'test', 'stage'
  ];
  
  if (reserved.includes(username)) {
    return { valid: false, error: 'This username is reserved' };
  }
  
  return { valid: true };
}