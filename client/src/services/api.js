import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const attendanceAPI = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/attendance/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getDashboardData: () => {
    return api.get('/attendance/dashboard');
  },

  getEmployees: () => {
    return api.get('/attendance/employees');
  },

  getEmployeeData: (id) => {
    return api.get(`/attendance/employee/${id}`);
  },

  healthCheck: () => {
    return api.get('/health');
  }
};

export default api;