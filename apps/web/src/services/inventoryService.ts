import api from './api';
import {
  InventoryItem,
  CreateInventoryItemData,
  UpdateInventoryItemData,
  InventoryFilters,
} from '../types/inventory';

export const inventoryService = {
  async getInventoryItems(filters?: InventoryFilters): Promise<InventoryItem[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.projectId) params.append('projectId', filters.projectId);

    const queryString = params.toString();
    const url = queryString ? `/inventory?${queryString}` : '/inventory';

    const response = await api.get(url);
    return response.data;
  },

  async getInventoryItem(id: string): Promise<InventoryItem> {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  async createInventoryItem(data: CreateInventoryItemData): Promise<InventoryItem> {
    const response = await api.post('/inventory', data);
    return response.data;
  },

  async updateInventoryItem(id: string, data: UpdateInventoryItemData): Promise<InventoryItem> {
    const response = await api.patch(`/inventory/${id}`, data);
    return response.data;
  },

  async deleteInventoryItem(id: string): Promise<void> {
    await api.delete(`/inventory/${id}`);
  },
};
