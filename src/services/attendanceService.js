import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_ATTENDANCE_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const attendanceService = {
  getTodayAttendance: async (userId) => {
    const response = await api.get(`/attendance/today?user_id=${userId}`);
    return response.data;
  },

  tapInTapOut: async (userId) => {
    const response = await api.post('/attendance/absence', { user_id: userId });
    return response.data;
  },

  getAttendanceSummary: async (userId, startDate, endDate) => {
    const response = await api.get(`/attendance/user/${userId}?start_date=${startDate}&end_date=${endDate}`);
    return response.data;
  }
};

export default attendanceService;