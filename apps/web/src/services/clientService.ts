import api from './api';
import { Client, CreateClientData, UpdateClientData } from '../types/client';

export const clientService = {
  /**
   * Get all clients for the current company
   */
  async getClients(): Promise<Client[]> {
    const response = await api.get<Client[]>('/clients');
    return response.data;
  },

  /**
   * Get a single client by ID
   */
  async getClient(id: string): Promise<Client> {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  },

  /**
   * Create a new client
   */
  async createClient(data: CreateClientData): Promise<Client> {
    const response = await api.post<Client>('/clients', data);
    return response.data;
  },

  /**
   * Update an existing client
   */
  async updateClient(id: string, data: UpdateClientData): Promise<Client> {
    const response = await api.put<Client>(`/clients/${id}`, data);
    return response.data;
  },

  /**
   * Delete a client
   */
  async deleteClient(id: string): Promise<void> {
    await api.delete(`/clients/${id}`);
  },
};
