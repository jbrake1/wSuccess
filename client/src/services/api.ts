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

// Get relevant facts for a mission
export const getRelevantFacts = async (missionId: string) => {
  const response = await api.get(`/missions/${missionId}/relevant_facts`);
  return response.data;
};

// Create new relevant fact
export const createRelevantFact = async (missionId: string, note: string) => {
  const response = await api.post(`/missions/${missionId}/relevant_facts`, { note });
  return response.data;
};

// Delete relevant fact
export const deleteRelevantFact = async (missionId: string, relevantFactId: string) => {
  await api.delete(`/missions/${missionId}/relevant_facts/${relevantFactId}`);
};

// Get relevant assumptions for a mission
export const getRelevantAssumptions = async (missionId: string) => {
  const response = await api.get(`/missions/${missionId}/relevant_assumptions`);
  return response.data;
};

// Create new relevant assumption
export const createRelevantAssumption = async (missionId: string, note: string) => {
  const response = await api.post(`/missions/${missionId}/relevant_assumptions`, { note });
  return response.data;
};

// Delete relevant assumption
export const deleteRelevantAssumption = async (missionId: string, relevantAssumptionId: string) => {
  await api.delete(`/missions/${missionId}/relevant_assumptions/${relevantAssumptionId}`);
};

export default api;
