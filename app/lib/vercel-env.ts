/**
 * Vercel Environment Variables Configuration
 *
 * This module provides utilities for managing Vercel-specific environment variables
 * and features that are available during deployment.
 */

/**
 * Vercel Environment
 * Defines the current deployment environment
 */
export type VercelEnvironment = 'production' | 'preview' | 'development';

/**
 * Get the current Vercel environment
 */
export function getVercelEnvironment(): VercelEnvironment {
  if (typeof process !== 'undefined' && process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV as VercelEnvironment;
  }

  return 'development';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getVercelEnvironment() === 'production';
}

/**
 * Check if running in preview deployment
 */
export function isPreview(): boolean {
  return getVercelEnvironment() === 'preview';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getVercelEnvironment() === 'development';
}

/**
 * Get Vercel deployment metadata
 */
export function getVercelMetadata() {
  return {
    env: getVercelEnvironment(),
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
    projectId: process.env.VERCEL_PROJECT_ID,
    region: process.env.VERCEL_REGION,
    projectName: process.env.VERCEL_PROJECT_NAME,
    git: {
      branch: process.env.VERCEL_GIT_BRANCH,
      commit: process.env.VERCEL_GIT_COMMIT_SHA,
      repo: process.env.VERCEL_GIT_REPO_SLUG,
    },
  };
}

/**
 * Feature flags for Vercel features
 */
export const VERCEL_FEATURES = {
  // Enable Vercel Analytics
  ANALYTICS_ENABLED: process.env.VITE_VERCEL_ANALYTICS_ENABLED !== 'false',

  // Enable automatic redirects
  REDIRECTS_ENABLED: process.env.VITE_VERCEL_REDIRECTS_ENABLED !== 'false',

  // Enable Vercel Toolbar (dev/preview only)
  TOOLBAR_ENABLED: process.env.VITE_VERCEL_TOOLBAR_ENABLED === 'true',

  // Enable performance monitoring
  PERFORMANCE_MONITORING_ENABLED: process.env.VITE_VERCEL_PERFORMANCE_ENABLED !== 'false',
};

/**
 * Security headers that should be set by vercel.json
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

/**
 * Cache control headers for different content types
 */
export const CACHE_HEADERS = {
  // HTML files - revalidate frequently
  html: 'public, max-age=3600, must-revalidate',

  // Static assets - long cache duration
  assets: 'public, max-age=31536000, immutable',

  // API responses - vary cache based on route
  api: 'public, max-age=60, s-maxage=120, stale-while-revalidate=86400',

  // Default
  default: 'public, max-age=60, s-maxage=120',
};

/**
 * Get appropriate cache header for content type
 */
export function getCacheHeader(contentType: 'html' | 'assets' | 'api' | 'default' = 'default'): string {
  return CACHE_HEADERS[contentType];
}
