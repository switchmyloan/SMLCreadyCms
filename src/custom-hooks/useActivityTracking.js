import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  sendDailyHeartbeat,
  trackPageView,
} from '../services/activityTrackingService';

/**
 * Custom hook for activity tracking
 * - Sends daily heartbeat on mount and when tab becomes visible
 * - Tracks page views on route changes
 */
export function useActivityTracking() {
  const location = useLocation();
  const isInitialized = useRef(false);

  // Send daily heartbeat on mount and when tab becomes visible
  useEffect(() => {
    // Send heartbeat on initial load
    if (!isInitialized.current) {
      isInitialized.current = true;
      sendDailyHeartbeat();
    }

    // Handle visibility change (tab focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendDailyHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Track page views on route changes
  useEffect(() => {
    const pagePath = location.pathname;
    trackPageView(pagePath);
  }, [location.pathname]);
}

export default useActivityTracking;
