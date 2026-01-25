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

  const queryString = params.toString();

  return Api().get(`/active-users?${queryString}`, {
    skipAdminAppend: true,
  });
};

// Get activity statistics
export const getActivityStats = async () => {
  return Api().get(`/active-users/stats`, {
    skipAdminAppend: true,
  });
};

// Track user activity (for CMS tracking)
export const trackActivity = async (payload) => {
  return Api().post(`/active-users/activity/track`, payload, {
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
