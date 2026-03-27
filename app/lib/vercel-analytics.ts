/**
 * Vercel Analytics Integration
 * 
 * This module provides analytics tracking powered by Vercel's analytics service.
 * It automatically tracks:
 * - Page views
 * - Core Web Vitals (CLS, FID, LCP)
 * - Custom events
 */

import { Analytics } from '@vercel/analytics/react';

/**
 * Initialize Vercel Analytics
 * Should be called in the root layout
 */
export function initializeAnalytics() {
  // Analytics is automatically initialized when the component is rendered
  // See root.tsx for implementation
  return Analytics;
}

/**
 * Track custom events in Vercel Analytics
 * @param eventName Name of the event
 * @param properties Additional properties to track
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va.track(eventName, properties);
  }
}

/**
 * Track page view
 * @param path The page path
 * @param title Optional page title
 */
export function trackPageView(path: string, title?: string) {
  trackEvent('pageview', { path, title });
}

/**
 * Track user action (e.g., button click, form submission)
 * @param action The action name
 * @param details Additional action details
 */
export function trackUserAction(action: string, details?: Record<string, any>) {
  trackEvent(`user_action:${action}`, details);
}

/**
 * Track error event
 * @param error The error message or Error object
 * @param context Additional context about the error
 */
export function trackError(error: string | Error, context?: Record<string, any>) {
  const errorMessage = error instanceof Error ? error.message : error;
  trackEvent('error', {
    message: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });
}

/**
 * Track performance metric
 * @param metricName Name of the metric
 * @param value The metric value
 * @param unit Unit of measurement (optional)
 */
export function trackMetric(metricName: string, value: number, unit?: string) {
  trackEvent(`metric:${metricName}`, { value, unit });
}

/**
 * Track feature usage
 * @param featureName Name of the feature
 * @param metadata Additional metadata about the feature use
 */
export function trackFeatureUsage(featureName: string, metadata?: Record<string, any>) {
  trackEvent(`feature_usage:${featureName}`, metadata);
}

// Re-export for convenience
export type { AnalyticsProps } from '@vercel/analytics/react';
