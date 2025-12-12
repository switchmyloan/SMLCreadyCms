import Api from "../api";


export const getContact = async (pageNo, limit, globalFilter) => {
    return Api().get(`/contact?currentPage=${pageNo}&perPage=${limit}&search=${globalFilter}`,
        {
            skipAdminAppend: false,
        }
    )
};