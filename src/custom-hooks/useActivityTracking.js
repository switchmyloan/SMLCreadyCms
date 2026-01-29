import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import batchTrackingService from '../services/batchActivityTrackingService';

/**
 * Custom hook for activity tracking using Instagram-level batch service
 * - Initializes batch tracking service on mount
 * - Sends heartbeat periodically (via batch)
 * - Tracks page views on route changes (batched)
 * - Auto-flushes on tab visibility change
 */
export function useActivityTracking() {
  const location = useLocation();
  const isInitialized = useRef(false);
  const heartbeatInterval = useRef(null);

  // Initialize batch tracking service
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      batchTrackingService.initialize();

      // Send initial heartbeat
      batchTrackingService.trackHeartbeat();

      // Set up periodic heartbeat (every 5 minutes)
      heartbeatInterval.current = setInterval(() => {
        batchTrackingService.trackHeartbeat();
      }, 5 * 60 * 1000);
    }

    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    };
  }, []);

  // Track page views on route changes
  useEffect(() => {
    const pagePath = location.pathname;
    batchTrackingService.trackPageView(pagePath);
  }, [location.pathname]);
}

/**
 * Track a custom action
 * @param {string} actionName - Name of the action
 * @param {string} pagePath - Optional page path (defaults to current path)
 */
export function trackAction(actionName, pagePath) {
  batchTrackingService.trackAction(actionName, pagePath);
}

/**
 * Track login event (flushes immediately)
 */
export async function trackLogin() {
  await batchTrackingService.trackLogin();
}

/**
 * Track logout event (flushes immediately)
 */
export async function trackLogout() {
  await batchTrackingService.trackLogout();
}

/**
 * Force flush all pending events
 */
export function flushEvents() {
  batchTrackingService.forceFlush();
}

/**
 * Check if tracking service is healthy
 */
export function isTrackingHealthy() {
  return batchTrackingService.isHealthy();
}

export default useActivityTracking;
