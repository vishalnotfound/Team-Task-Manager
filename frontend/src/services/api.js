import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses by clearing auth state
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear auth if the failed request was NOT a login/signup attempt
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/signup')) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (name, email, password, role) => api.post('/auth/signup', { name, email, password, role }),
  getUsers: () => api.get('/auth/users'),
};

export const dashboardService = {
  getDashboard: () => api.get('/dashboard/'),
};

export const projectService = {
  getProjects: () => api.get('/projects/'),
  createProject: (data) => api.post('/projects/', data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  getMembers: (id) => api.get(`/projects/${id}/members`),
  addMember: (id, userId) => api.post(`/projects/${id}/members`, { user_id: userId }),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
  getFavorites: () => api.get('/projects/favorites'),
  toggleFavorite: (id) => api.post(`/projects/${id}/favorite`),
};

export const taskService = {
  getTasks: (projectId) => api.get('/tasks/', { params: projectId ? { project_id: projectId } : {} }),
  createTask: (data) => api.post('/tasks/', data),
  updateTask: (id, data) => api.patch(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export default api;
