import { create } from 'zustand';
import {
  InventoryItem,
  CreateInventoryItemData,
  UpdateInventoryItemData,
  InventoryFilters,
} from '../types/inventory';
import { inventoryService } from '../services/inventoryService';

interface InventoryState {
  items: InventoryItem[];
  currentItem: InventoryItem | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchItems: (filters?: InventoryFilters) => Promise<void>;
  fetchItem: (id: string) => Promise<void>;
  createItem: (data: CreateInventoryItemData) => Promise<InventoryItem>;
  updateItem: (id: string, data: UpdateInventoryItemData) => Promise<InventoryItem>;
  deleteItem: (id: string) => Promise<void>;
  clearError: () => void;
  clearCurrentItem: () => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,

  fetchItems: async (filters?: InventoryFilters) => {
    set({ isLoading: true, error: null });
    try {
      const items = await inventoryService.getInventoryItems(filters);
      set({ items, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch inventory items';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchItem: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const item = await inventoryService.getInventoryItem(id);
      set({ currentItem: item, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch inventory item';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  createItem: async (data: CreateInventoryItemData) => {
    set({ isLoading: true, error: null });
    try {
      const item = await inventoryService.createInventoryItem(data);
      set((state) => ({
        items: [item, ...state.items],
        isLoading: false,
      }));
      return item;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create inventory item';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateItem: async (id: string, data: UpdateInventoryItemData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedItem = await inventoryService.updateInventoryItem(id, data);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updatedItem : item)),
        currentItem: state.currentItem?.id === id ? updatedItem : state.currentItem,
        isLoading: false,
      }));
      return updatedItem;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update inventory item';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteItem: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await inventoryService.deleteInventoryItem(id);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        currentItem: state.currentItem?.id === id ? null : state.currentItem,
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete inventory item';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentItem: () => set({ currentItem: null }),
}));
