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

// Automatic failover interceptor if proxy or port 8000/8001 returns connection error
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    if (originalRequest && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) && !originalRequest._retry) {
      originalRequest._retry = true;
      const currentUrl = originalRequest.baseURL || '';
      const fallbackTarget = currentUrl.includes('8001') ? 'http://127.0.0.1:8000' : 'http://127.0.0.1:8001';
      originalRequest.baseURL = fallbackTarget;
      return axios(originalRequest);
    }
    return Promise.reject(error);
  }
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
  research: (topic, difficulty = "Medium") => api.post('/research', { topic, difficulty }),
  summarize: (data) => api.post('/summarize', data),
  generateMindmap: (topic, difficulty = "Medium") => api.post('/generate-mindmap', { topic, difficulty }),
  generateQuiz: (data) => api.post('/generate-quiz', data),
  generatePlan: (data) => api.post('/generate-plan', data),
  getStudyPlan: () => api.get('/study-plan'),
  togglePlanStatus: (planId) => api.post(`/study-plan/${planId}/toggle`),
  chatTutor: (data) => api.post('/chat-tutor', data),
};

export const quizAPI = {
  submitQuiz: (data) => api.post('/submit-quiz', data),
};

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
  getAnalytics: () => api.get('/analytics'),
};

export const adaptiveAPI = {
  getProfile: () => api.get('/adaptive/profile'),
  trackEvent: (data) => api.post('/adaptive/track-event', data),
  getRecommendation: () => api.get('/adaptive/recommendation'),
};

export const focusAPI = {
  start: (data) => api.post('/focus/start', data),
  interruption: (sessionId, type) => api.post(`/focus/${sessionId}/interruption`, { interruption_type: type }),
  resume: (sessionId) => api.post(`/focus/${sessionId}/resume`),
  complete: (sessionId, data) => api.post(`/focus/${sessionId}/complete`, data),
  cancel: (sessionId) => api.post(`/focus/${sessionId}/cancel`),
  getAnalytics: () => api.get('/focus/analytics'),
};

export default api;
