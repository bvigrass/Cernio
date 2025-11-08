import axios from 'axios';
import { Project, CreateProjectData, UpdateProjectData } from '../types/project';

const API_URL = 'http://localhost:3000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await axios.get(`${API_URL}/projects`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await axios.get(`${API_URL}/projects/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async createProject(data: CreateProjectData): Promise<Project> {
    const response = await axios.post(`${API_URL}/projects`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async updateProject(id: string, data: UpdateProjectData): Promise<Project> {
    const response = await axios.patch(`${API_URL}/projects/${id}`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await axios.delete(`${API_URL}/projects/${id}`, {
      headers: getAuthHeaders(),
    });
  },
};
