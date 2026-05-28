import Api from "../api";


export const getUtmOptions = async () => {
    return Api().get(`/leads/admin/utm-options`,
        { skipAdminAppend: true }
    );
};

export const getDisbursements = async (pageNo = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('currentPage', pageNo);
    params.append('perPage', limit);

    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.lender) params.append('lender', filters.lender);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.attribution) params.append('attribution', filters.attribution);

    return Api().get(`/leads/admin/disbursements?${params.toString()}`,
        { skipAdminAppend: true }
    );
};

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
    type,
    exportToken,
    disbursement,
    utmSource,
    utmMedium
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
    if (disbursement === 'yes' || disbursement === 'no') params.append('disbursement', disbursement);
    if (utmSource) params.append('utmSource', utmSource);
    if (utmMedium) params.append('utmMedium', utmMedium);

    const queryString = params.toString();
    const headers = exportToken ? { 'X-Export-Token': exportToken } : undefined;

    return Api().get(`${baseUrl}${queryString ? `?${queryString}` : ''}`,
        {
            skipAdminAppend: true,
            ...(headers ? { headers } : {}),
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
export const getPartnerLeads = async (pageNo = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('currentPage', pageNo);
    params.append('perPage', limit);

    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.jobType) params.append('jobType', filters.jobType);
    if (filters.minIncome !== undefined && filters.minIncome !== null) params.append('minIncome', filters.minIncome);
    if (filters.maxIncome !== undefined && filters.maxIncome !== null) params.append('maxIncome', filters.maxIncome);
    if (filters.minAge !== undefined && filters.minAge !== null) params.append('minAge', filters.minAge);
    if (filters.maxAge !== undefined && filters.maxAge !== null) params.append('maxAge', filters.maxAge);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);

    return Api().get(`/leads/admin/partner-leads?${params.toString()}`,
        { skipAdminAppend: true }
    );
};

// All rows for export (no pagination, applies same filters)
export const getAllPartnerLeads = async (filters = {}) => {
    const params = new URLSearchParams();
    params.append('currentPage', 1);
    params.append('perPage', 100000);

    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.jobType) params.append('jobType', filters.jobType);
    if (filters.minIncome !== undefined && filters.minIncome !== null) params.append('minIncome', filters.minIncome);
    if (filters.maxIncome !== undefined && filters.maxIncome !== null) params.append('maxIncome', filters.maxIncome);
    if (filters.minAge !== undefined && filters.minAge !== null) params.append('minAge', filters.minAge);
    if (filters.maxAge !== undefined && filters.maxAge !== null) params.append('maxAge', filters.maxAge);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);

    return Api().get(`/leads/admin/partner-leads?${params.toString()}`,
        { skipAdminAppend: true }
    );
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
    if (filters.utmSource) params.append('utmSource', filters.utmSource);
    if (filters.utmMedium) params.append('utmMedium', filters.utmMedium);

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

const buildLeadTrackerParams = (pageNo = 1, limit = 10, filters = {}) => {
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
    if (filters.mode) params.append('mode', filters.mode);
    if (filters.utmSource) params.append('utmSource', filters.utmSource);
    if (filters.utmMedium) params.append('utmMedium', filters.utmMedium);
    return params.toString();
};

export const getAppLeadTracker = async (pageNo = 1, limit = 10, filters = {}) => {
    return Api().get(`/leads/admin/app-lead-tracker?${buildLeadTrackerParams(pageNo, limit, filters)}`,
        { skipAdminAppend: true }
    );
};

export const getAllAppLeadTracker = async (filters = {}, exportToken) => {
    const headers = exportToken ? { 'X-Export-Token': exportToken } : undefined;
    return Api().get(`/leads/admin/app-lead-tracker?${buildLeadTrackerParams(1, 10000, filters)}`,
        { skipAdminAppend: true, ...(headers ? { headers } : {}) }
    );
};

export const getWebLeadTracker = async (pageNo = 1, limit = 10, filters = {}) => {
    return Api().get(`/leads/admin/web-lead-tracker?${buildLeadTrackerParams(pageNo, limit, filters)}`,
        { skipAdminAppend: true }
    );
};

export const getAllWebLeadTracker = async (filters = {}, exportToken) => {
    const headers = exportToken ? { 'X-Export-Token': exportToken } : undefined;
    return Api().get(`/leads/admin/web-lead-tracker?${buildLeadTrackerParams(1, 10000, filters)}`,
        { skipAdminAppend: true, ...(headers ? { headers } : {}) }
    );
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
    type,
    exportToken,
    disbursement,
    utmSource,
    utmMedium
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
    if (disbursement === 'yes' || disbursement === 'no') params.append('disbursement', disbursement);
    if (utmSource) params.append('utmSource', utmSource);
    if (utmMedium) params.append('utmMedium', utmMedium);

    const queryString = params.toString(); // Automatically encodes the values
    const headers = exportToken ? { 'X-Export-Token': exportToken } : undefined;

    return Api().get(`${baseUrl}${queryString ? `?${queryString}` : ''}`, {
        skipAdminAppend: true,
        ...(headers ? { headers } : {}),
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

export const schedulePushNotification = async (payload) => {
    return Api().post(`/push-notification/admin/schedule`, payload,
        { skipAdminAppend: true }
    );
};

export const listPushSchedules = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.templateId) params.append('templateId', filters.templateId);
    const qs = params.toString();
    return Api().get(`/push-notification/admin/schedules${qs ? `?${qs}` : ''}`,
        { skipAdminAppend: true }
    );
};

export const cancelPushSchedule = async (id) => {
    return Api().delete(`/push-notification/admin/schedules/${id}`,
        { skipAdminAppend: true }
    );
};

// ===== Export OTP gate =====
export const requestExportOtp = async (mobileNumber) => {
    return Api().post(`/admin/export/request-otp`, { mobileNumber },
        { skipAdminAppend: true }
    );
};

export const verifyExportOtp = async (sessionId, otp) => {
    return Api().post(`/admin/export/verify-otp`, { sessionId, otp },
        { skipAdminAppend: true }
    );
};

// ===== Funnel dashboard =====
export const getFunnelOverview = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    const qs = params.toString();
    return Api().get(`/dashboard/funnel-overview${qs ? `?${qs}` : ''}`,
        { skipAdminAppend: true }
    );
};

export const getExportAuditLogs = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.exportType) params.append('exportType', filters.exportType);
    if (filters.mobileNumber) params.append('mobileNumber', filters.mobileNumber);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.limit !== undefined) params.append('limit', filters.limit);
    if (filters.offset !== undefined) params.append('offset', filters.offset);
    const qs = params.toString();
    return Api().get(`/admin/export/audit-logs${qs ? `?${qs}` : ''}`,
        { skipAdminAppend: true }
    );
};

export const AddLender = async (formData) => {
    console.log(formData, "fffsss")
    return Api().post('/lender', formData);
};

export const getLenderById = async id => Api().get(`/lender/${id}`);

export const UpdateLender = async (id, formData) => {
    return Api().put(`/lender/${id}`, formData);
};
