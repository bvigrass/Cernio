import { Project } from './project';

export enum InventoryItemType {
  MATERIAL = 'MATERIAL',
  TOOL = 'TOOL',
  SALVAGE = 'SALVAGE',
}

export enum InventoryStatus {
  // Material statuses
  PURCHASED = 'PURCHASED',
  IN_STOCK = 'IN_STOCK',
  CONSUMED = 'CONSUMED',
  // Tool statuses
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  // Salvage statuses
  ESTIMATED = 'ESTIMATED', // Pre-extraction estimate - quantity may vary
  EXTRACTED = 'EXTRACTED',
  AVAILABLE_FOR_SALE = 'AVAILABLE_FOR_SALE',
  LISTED = 'LISTED',
  SOLD = 'SOLD',
  SHIPPED = 'SHIPPED',
}

export interface InventoryPhoto {
  id: string;
  inventoryItemId: string;
  photoUrl: string;
  isPrimary: boolean;
  displayOrder: number;
  uploadedAt: string;
}

export interface InventoryItem {
  id: string;
  companyId: string;
  projectId?: string;
  type: InventoryItemType;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  status: InventoryStatus;

  // Material-specific
  supplier?: string;
  purchaseCost?: number;
  purchaseDate?: string;
  materialCategory?: string;

  // Tool-specific
  ownership?: string;
  rentalRate?: number;
  rentalPeriod?: string;
  maintenanceDate?: string;
  serialNumber?: string;

  // Salvage-specific
  condition?: string;
  estimatedValue?: number;
  reservePrice?: number;
  dimensions?: string;
  storageLocation?: string;

  createdAt: string;
  updatedAt: string;
  project?: Project;
  photos?: InventoryPhoto[];
}

export interface CreateInventoryItemData {
  type: InventoryItemType;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  status: InventoryStatus;
  projectId?: string;

  // Material-specific
  supplier?: string;
  purchaseCost?: number;
  purchaseDate?: string;
  materialCategory?: string;

  // Tool-specific
  ownership?: string;
  rentalRate?: number;
  rentalPeriod?: string;
  maintenanceDate?: string;
  serialNumber?: string;

  // Salvage-specific
  condition?: string;
  estimatedValue?: number;
  reservePrice?: number;
  dimensions?: string;
  storageLocation?: string;
}

export interface UpdateInventoryItemData {
  type?: InventoryItemType;
  name?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  status?: InventoryStatus;
  projectId?: string;

  // Material-specific
  supplier?: string;
  purchaseCost?: number;
  purchaseDate?: string;
  materialCategory?: string;

  // Tool-specific
  ownership?: string;
  rentalRate?: number;
  rentalPeriod?: string;
  maintenanceDate?: string;
  serialNumber?: string;

  // Salvage-specific
  condition?: string;
  estimatedValue?: number;
  reservePrice?: number;
  dimensions?: string;
  storageLocation?: string;
}

export interface InventoryFilters {
  type?: InventoryItemType;
  status?: InventoryStatus;
  projectId?: string;
}
