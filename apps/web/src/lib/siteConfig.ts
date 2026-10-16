/**
 * Centralized, domain-independent site configuration for Typing Typhon.
 * 
 * Strict architectural rule: The launch domain is UNDECIDED.
 * No hard-coded production domains are permitted in application code.
 * All canonical URLs, sitemaps, robots directives, and metadata base URLs
 * resolve through this single configuration module.
 */

export const SITE_NAME = 'Typing Typhon';
export const DEFAULT_TITLE = 'Typing Typhon — Online Typing Speed Test & Touch Typing Lessons';
export const DEFAULT_DESCRIPTION =
  'Test your typing speed and master touch typing with Typing Typhon. Free instant WPM test, structured 6-stage curriculum, per-key accuracy diagnostics, and zero mandatory registration.';

/**
 * Returns the resolved public-facing base URL of the site.
 * 
 * Precedence:
 * 1. NEXT_PUBLIC_SITE_URL (Explicitly set in environment)
 * 2. SITE_URL (Server-side environment variable)
 * 3. VERCEL_URL (Automated deployment preview hostname)
 * 4. Local development fallback (http://localhost:3000)
 */
export function getSiteBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;

  if (configured) {
    try {
      const parsed = new URL(configured);
      // Strip trailing slashes for canonical consistency
      return parsed.origin;
    } catch {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          `[SiteConfig] Fatal: Configured NEXT_PUBLIC_SITE_URL "${configured}" is not a valid absolute URL.`
        );
      }
      console.warn(
        `[SiteConfig] Warning: Configured NEXT_PUBLIC_SITE_URL "${configured}" is invalid. Falling back to localhost:3000 in dev.`
      );
    }
  }

  // Automated hosting preview detection (e.g. Vercel preview deployments)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Development and local testing default
  return 'http://localhost:3000';
}

/**
 * Determines whether search engine indexing should be blocked.
 * 
 * Returns true for:
 * - Preview / staging environments (VERCEL_ENV === 'preview')
 * - Explicit opt-out flag (NEXT_PUBLIC_BLOCK_SEARCH_INDEXING === 'true')
 * - Non-production local development
 */
export function isIndexingRestricted(): boolean {
  if (process.env.NEXT_PUBLIC_BLOCK_SEARCH_INDEXING === 'true') {
    return true;
  }
  if (process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development') {
    return true;
  }
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  return false;
}
