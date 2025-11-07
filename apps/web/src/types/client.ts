export enum ClientType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  MUNICIPAL = 'MUNICIPAL',
}

export interface ClientContact {
  id: string;
  clientId: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  companyId: string;
  name: string;
  type: ClientType;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contacts: ClientContact[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientContactData {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  isPrimary?: boolean;
}

export interface CreateClientData {
  name: string;
  type: ClientType;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contacts?: CreateClientContactData[];
}

export interface UpdateClientData {
  name?: string;
  type?: ClientType;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contacts?: CreateClientContactData[];
}
