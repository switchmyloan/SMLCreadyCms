// CMS activity tracking is intentionally disabled.
// Reason: the Active Users dashboard tracks app + web users only; CMS admin
// browsing is not a marketing signal and was polluting top-pages, totals, and
// online counts. Public API kept as no-ops so all existing call sites
// (Navbar logout, useActivityTracking hook, LoginPage, etc.) keep working
// without code changes.

const noop = async () => {};

export const sendDailyHeartbeat = async () => false;
export const trackPageView = noop;
export const trackAction = noop;
export const trackLogin = noop;
export const trackLogout = noop;
export const clearTrackingData = () => {};

export default {
  sendDailyHeartbeat,
  trackPageView,
  trackAction,
  trackLogin,
  trackLogout,
  clearTrackingData,
};
