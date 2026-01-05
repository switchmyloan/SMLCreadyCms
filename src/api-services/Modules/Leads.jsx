import Api from "../api";


export const getLeads = async () => {
    return Api().get(`/leads/admin/in-web-leads`,
        {
            skipAdminAppend: true,
        }
    )
};
export const getPartnerLeads = async () => {
    return Api().get(`/leads/admin/partner-leads`,
        {
            skipAdminAppend: true,
        }
    )
};
export const getAllLeads = async () => {
    return Api().get(`/leads/admin/all-leads`,
        {
            skipAdminAppend: true,
        }
    )
};

// export const getLeads = async (pageNo, limit, globalFilter, gender, minIncome, maxIncome,fromDate,toDate) => {
//     // Base URL
//     const baseUrl = `/leads/admin/in-web-leads`;

//     // Build query params dynamically
//     const params = new URLSearchParams();

//     if (pageNo) params.append('currentPage', pageNo);
//     if (limit) params.append('perPage', limit);
//     if (globalFilter) params.append('search', globalFilter);
//     if (gender) params.append('gender', gender);
//     if (fromDate) params.append('fromDate', fromDate);
//     if (toDate) params.append('toDate', toDate);
//     // if (filter_date) params.append('type', filter_date);
//     if (minIncome !== undefined && minIncome !== null) params.append('minIncome', Number(minIncome));
//     if (maxIncome !== undefined && maxIncome !== null) params.append('maxIncome', Number(maxIncome));

//     const queryString = params.toString(); // Automatically encodes the values

//     return Api().get(`${baseUrl}?${queryString}`, {
//         skipAdminAppend: true,
//     });
// };

export const getInAppLeads = async (pageNo, limit, globalFilter, gender, minIncome, maxIncome) => {
    // Base URL
    const baseUrl = `/leads/admin/in-app-leads`;

    // Build query params dynamically
    const params = new URLSearchParams();

    if (pageNo) params.append('currentPage', pageNo);
    if (limit) params.append('perPage', limit);
    if (globalFilter) params.append('search', globalFilter);
    if (gender) params.append('gender', gender);
    // if (filter_date) params.append('type', filter_date);
    if (minIncome !== undefined && minIncome !== null) params.append('minIncome', Number(minIncome));
    if (maxIncome !== undefined && maxIncome !== null) params.append('maxIncome', Number(maxIncome));

    const queryString = params.toString(); // Automatically encodes the values

    return Api().get(`${baseUrl}?${queryString}`, {
        skipAdminAppend: true,
    });
};

// export const getInAppLeads = async (pageNo, limit, globalFilter) => {
//     return Api().get(`/leads/admin/in-app-leads?currentPage=${pageNo}&perPage=${limit}&search=${globalFilter}`,
//         {
//             skipAdminAppend: true,
//         }
//     )
// };
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
            // headers: {
            //     'Content-Type': 'multipart/form-data',
            // },
            skipAdminAppend: true,
        }
    )
};
export const updateTemplate = async (id , payload) => {
    console.log(payload, "ppppp")
    return Api().put(`/push-notification/admin/templates/${id}`, payload,
        {
            // headers: {
            //     'Content-Type': 'multipart/form-data',
            // },
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
