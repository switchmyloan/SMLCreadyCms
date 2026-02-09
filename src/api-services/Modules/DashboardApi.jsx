import Api from "../api";

export const getSummary = async ({ fromDate, toDate } = {}) => {
  return Api().get(`/summary`, {
    params: {
      fromDate,
      toDate
    }
  })
};

export const getKycStageStatistics = async (fromDate, toDate) => {
   return Api().get(`/summary/admin/mf-kyc-statstics`, {
    params: {
      fromDate,
      toDate,
    },
    skipAdminAppend : true
  })
};

export const getLenderWiseLeads = async () => {
  return Api().get(`/summary/admin/lender-wise-leads`, {
    skipAdminAppend: true
  })
};

export const getComprehensiveAnalytics = async () => {
  return Api().get(`/summary/admin/comprehensive-analytics`, {
    skipAdminAppend: true
  })
};

// Lender Response Stats APIs
export const getRejectionReasonsStats = async () => {
  return Api().get(`/lender/admin/response/rejection-reasons`, {
    skipAdminAppend: true
  })
};

export const getRejectionReasonsByLender = async (lenderId) => {
  const params = lenderId ? `?lenderId=${lenderId}` : '';
  return Api().get(`/lender/admin/response/rejection-reasons-by-lender${params}`, {
    skipAdminAppend: true
  })
};

export const getLenderResponseStats = async () => {
  return Api().get(`/lender/admin/response/stats`, {
    skipAdminAppend: true
  })
};