import axios from 'axios';

// AI: begin do not edit
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
// AI: end do not edit

// AI: begin do not edit
// Get all users
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// Add collaborator to mission
export const addCollaborator = async (missionId: string, userId: string) => {
  const response = await api.post(`/missions/${missionId}/collaborators`, { userId });
  return response.data;
};

// Remove collaborator from mission
export const removeCollaborator = async (missionId: string, userId: string) => {
  await api.delete(`/missions/${missionId}/collaborators/${userId}`);
};
// AI: end do not edit

export default api;
