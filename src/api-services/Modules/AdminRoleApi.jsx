import Api from "../api";

// ==================== PERMISSIONS ====================

export const getAllPermissions = async () => {
  return Api().get("/admin/role-management/permissions", {
    skipAdminAppend: true,
  });
};

export const getPermissionsByModule = async (module) => {
  return Api().get(`/admin/role-management/permissions/module/${module}`, {
    skipAdminAppend: true,
  });
};

export const seedPermissions = async () => {
  return Api().post("/admin/role-management/permissions/seed", {}, {
    skipAdminAppend: true,
  });
};

export const reseedPermissions = async () => {
  return Api().post("/admin/role-management/permissions/reseed", {}, {
    skipAdminAppend: true,
  });
};

// ==================== ROLES ====================

export const getAllRoles = async () => {
  return Api().get("/admin/role-management/roles", {
    skipAdminAppend: true,
  });
};

export const getRoleById = async (id) => {
  return Api().get(`/admin/role-management/roles/${id}`, {
    skipAdminAppend: true,
  });
};

export const createRole = async (data) => {
  return Api().post("/admin/role-management/roles", data, {
    skipAdminAppend: true,
  });
};

export const updateRole = async (id, data) => {
  return Api().put(`/admin/role-management/roles/${id}`, data, {
    skipAdminAppend: true,
  });
};

export const deleteRole = async (id) => {
  return Api().delete(`/admin/role-management/roles/${id}`, {
    skipAdminAppend: true,
  });
};

export const assignPermissions = async (roleId, permissionIds) => {
  return Api().put(`/admin/role-management/roles/${roleId}/permissions`, {
    permissionIds,
  }, {
    skipAdminAppend: true,
  });
};

export const seedRoles = async () => {
  return Api().post("/admin/role-management/roles/seed", {}, {
    skipAdminAppend: true,
  });
};

// ==================== ADMIN USERS ====================

export const getAllAdminUsers = async () => {
  return Api().get("/admin/role-management/users", {
    skipAdminAppend: true,
  });
};

export const getAdminUserById = async (id) => {
  return Api().get(`/admin/role-management/users/${id}`, {
    skipAdminAppend: true,
  });
};

export const createAdminUser = async (data) => {
  return Api().post("/admin/role-management/users", data, {
    skipAdminAppend: true,
  });
};

export const updateAdminUser = async (id, data) => {
  return Api().put(`/admin/role-management/users/${id}`, data, {
    skipAdminAppend: true,
  });
};

export const deleteAdminUser = async (id) => {
  return Api().delete(`/admin/role-management/users/${id}`, {
    skipAdminAppend: true,
  });
};

export const changeAdminPassword = async (id, newPassword) => {
  return Api().put(`/admin/role-management/users/${id}/password`, {
    newPassword,
  }, {
    skipAdminAppend: true,
  });
};

// ==================== AUTHENTICATION ====================

export const adminLogin = async (email, password) => {
  return Api().post("/admin/role-management/auth/login", {
    email,
    password,
  }, {
    skipAdminAppend: true,
  });
};

export const getCurrentUser = async () => {
  return Api().get("/admin/role-management/auth/me", {
    skipAdminAppend: true,
  });
};
