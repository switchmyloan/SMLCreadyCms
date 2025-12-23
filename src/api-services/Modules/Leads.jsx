import Api from "../api";


export const getLeads = async (pageNo, limit, globalFilter) => {
    return Api().get(`/leads/admin/in-web-leads?gender=male&currentPage=${pageNo}&perPage=${limit}&search=${globalFilter}`,
        {
            skipAdminAppend: true,
        }
    )
};
export const getInAppLeads = async (pageNo, limit, globalFilter) => {
    return Api().get(`/leads/admin/in-app-leads?currentPage=${pageNo}&perPage=${limit}&search=${globalFilter}`,
        {
            skipAdminAppend: true,
        }
    )
};
export const addGroupUsers = async (payload) => {
    return Api().post(`/push-notification/admin/groups/add-users`, payload,
        {
            skipAdminAppend: true,
        }
    )
};
export const createTemplate = async (payload) => {
    return Api().post(`/push-notification/admin/templates`, payload,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            skipAdminAppend: true,
        }
    )
};
export const sendPushNotification = async (payload) => {
    return Api().post(`/push-notification/admin/send`, payload,
        {
            skipAdminAppend: true,
        }
    )
};

export const AddLender = async (formData) => {
    console.log(formData, "fffsss")
    return Api().post('/lender', formData);
};

export const getLenderById = async id => Api().get(`/lender/${id}`);

export const UpdateLender = async (id, formData) => {
    return Api().put(`/lender/${id}`, formData);
};
