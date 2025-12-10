import Api from "../api";

export const getSummary = async () => {
  return Api().get(`/summary`)
}