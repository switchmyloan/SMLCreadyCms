import { trackActivity } from '@api/Modules/ActiveUsersApi';

const LAST_HEARTBEAT_KEY = 'cms_lastHeartbeatDate';
const SESSION_ID_KEY = 'cms_sessionId';

/**
 * Get today's date as YYYY-MM-DD string
 */
const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Generate a unique session ID
 */
const generateSessionId = () => {
  return `cms_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Get or create session ID
 */
const getSessionId = () => {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

/**
 * Get user ID from localStorage
 */
const getUserId = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('USER_DATA'));
    return userData?.id || null;
  } catch {
    return null;
  }
};

/**
 * Base function to track any activity
 */
const track = async (activityData) => {
  const userId = getUserId();
  if (!userId) return;

  try {
    const payload = {
      principalId: userId,
      sessionId: getSessionId(),
      deviceType: 'desktop',
      ...activityData,
      metadata: {
        source: 'CMS',
        userAgent: navigator.userAgent,
        ...activityData.metadata,
      },
    };

    await trackActivity(payload);
  } catch (error) {
    // Silent fail - tracking should never break the app
    console.warn('Activity tracking failed:', error.message);
  }
};

/**
 * Send daily heartbeat - only sends once per calendar day
 */
export const sendDailyHeartbeat = async () => {
  const userId = getUserId();
  if (!userId) return false;

  try {
    const today = getTodayDateString();
    const lastHeartbeat = localStorage.getItem(LAST_HEARTBEAT_KEY);

    if (lastHeartbeat === today) {
      console.log('[Tracking] Heartbeat already sent today, skipping');
      return false;
    }

    await track({
      activityType: 'SESSION_HEARTBEAT',
      metadata: {
        date: today,
      },
    });

    localStorage.setItem(LAST_HEARTBEAT_KEY, today);
    console.log('[Tracking] Daily heartbeat sent successfully');
    return true;
  } catch (error) {
    console.warn('[Tracking] Failed to send heartbeat:', error.message);
    return false;
  }
};

/**
 * Track page view
 */
export const trackPageView = async (pagePath) => {
  await track({
    activityType: 'PAGE_VIEW',
    pagePath,
  });
};

/**
 * Track user action
 */
export const trackAction = async (actionName, pagePath = window.location.pathname) => {
  await track({
    activityType: 'ACTION',
    actionName,
    pagePath,
  });
};

/**
 * Track login event
 */
export const trackLogin = async () => {
  // Clear previous heartbeat date to ensure heartbeat is sent on login
  localStorage.removeItem(LAST_HEARTBEAT_KEY);

  await track({
    activityType: 'LOGIN',
  });

  // Also send heartbeat after login
  await sendDailyHeartbeat();
};

/**
 * Track logout event
 */
export const trackLogout = async () => {
  await track({
    activityType: 'LOGOUT',
  });

  // Clear heartbeat date on logout
  localStorage.removeItem(LAST_HEARTBEAT_KEY);
  sessionStorage.removeItem(SESSION_ID_KEY);
};

/**
 * Clear tracking data (call on logout)
 */
export const clearTrackingData = () => {
  localStorage.removeItem(LAST_HEARTBEAT_KEY);
  sessionStorage.removeItem(SESSION_ID_KEY);
};

export default {
  sendDailyHeartbeat,
  trackPageView,
  trackAction,
  trackLogin,
  trackLogout,
  clearTrackingData,
};
