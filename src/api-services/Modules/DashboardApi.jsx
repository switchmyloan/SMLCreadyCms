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