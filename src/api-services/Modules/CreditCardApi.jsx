import Api from "../api";

export const getCreditCards = async (pageNo, limit, globalFilter) => {
  return Api().get(
    `/credit-card-master?currentPage=${pageNo}&perPage=${limit}&search=${globalFilter}`
  );
};

export const AddCreditCard = async (formData) => {
  return Api().post("/credit-card-master", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getCreditCardById = async (id) =>
  Api().get(`/credit-card-master/${id}`);

export const UpdateCreditCard = async (id, formData) => {
  return Api().patch(`/credit-card-master/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteCreditCard = async (id) =>
  Api().delete(`/credit-card-master/${id}`);
