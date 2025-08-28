import DOMPurify from 'dompurify';

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'a'];
const ALLOWED_ATTRIBUTES = {
  'a': ['href', 'target', 'rel']
};

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: Object.values(ALLOWED_ATTRIBUTES).flat(),
    ADD_ATTR: ['target'],
    ALLOW_DATA_ATTR: false
  });
}

export function sanitizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}