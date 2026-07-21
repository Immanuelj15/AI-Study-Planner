import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  getProfile: () => api.get('/profile'),
};

export const subjectsAPI = {
  createSubject: (data) => api.post('/subjects', data),
  getSubjects: () => api.get('/subjects'),
};

export const agentAPI = {
  research: (topic) => api.post('/research', { topic }),
  summarize: (data) => api.post('/summarize', data),
  generateMindmap: (topic) => api.post('/generate-mindmap', { topic }),
  generateQuiz: (data) => api.post('/generate-quiz', data),
  generatePlan: (data) => api.post('/generate-plan', data),
  getStudyPlan: () => api.get('/study-plan'),
};

export const quizAPI = {
  submitQuiz: (data) => api.post('/submit-quiz', data),
};

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
  getAnalytics: () => api.get('/analytics'),
};

export default api;
