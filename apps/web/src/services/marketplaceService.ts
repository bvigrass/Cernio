import axios from 'axios';
import { InventoryItem } from '../types/inventory';

const API_URL = 'http://localhost:3000/api/v1';

// Public marketplace service - no authentication required
export const marketplaceService = {
  /**
   * Get all salvage items available for sale (public endpoint)
   */
  async getSalvageItems(): Promise<InventoryItem[]> {
    const response = await axios.get(`${API_URL}/marketplace`);
    return response.data;
  },

  /**
   * Get a single salvage item by ID (public endpoint)
   */
  async getSalvageItem(id: string): Promise<InventoryItem> {
    const response = await axios.get(`${API_URL}/marketplace/${id}`);
    return response.data;
  },
};
