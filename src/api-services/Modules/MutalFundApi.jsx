import Api from "../api";

export const getAllMFUsers = async () => {
    return Api().get(`/50fin/admin/fetch-all-users`,
        {
            skipAdminAppend: true,
        }
    )
};
export const getAllInternalMFUsers = async () => {
    return Api().get(`/50fin/admin/get-internal-fifty-fin-data/`,
        {
            skipAdminAppend: true,
        }
    )
};
export const getAllMFLoans = async () => {
    return Api().get(`/50fin/admin/fetch-all-loans`,
        {
            skipAdminAppend: true,
        }
    )
};
export const getMFLoansSummary = async () => {
    return Api().get(`/50fin/admin/fetch-loans-summary`,
        {
            skipAdminAppend: true,
        }
    )
};