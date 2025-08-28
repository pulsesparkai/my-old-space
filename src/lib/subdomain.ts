// Subdomain routing utility for client-side routing
// This handles the subdomain detection for React Router

const RESERVED_SUBDOMAINS = new Set([
  'app', 'auth', 'api', 'admin', 'cdn', 'img', 'static', 'www', 
  'support', 'status', 'mail', 'm', 'dev', 'test', 'stage'
]);

const MAIN_DOMAINS = new Set([
  'top8.io', 'www.top8.io', 'app.top8.io', 'auth.top8.io', 'api.top8.io'
]);

export function getSubdomainInfo() {
  const hostname = window.location.hostname;
  
  // Check if we're on a main domain
  if (MAIN_DOMAINS.has(hostname)) {
    return { isSubdomain: false, subdomain: null };
  }
  
  // Check if we're on a subdomain
  if (hostname.endsWith('.top8.io')) {
    const subdomain = hostname.slice(0, -'.top8.io'.length).toLowerCase();
    
    // Validate subdomain format
    if (/^[a-z0-9-]{3,30}$/.test(subdomain) && !RESERVED_SUBDOMAINS.has(subdomain)) {
      return { isSubdomain: true, subdomain };
    }
  }
  
  return { isSubdomain: false, subdomain: null };
}

// Check if current URL is a subdomain and should redirect to profile
export function shouldRedirectToProfile() {
  const { isSubdomain, subdomain } = getSubdomainInfo();
  
  if (isSubdomain && subdomain) {
    // Only redirect if we're on the root path of the subdomain
    return window.location.pathname === '/';
  }
  
  return false;
}

// Get the username from subdomain
export function getUsernameFromSubdomain(): string | null {
  const { isSubdomain, subdomain } = getSubdomainInfo();
  return isSubdomain ? subdomain : null;
}