import Api from "../api";


export const getLeads = async (
    pageNo,
    limit,
    globalFilter,
    gender,
    minIncome,
    maxIncome,
    fromDate,
    toDate,
    minAge,
    maxAge,
    jobType,
    type
) => {
    const baseUrl = `/leads/admin/in-web-leads`;
    const params = new URLSearchParams();

    if (pageNo) params.append('currentPage', pageNo);
    if (limit) params.append('perPage', limit);
    if (globalFilter) params.append('search', globalFilter);
    if (gender) params.append('gender', gender);
    if (type) {
        params.append('type', type);
    } else {
        if (fromDate) params.append('fromDate', fromDate);
        if (toDate) params.append('toDate', toDate);
    }
    if (minIncome !== undefined && minIncome !== null) params.append('minIncome', Number(minIncome));
    if (maxIncome !== undefined && maxIncome !== null) params.append('maxIncome', Number(maxIncome));
    if (minAge !== undefined && minAge !== null) params.append('minAge', Number(minAge));
    if (maxAge !== undefined && maxAge !== null) params.append('maxAge', Number(maxAge));
    if (jobType) params.append('jobType', jobType);

    const queryString = params.toString();

    return Api().get(`${baseUrl}${queryString ? `?${queryString}` : ''}`,
        {
            skipAdminAppend: true,
        }
    )
};
export const getRawMisZypeData = async (pageNo, limit) => {
    return Api().get(`/public/admin/get-raw-mis-zype-data?pageNo, limit=${pageNo}&limit=${limit}`,
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
export const getAllLeads = async (pageNo = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('currentPage', pageNo);
    params.append('perPage', limit);

    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.minIncome !== undefined) params.append('minIncome', filters.minIncome);
    if (filters.maxIncome !== undefined) params.append('maxIncome', filters.maxIncome);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);

    return Api().get(`/leads/admin/all-leads?${params.toString()}`,
        {
            skipAdminAppend: true,
        }
    )
};

export const getAllGoldLoanLeads = async (filters = {}) => {
    const params = new URLSearchParams();
    params.append('currentPage', 1);
    params.append('perPage', 10000);

    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.minIncome !== undefined && filters.minIncome !== null) params.append('minIncome', filters.minIncome);
    if (filters.maxIncome !== undefined && filters.maxIncome !== null) params.append('maxIncome', filters.maxIncome);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.stage) params.append('stage', filters.stage);

    return Api().get(`/leads/admin/gold-loan-leads?${params.toString()}`,
        {
            skipAdminAppend: true,
        }
    )
};

export const getGoldLoanLeads = async (pageNo = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('currentPage', pageNo);
    params.append('perPage', limit);

    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.minIncome !== undefined && filters.minIncome !== null) params.append('minIncome', filters.minIncome);
    if (filters.maxIncome !== undefined && filters.maxIncome !== null) params.append('maxIncome', filters.maxIncome);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.stage) params.append('stage', filters.stage);

    return Api().get(`/leads/admin/gold-loan-leads?${params.toString()}`,
        {
            skipAdminAppend: true,
        }
    )
};

export const getInAppLeads = async (
    pageNo,
    limit,
    globalFilter,
    gender,
    minIncome,
    maxIncome,
    fromDate,
    toDate,
    minAge,
    maxAge,
    jobType,
    type
) => {
    // Base URL
    const baseUrl = `/leads/admin/in-app-leads`;

    // Build query params dynamically
    const params = new URLSearchParams();

    if (pageNo) params.append('currentPage', pageNo);
    if (limit) params.append('perPage', limit);
    if (globalFilter) params.append('search', globalFilter);
    if (gender) params.append('gender', gender);
    if (type) {
        params.append('type', type);
    } else {
        if (fromDate) params.append('fromDate', fromDate);
        if (toDate) params.append('toDate', toDate);
    }
    if (minIncome !== undefined && minIncome !== null) params.append('minIncome', Number(minIncome));
    if (maxIncome !== undefined && maxIncome !== null) params.append('maxIncome', Number(maxIncome));
    if (minAge !== undefined && minAge !== null) params.append('minAge', Number(minAge));
    if (maxAge !== undefined && maxAge !== null) params.append('maxAge', Number(maxAge));
    if (jobType) params.append('jobType', jobType);

    const queryString = params.toString(); // Automatically encodes the values

    return Api().get(`${baseUrl}${queryString ? `?${queryString}` : ''}`, {
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
