import Api from "../api";

export const getCreditCardClicks = async (pageNo, limit) => {
  return Api().get(
    `/credit-card?currentPage=${pageNo}&perPage=${limit}`
  );
};

export const getAllCreditCardClicks = async () => {
  return Api().get(`/credit-card?currentPage=1&perPage=1000`);
};

export const getAllCreditCardsMaster = async () => {
  return Api().get(`/credit-card-master?currentPage=1&perPage=100&search=`);
};
