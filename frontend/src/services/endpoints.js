import api from './api';

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const appsApi = {
  getMyApps: () => api.get('/apps'),
};

export const zohoApi = {
  people: (path = '') => api.get(`/zoho/people${path}`),
  crm: (path = '') => api.get(`/zoho/crm${path}`),
  desk: (path = '') => api.get(`/zoho/desk${path}`),
  books: (path = '') => api.get(`/zoho/books${path}`),
};

export const adminApi = {
  listUsers: () => api.get('/admin/users'),
  createUser: (payload) => api.post('/admin/users', payload),
  updateUser: (id, payload) => api.put(`/admin/users/${id}`, payload),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  listRoles: () => api.get('/admin/roles'),
  createRole: (payload) => api.post('/admin/roles', payload),
  updateRole: (id, payload) => api.put(`/admin/roles/${id}`, payload),
  deleteRole: (id) => api.delete(`/admin/roles/${id}`),

  listPermissions: () => api.get('/admin/permissions'),
  createPermission: (payload) => api.post('/admin/permissions', payload),

  listAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};
