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
      const fallbackTarget = currentUrl.includes('8000') ? 'http://127.0.0.1:8001' : 'http://127.0.0.1:8000';
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
  updateLanguage: (language) => api.patch('/language', null, { params: { language } }),
  updateProfile: (profileData) => api.patch('/profile', null, { params: profileData }),
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

export const ragAPI = {
  uploadDocument: (formData) => api.post('/rag/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDocuments: () => api.get('/rag/documents'),
  getDocument: (docId) => api.get(`/rag/documents/${docId}`),
  deleteDocument: (docId) => api.delete(`/rag/documents/${docId}`),
  reprocessDocument: (docId) => api.post(`/rag/documents/${docId}/reprocess`),
  query: (data) => api.post('/rag/query', data),
  getSubjects: () => api.get('/rag/subjects'),
  getUnits: (subjectName) => api.get('/rag/units', { params: { subject_name: subjectName } }),
  getHealth: () => api.get('/rag/health'),
};

export const weaknessAPI = {
  getAnalysis: (subject) => api.get('/weakness/analysis', { params: { subject } }),
  getRecommendations: (topic, subject) => api.get('/weakness/recommendations', { params: { topic, subject } }),
  recordMastery: (data) => api.post('/weakness/record-mastery', data),
};

export const examPrepAPI = {
  createPlan: (data) => api.post('/exam-prep/plan', data),
  getPlans: () => api.get('/exam-prep/plans'),
  getPlan: (planId) => api.get(`/exam-prep/plan/${planId}`),
  toggleTask: (taskId, data) => api.patch(`/exam-prep/task/${taskId}`, data),
  deletePlan: (planId) => api.delete(`/exam-prep/plan/${planId}`),
};

export const facultyAPI = {
  getOverview: (filters) => api.get('/faculty/overview', { params: filters }),
  getMyEarlyWarning: () => api.get('/faculty/my-early-warning'),
};

export const revisionAPI = {
  getSchedule: (subject) => api.get('/revision/schedule', { params: { subject } }),
  reviewTopic: (data) => api.post('/revision/review', data),
  getFlashcards: (topic, subject) => api.get('/revision/flashcards', { params: { topic, subject } }),
};

export const questionPaperAPI = {
  uploadPaper: (formData) => api.post('/question-papers/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getPapers: (subject) => api.get('/question-papers', { params: { subject } }),
  getPaper: (paperId) => api.get(`/question-papers/${paperId}`),
};

export const assignmentAPI = {
  evaluate: (data) => api.post('/assignments/evaluate', data),
  getHistory: (subject) => api.get('/assignments/history', { params: { subject } }),
};

export const studyGroupAPI = {
  createGroup: (data) => api.post('/study-groups', data),
  searchGroups: (filters) => api.get('/study-groups', { params: filters }),
  joinGroup: (groupId) => api.post(`/study-groups/${groupId}/join`),
  getGroup: (groupId) => api.get(`/study-groups/${groupId}`),
  scheduleSession: (groupId, data) => api.post(`/study-groups/${groupId}/sessions`, data),
};

export const gamificationAPI = {
  getOverview: () => api.get('/gamification/overview'),
  recordActivity: (activityType) => api.post('/gamification/record-activity', null, { params: { activity_type: activityType } }),
};

export const llmConfigAPI = {
  getProviders: () => api.get('/llm/providers'),
  getConfig: () => api.get('/llm/config'),
  saveConfig: (data) => api.post('/llm/config', data),
  deleteConfig: () => api.delete('/llm/config'),
  testConnection: (data) => api.post('/llm/test-connection', data),
  getCollegeConfig: () => api.get('/llm/college-config'),
  saveCollegeConfig: (data) => api.post('/llm/college-config', data),
  deleteCollegeConfig: () => api.delete('/llm/college-config'),
  getUsage: () => api.get('/llm/usage'),
};

export default api;
