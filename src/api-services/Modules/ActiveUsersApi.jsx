import Api from "../api";

// Get active users with pagination and filters
export const getActiveUsers = async (page = 1, limit = 20, filters = {}) => {
  const params = new URLSearchParams();

  params.append('page', page);
  params.append('limit', limit);

  // Add filters
  if (filters.search) params.append('search', filters.search);
  if (filters.lenderId) params.append('lenderId', filters.lenderId);
  if (filters.minAge) params.append('minAge', filters.minAge);
  if (filters.maxAge) params.append('maxAge', filters.maxAge);
  if (filters.minIncome) params.append('minIncome', filters.minIncome);
  if (filters.maxIncome) params.append('maxIncome', filters.maxIncome);
  if (filters.minLoanAmount) params.append('minLoanAmount', filters.minLoanAmount);
  if (filters.maxLoanAmount) params.append('maxLoanAmount', filters.maxLoanAmount);
  if (filters.gender) params.append('gender', filters.gender);
  if (filters.employmentType) params.append('employmentType', filters.employmentType);
  if (filters.isOnline !== undefined) params.append('isOnline', filters.isOnline);
  if (filters.mobileOnly !== undefined) params.append('mobileOnly', filters.mobileOnly);

  const queryString = params.toString();

  return Api().get(`/active-users?${queryString}`, {
    skipAdminAppend: true,
  });
};

// Get activity statistics
export const getActivityStats = async (mobileOnly = false) => {
  const params = mobileOnly ? '?mobileOnly=true' : '';
  return Api().get(`/active-users/stats${params}`, {
    skipAdminAppend: true,
  });
};

// Track user activity (for CMS tracking) - Single event
export const trackActivity = async (payload) => {
  return Api().post(`/active-users/activity/track`, payload, {
    skipAdminAppend: true,
  });
};

// ============================================================================
// INSTAGRAM-LEVEL BATCH TRACKING - Optimized for high-scale
// ============================================================================

/**
 * Batch track activities - Standard format
 * Accepts multiple activities in a single request
 * @param {Object} payload - { sessionId, deviceType, deviceModel, platform, appVersion, activities[] }
 */
export const trackActivityBatch = async (payload) => {
  return Api().post(`/active-users/activity/batch`, payload, {
    skipAdminAppend: true,
  });
};

/**
 * Batch track activities - V2 Compact format (Instagram-level)
 * Ultra-compact payload for minimal bandwidth usage
 * @param {Object} payload - Compact format { sid, dt, dm, pl, v, ev[] }
 */
export const trackActivityBatchV2 = async (payload) => {
  return Api().post(`/active-users/activity/batch-v2`, payload, {
    skipAdminAppend: true,
  });
};

// Check if specific user is online
export const checkUserOnline = async (principalId) => {
  return Api().get(`/active-users/${principalId}/online`, {
    skipAdminAppend: true,
  });
};

// Get lenders list for filter dropdown
export const getLendersForFilter = async () => {
  return Api().get(`/lender`, {
    skipAdminAppend: true,
  });
};

// Get detailed user information
export const getUserDetail = async (principalId) => {
  return Api().get(`/active-users/${principalId}/detail`, {
    skipAdminAppend: true,
  });
};

// Get live users with their current pages
export const getLiveUsers = async (mobileOnly = false) => {
  const params = mobileOnly ? '?mobileOnly=true' : '';
  return Api().get(`/active-users/live${params}`, {
    skipAdminAppend: true,
  });
};

// Get user journey for a specific user
export const getUserJourney = async (principalId) => {
  return Api().get(`/active-users/${principalId}/journey`, {
    skipAdminAppend: true,
  });
};

// Get funnel analytics
// pages: array of page paths in order (e.g., ['login', 'register', 'profile', 'dashboard'])
export const getFunnelAnalytics = async (funnelName, pages, mobileOnly = false) => {
  const pagesParam = pages.join(',');
  const mobileParam = mobileOnly ? '&mobileOnly=true' : '';
  return Api().get(`/active-users/funnel?name=${encodeURIComponent(funnelName)}&pages=${encodeURIComponent(pagesParam)}${mobileParam}`, {
    skipAdminAppend: true,
  });
};

// Get user-level funnel analytics with individual user progress
// pages: array of page paths in order (e.g., ['login', 'register', 'profile', 'dashboard'])
export const getUserFunnelAnalytics = async (funnelName, pages, mobileOnly = false) => {
  const pagesParam = pages.join(',');
  const mobileParam = mobileOnly ? '&mobileOnly=true' : '';
  return Api().get(`/active-users/funnel/users?name=${encodeURIComponent(funnelName)}&pages=${encodeURIComponent(pagesParam)}${mobileParam}`, {
    skipAdminAppend: true,
  });
};
