import Api from "../api";

// ==================== META ENDPOINTS ====================

export const getEngagementOptions = async () => {
  return Api().get("/marketing/engagements/options", {
    skipAdminAppend: true,
  });
};

// ==================== DASHBOARD & ANALYTICS ====================

export const getEngagementDashboard = async () => {
  return Api().get("/marketing/engagements/dashboard", {
    skipAdminAppend: true,
  });
};

export const getEngagementStats = async () => {
  return Api().get("/marketing/engagements/stats", {
    skipAdminAppend: true,
  });
};

export const getFunnelMetrics = async () => {
  return Api().get("/marketing/engagements/funnel", {
    skipAdminAppend: true,
  });
};

export const getEngagementDistribution = async () => {
  return Api().get("/marketing/engagements/distribution", {
    skipAdminAppend: true,
  });
};

// ==================== USER LISTS ====================

export const getEngagements = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.funnelStage) params.append('funnelStage', filters.funnelStage);
  if (filters.churnRisk) params.append('churnRisk', filters.churnRisk);
  if (filters.minScore) params.append('minScore', filters.minScore);
  if (filters.maxScore) params.append('maxScore', filters.maxScore);
  if (filters.minInactive) params.append('minInactive', filters.minInactive);
  if (filters.maxInactive) params.append('maxInactive', filters.maxInactive);

  const queryString = params.toString();
  return Api().get(`/marketing/engagements${queryString ? `?${queryString}` : ''}`, {
    skipAdminAppend: true,
  });
};

export const getTopEngagedUsers = async (limit = 10) => {
  return Api().get(`/marketing/engagements/top-engaged?limit=${limit}`, {
    skipAdminAppend: true,
  });
};

export const getHighRiskUsers = async (limit = 100) => {
  return Api().get(`/marketing/engagements/high-risk?limit=${limit}`, {
    skipAdminAppend: true,
  });
};

export const getRecentlyActiveUsers = async (hours = 24) => {
  return Api().get(`/marketing/engagements/recently-active?hours=${hours}`, {
    skipAdminAppend: true,
  });
};

// ==================== INDIVIDUAL USER ====================

export const getEngagementByPrincipal = async (principalId) => {
  return Api().get(`/marketing/engagements/principal/${principalId}`, {
    skipAdminAppend: true,
  });
};

export const updateFunnelStage = async (principalId, stage) => {
  return Api().put(`/marketing/engagements/principal/${principalId}/funnel`, { stage }, {
    skipAdminAppend: true,
  });
};

// ==================== ADMIN OPERATIONS ====================

export const recalculateScores = async () => {
  return Api().post("/marketing/engagements/recalculate-scores", {}, {
    skipAdminAppend: true,
  });
};

export const updateChurnRisk = async () => {
  return Api().post("/marketing/engagements/update-churn-risk", {}, {
    skipAdminAppend: true,
  });
};
