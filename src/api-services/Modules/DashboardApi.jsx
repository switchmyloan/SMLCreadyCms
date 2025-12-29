import Api from "../api";

export const getSummary = async ({ fromDate, toDate } = {}) => {
  return Api().get(`/summary`, {
    params: {
      fromDate,
      toDate
    }
  })
}