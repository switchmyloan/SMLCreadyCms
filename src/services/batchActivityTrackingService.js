/**
 * Instagram-Level Batch Activity Tracking Service for CMS
 *
 * Features:
 * - Event buffering with automatic flush
 * - Local aggregation (combines repeated events)
 * - Circuit breaker pattern (stops requests after failures)
 * - Priority queues (critical vs standard events)
 * - Compact payload format for minimal bandwidth
 * - Silent failure handling
 */

import { trackActivityBatchV2 } from '@api/Modules/ActiveUsersApi';

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
  // Flush interval (5 minutes for CMS - less aggressive than mobile)
  FLUSH_INTERVAL_MS: 5 * 60 * 1000,

  // Maximum buffer size before forced flush
  MAX_BUFFER_SIZE: 50,

  // Circuit breaker settings
  CIRCUIT_BREAKER_THRESHOLD: 3,
  CIRCUIT_BREAKER_RESET_MS: 5 * 60 * 1000,

  // Aggregation window for repeated events (30 seconds)
  AGGREGATION_WINDOW_MS: 30 * 1000,

  // Retry settings
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 1000,
};

// Event type short codes for compact payload
const EVENT_CODES = {
  PAGE_VIEW: 'PV',
  SESSION_HEARTBEAT: 'HB',
  ACTION: 'AC',
  LOGIN: 'LI',
  LOGOUT: 'LO',
  API_CALL: 'AP',
};

// Critical events that bypass batching
const CRITICAL_EVENTS = ['LOGIN', 'LOGOUT'];

// ============================================================================
// STATE
// ============================================================================
let eventBuffer = [];
let aggregationMap = new Map(); // For combining repeated events
let flushTimer = null;
let circuitBreakerFailures = 0;
let circuitBreakerOpenUntil = 0;
let isInitialized = false;

// ============================================================================
// STORAGE KEYS
// ============================================================================
const SESSION_ID_KEY = 'cms_batch_sessionId';
const PENDING_EVENTS_KEY = 'cms_pendingEvents';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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
 * Check if circuit breaker is open
 */
const isCircuitBreakerOpen = () => {
  if (Date.now() < circuitBreakerOpenUntil) {
    return true;
  }
  // Reset if timeout passed
  if (circuitBreakerOpenUntil > 0) {
    circuitBreakerFailures = 0;
    circuitBreakerOpenUntil = 0;
  }
  return false;
};

/**
 * Record a failure for circuit breaker
 */
const recordFailure = () => {
  circuitBreakerFailures++;
  if (circuitBreakerFailures >= CONFIG.CIRCUIT_BREAKER_THRESHOLD) {
    circuitBreakerOpenUntil = Date.now() + CONFIG.CIRCUIT_BREAKER_RESET_MS;
    console.warn('[BatchTracking] Circuit breaker opened due to failures');
  }
};

/**
 * Record a success for circuit breaker
 */
const recordSuccess = () => {
  circuitBreakerFailures = 0;
  circuitBreakerOpenUntil = 0;
};

/**
 * Create aggregation key for deduplication
 */
const createAggregationKey = (event) => {
  return `${event.principalId}_${event.activityType}_${event.pagePath || ''}_${event.actionName || ''}`;
};

/**
 * Save pending events to localStorage (for persistence across page reloads)
 */
const savePendingEvents = () => {
  try {
    if (eventBuffer.length > 0) {
      localStorage.setItem(PENDING_EVENTS_KEY, JSON.stringify(eventBuffer));
    } else {
      localStorage.removeItem(PENDING_EVENTS_KEY);
    }
  } catch {
    // Silent fail
  }
};

/**
 * Load pending events from localStorage
 */
const loadPendingEvents = () => {
  try {
    const pending = localStorage.getItem(PENDING_EVENTS_KEY);
    if (pending) {
      const events = JSON.parse(pending);
      eventBuffer = [...events, ...eventBuffer];
      localStorage.removeItem(PENDING_EVENTS_KEY);
    }
  } catch {
    // Silent fail
  }
};

// ============================================================================
// CORE TRACKING FUNCTIONS
// ============================================================================

/**
 * Add event to buffer with aggregation
 */
const addToBuffer = (event) => {
  const userId = getUserId();
  if (!userId) return;

  const eventWithUser = {
    ...event,
    principalId: userId,
    timestamp: Date.now(),
  };

  // Check for aggregation (combine repeated events)
  const aggKey = createAggregationKey(eventWithUser);
  const existing = aggregationMap.get(aggKey);

  if (existing && (Date.now() - existing.timestamp) < CONFIG.AGGREGATION_WINDOW_MS) {
    // Increment count for existing event
    existing.count = (existing.count || 1) + 1;
    existing.timestamp = Date.now();
  } else {
    // Add new event to buffer
    eventWithUser.count = 1;
    eventBuffer.push(eventWithUser);
    aggregationMap.set(aggKey, eventWithUser);
  }

  // Check if we need to flush
  if (eventBuffer.length >= CONFIG.MAX_BUFFER_SIZE) {
    flush();
  }
};

/**
 * Convert events to compact format for V2 API
 * Adds 'cms_' prefix to page paths to distinguish from mobile app
 */
const toCompactFormat = (events) => {
  return {
    sid: getSessionId(),
    dt: 'desktop',  // Always 'desktop' for CMS - this enables mobileOnly filtering
    dm: navigator.platform || 'Unknown',
    pl: 'web',
    v: '1.0.0',
    ev: events.map(e => ({
      p: e.principalId,
      t: EVENT_CODES[e.activityType] || e.activityType,
      pg: e.pagePath ? `cms_${e.pagePath.replace(/^\//, '')}` : undefined, // Prefix with 'cms_'
      a: e.actionName,
      ts: e.timestamp,
      c: e.count > 1 ? e.count : undefined,
      m: { ...e.metadata, source: 'cms_admin' }, // Add source identifier
    })),
  };
};

/**
 * Flush buffer to server
 */
const flush = async () => {
  if (eventBuffer.length === 0) return;
  if (isCircuitBreakerOpen()) {
    console.warn('[BatchTracking] Circuit breaker open, skipping flush');
    savePendingEvents();
    return;
  }

  const eventsToSend = [...eventBuffer];
  eventBuffer = [];
  aggregationMap.clear();

  try {
    const compactPayload = toCompactFormat(eventsToSend);
    await trackActivityBatchV2(compactPayload);
    recordSuccess();
    localStorage.removeItem(PENDING_EVENTS_KEY);
    console.log(`[BatchTracking] Flushed ${eventsToSend.length} events`);
  } catch (error) {
    console.warn('[BatchTracking] Flush failed:', error.message);
    recordFailure();
    // Put events back in buffer for retry
    eventBuffer = [...eventsToSend, ...eventBuffer];
    savePendingEvents();
  }
};

/**
 * Initialize the batch tracking service
 */
export const initialize = () => {
  if (isInitialized) return;

  // Load any pending events from previous session
  loadPendingEvents();

  // Set up periodic flush
  flushTimer = setInterval(flush, CONFIG.FLUSH_INTERVAL_MS);

  // Flush on page unload
  window.addEventListener('beforeunload', () => {
    flush();
  });

  // Flush on visibility change (user switches tabs)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flush();
    }
  });

  isInitialized = true;
  console.log('[BatchTracking] Service initialized');
};

/**
 * Shutdown the service
 */
export const shutdown = () => {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  flush();
  isInitialized = false;
};

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Track page view
 */
export const trackPageView = (pagePath) => {
  addToBuffer({
    activityType: 'PAGE_VIEW',
    pagePath,
  });
};

/**
 * Track user action
 */
export const trackAction = (actionName, pagePath = window.location.pathname) => {
  addToBuffer({
    activityType: 'ACTION',
    actionName,
    pagePath,
  });
};

/**
 * Track heartbeat
 */
export const trackHeartbeat = () => {
  addToBuffer({
    activityType: 'SESSION_HEARTBEAT',
  });
};

/**
 * Track login - Critical event, flushes immediately
 */
export const trackLogin = async () => {
  const userId = getUserId();
  if (!userId) return;

  // Add to buffer and flush immediately
  addToBuffer({
    activityType: 'LOGIN',
  });
  await flush();
};

/**
 * Track logout - Critical event, flushes immediately
 */
export const trackLogout = async () => {
  const userId = getUserId();
  if (!userId) return;

  addToBuffer({
    activityType: 'LOGOUT',
  });
  await flush();

  // Clear session
  sessionStorage.removeItem(SESSION_ID_KEY);
  localStorage.removeItem(PENDING_EVENTS_KEY);
};

/**
 * Force flush (useful for testing or manual flush)
 */
export const forceFlush = flush;

/**
 * Get current buffer size (for debugging)
 */
export const getBufferSize = () => eventBuffer.length;

/**
 * Check if service is healthy
 */
export const isHealthy = () => !isCircuitBreakerOpen();

export default {
  initialize,
  shutdown,
  trackPageView,
  trackAction,
  trackHeartbeat,
  trackLogin,
  trackLogout,
  forceFlush,
  getBufferSize,
  isHealthy,
};
