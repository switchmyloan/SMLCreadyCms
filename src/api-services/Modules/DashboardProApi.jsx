import Api from "../api";

export const getExecutiveDashboard = async (period = 'this_month') => {
  return Api().get(`/dashboard-pro/executive`, {
    params: { period },
    skipAdminAppend: true,
  });
};

export const getLenderPerformancePro = async (period = 'this_month', lenderId = null) => {
  return Api().get(`/dashboard-pro/lender-performance`, {
    params: { period, lenderId },
    skipAdminAppend: true,
  });
};

export const getAppStatisticsPro = async (period = 'this_month', platform = 'all') => {
  return Api().get(`/dashboard-pro/app-statistics`, {
    params: { period, platform },
    skipAdminAppend: true,
  });
};

export const getMutualFundsDashboard = async (period = 'this_month') => {
  return Api().get(`/dashboard-pro/mutual-funds`, {
    params: { period },
    skipAdminAppend: true,
  });
};

export const getInternalMFDashboard = async (period = 'this_month') => {
  return Api().get(`/dashboard-pro/internal-mf`, {
    params: { period },
    skipAdminAppend: true,
  });
};
