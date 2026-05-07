// CMS batch activity tracking is intentionally disabled.
// Reason: the Active Users dashboard tracks app + web users only; CMS admin
// browsing is not a marketing signal and was polluting top-pages, totals, and
// online counts. Public API kept as no-ops so all existing call sites keep
// working without code changes.

const noop = () => {};
const noopAsync = async () => {};

export const initialize = noop;
export const shutdown = noop;
export const trackPageView = noop;
export const trackAction = noop;
export const trackHeartbeat = noop;
export const trackLogin = noopAsync;
export const trackLogout = noopAsync;
export const forceFlush = noopAsync;
export const getBufferSize = () => 0;
export const isHealthy = () => true;

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
