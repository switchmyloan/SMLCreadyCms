import Api from "../api";

export const getCategory = async (pageNo, limit, globalFilter) => {
  return Api().get(`/category?currentPage=${pageNo}&perPage=${limit}&search=${globalFilter}`)
}