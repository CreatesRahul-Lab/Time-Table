import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  refreshToken: (token) => api.post('/auth/refresh-token', { token }),
};

// Timetable API
export const timetableAPI = {
  getAll: (params) => api.get('/timetables', { params }),
  getById: (id) => api.get(`/timetables/${id}`),
  create: (data) => api.post('/timetables/generate', data),
  generateOptions: (data) => api.post('/timetables/generate-options', data),
  update: (id, data) => api.put(`/timetables/${id}`, data),
  approve: (id, data) => api.post(`/timetables/${id}/approve`, data),
  publish: (id) => api.post(`/timetables/${id}/publish`),
  delete: (id) => api.delete(`/timetables/${id}`),
  getAnalytics: (params) => api.get('/timetables/analytics', { params }),
};

// Subject API
export const subjectAPI = {
  getAll: (params) => api.get('/subjects', { params }),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
  assignFaculty: (id, facultyIds) => api.post(`/subjects/${id}/faculty`, { facultyIds }),
  removeFaculty: (id, facultyId) => api.delete(`/subjects/${id}/faculty/${facultyId}`),
  setFixedSlots: (id, fixedTimeSlots) => api.put(`/subjects/${id}/fixed-slots`, { fixedTimeSlots }),
  getByDepartment: (department, semester) => api.get(`/subjects/department/${department}/semester/${semester}`),
  getStats: () => api.get('/subjects/stats/overview'),
};

// Faculty API
export const facultyAPI = {
  getAll: (params) => api.get('/faculty', { params }),
  getById: (id) => api.get(`/faculty/${id}`),
  create: (data) => api.post('/faculty', data),
  update: (id, data) => api.put(`/faculty/${id}`, data),
  delete: (id) => api.delete(`/faculty/${id}`),
  getAvailability: (id, params) => api.get(`/faculty/${id}/availability`, { params }),
  updateAvailability: (id, data) => api.put(`/faculty/${id}/availability`, data),
  getWorkload: (id) => api.get(`/faculty/${id}/workload`),
  assignSubjects: (id, subjectIds) => api.post(`/faculty/${id}/subjects`, { subjectIds }),
  removeSubject: (id, subjectId) => api.delete(`/faculty/${id}/subjects/${subjectId}`),
  getStats: () => api.get('/faculty/stats/overview'),
};

// Classroom API
export const classroomAPI = {
  getAll: (params) => api.get('/classrooms', { params }),
  getById: (id) => api.get(`/classrooms/${id}`),
  create: (data) => api.post('/classrooms', data),
  update: (id, data) => api.put(`/classrooms/${id}`, data),
  delete: (id) => api.delete(`/classrooms/${id}`),
  getAvailability: (id, params) => api.get(`/classrooms/${id}/availability`, { params }),
  updateAvailability: (id, data) => api.put(`/classrooms/${id}/availability`, data),
  getStats: () => api.get('/classrooms/stats/overview'),
};

// User API
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats/overview'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
