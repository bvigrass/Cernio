import { Client } from './client';

export enum ProjectStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Project {
  id: string;
  companyId: string;
  clientId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  imageUrl?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  startDate?: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  estimatedBudget?: number;
  actualCost?: number;
  createdAt: string;
  updatedAt: string;
  client?: Client;
}

export interface CreateProjectData {
  clientId: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  imageUrl?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  startDate?: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  estimatedBudget?: number;
  actualCost?: number;
}

export interface UpdateProjectData {
  clientId?: string;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  imageUrl?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  startDate?: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  estimatedBudget?: number;
  actualCost?: number;
}
