import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientType } from '@prisma/client';

describe('ClientsService', () => {
  let service: ClientsService;

  const mockPrismaService = {
    client: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    clientContact: {
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const companyId = 'company-123';
    const createDto = {
      name: 'Acme Corporation',
      type: ClientType.COMMERCIAL,
      street1: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'USA',
    };

    it('should successfully create a client without contacts', async () => {
      const mockClient = {
        id: 'client-123',
        companyId,
        ...createDto,
        street2: null,
        imageUrl: null,
        contacts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.client.create.mockResolvedValue(mockClient);

      const result = await service.create(companyId, createDto);

      expect(result).toEqual(mockClient);
      expect(mockPrismaService.client.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyId,
          name: 'Acme Corporation',
          type: ClientType.COMMERCIAL,
        }),
        include: {
          contacts: true,
        },
      });
    });

    it('should successfully create a client with contacts', async () => {
      const contacts = [
        {
          name: 'John Doe',
          email: 'john@acme.com',
          phone: '555-0100',
          role: 'Project Manager',
          isPrimary: true,
        },
        {
          name: 'Jane Smith',
          email: 'jane@acme.com',
          phone: '555-0101',
          role: 'Operations',
          isPrimary: false,
        },
      ];

      const dtoWithContacts = {
        ...createDto,
        contacts,
      };

      const mockClient = {
        id: 'client-123',
        companyId,
        ...createDto,
        contacts: contacts.map((c, i) => ({
          id: `contact-${i}`,
          clientId: 'client-123',
          ...c,
          imageUrl: null,
        })),
      };

      mockPrismaService.client.create.mockResolvedValue(mockClient);

      const result = await service.create(companyId, dtoWithContacts);

      expect(result).toEqual(mockClient);
      expect(mockPrismaService.client.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyId,
          name: 'Acme Corporation',
          contacts: {
            create: contacts,
          },
        }),
        include: {
          contacts: true,
        },
      });
    });
  });

  describe('findAll', () => {
    const companyId = 'company-123';

    it('should return all clients for a company', async () => {
      const mockClients = [
        {
          id: 'client-1',
          companyId,
          name: 'Acme Corporation',
          type: ClientType.COMMERCIAL,
          contacts: [],
        },
        {
          id: 'client-2',
          companyId,
          name: 'Smith Residence',
          type: ClientType.RESIDENTIAL,
          contacts: [],
        },
      ];

      mockPrismaService.client.findMany.mockResolvedValue(mockClients);

      const result = await service.findAll(companyId);

      expect(result).toEqual(mockClients);
      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith({
        where: { companyId },
        include: {
          contacts: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return empty array if no clients exist', async () => {
      mockPrismaService.client.findMany.mockResolvedValue([]);

      const result = await service.findAll(companyId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const companyId = 'company-123';
    const clientId = 'client-123';

    it('should return a client if found and belongs to company', async () => {
      const mockClient = {
        id: clientId,
        companyId,
        name: 'Acme Corporation',
        type: ClientType.COMMERCIAL,
        contacts: [],
      };

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);

      const result = await service.findOne(clientId, companyId);

      expect(result).toEqual(mockClient);
      expect(mockPrismaService.client.findUnique).toHaveBeenCalledWith({
        where: { id: clientId },
        include: {
          contacts: true,
        },
      });
    });

    it('should throw NotFoundException if client not found', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);

      await expect(service.findOne(clientId, companyId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(clientId, companyId)).rejects.toThrow(
        `Client with ID ${clientId} not found`,
      );
    });

    it('should throw ForbiddenException if client belongs to different company', async () => {
      const mockClient = {
        id: clientId,
        companyId: 'different-company',
        name: 'Acme Corporation',
        type: ClientType.COMMERCIAL,
      };

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);

      await expect(service.findOne(clientId, companyId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.findOne(clientId, companyId)).rejects.toThrow(
        'You do not have access to this client',
      );
    });
  });

  describe('update', () => {
    const companyId = 'company-123';
    const clientId = 'client-123';

    it('should successfully update a client without contacts', async () => {
      const updateDto = {
        name: 'Updated Name',
        city: 'New City',
      };

      const existingClient = {
        id: clientId,
        companyId,
        name: 'Old Name',
        type: ClientType.COMMERCIAL,
        contacts: [],
      };

      const updatedClient = {
        ...existingClient,
        ...updateDto,
      };

      mockPrismaService.client.findUnique.mockResolvedValue(existingClient);
      mockPrismaService.client.update.mockResolvedValue(updatedClient);

      const result = await service.update(clientId, companyId, updateDto);

      expect(result).toEqual(updatedClient);
      expect(mockPrismaService.client.update).toHaveBeenCalledWith({
        where: { id: clientId },
        data: expect.objectContaining({
          name: 'Updated Name',
          city: 'New City',
        }),
        include: {
          contacts: true,
        },
      });
    });

    it('should successfully update a client and replace contacts', async () => {
      const newContacts = [
        {
          name: 'New Contact',
          email: 'new@example.com',
          phone: '555-9999',
        },
      ];

      const updateDto = {
        name: 'Updated Name',
        contacts: newContacts,
      };

      const existingClient = {
        id: clientId,
        companyId,
        name: 'Old Name',
        type: ClientType.COMMERCIAL,
        contacts: [
          {
            id: 'old-contact-1',
            name: 'Old Contact',
          },
        ],
      };

      const updatedClient = {
        ...existingClient,
        name: 'Updated Name',
        contacts: newContacts.map((c, i) => ({
          id: `new-contact-${i}`,
          clientId,
          ...c,
        })),
      };

      mockPrismaService.client.findUnique.mockResolvedValue(existingClient);
      mockPrismaService.clientContact.deleteMany.mockResolvedValue({
        count: 1,
      });
      mockPrismaService.client.update.mockResolvedValue(updatedClient);

      const result = await service.update(clientId, companyId, updateDto);

      expect(result).toEqual(updatedClient);
      expect(mockPrismaService.clientContact.deleteMany).toHaveBeenCalledWith({
        where: { clientId },
      });
      expect(mockPrismaService.client.update).toHaveBeenCalledWith({
        where: { id: clientId },
        data: expect.objectContaining({
          name: 'Updated Name',
          contacts: {
            create: newContacts,
          },
        }),
        include: {
          contacts: true,
        },
      });
    });

    it('should throw NotFoundException if client not found', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);

      await expect(
        service.update(clientId, companyId, { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if client belongs to different company', async () => {
      const existingClient = {
        id: clientId,
        companyId: 'different-company',
      };

      mockPrismaService.client.findUnique.mockResolvedValue(existingClient);

      await expect(
        service.update(clientId, companyId, { name: 'New Name' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    const companyId = 'company-123';
    const clientId = 'client-123';

    it('should successfully delete a client', async () => {
      const existingClient = {
        id: clientId,
        companyId,
        name: 'Acme Corporation',
        type: ClientType.COMMERCIAL,
      };

      mockPrismaService.client.findUnique.mockResolvedValue(existingClient);
      mockPrismaService.client.delete.mockResolvedValue(existingClient);

      const result = await service.remove(clientId, companyId);

      expect(result).toEqual({ message: 'Client deleted successfully' });
      expect(mockPrismaService.client.delete).toHaveBeenCalledWith({
        where: { id: clientId },
      });
    });

    it('should throw NotFoundException if client not found', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);

      await expect(service.remove(clientId, companyId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if client belongs to different company', async () => {
      const existingClient = {
        id: clientId,
        companyId: 'different-company',
      };

      mockPrismaService.client.findUnique.mockResolvedValue(existingClient);

      await expect(service.remove(clientId, companyId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
