import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ClientType } from '@prisma/client';

describe('ClientsController', () => {
  let controller: ClientsController;

  const mockClientsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 'user-123',
      companyId: 'company-123',
      email: 'user@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: mockClientsService,
        },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const createDto = {
        name: 'Acme Corporation',
        type: ClientType.COMMERCIAL,
        street1: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'USA',
      };

      const mockResult = {
        id: 'client-123',
        companyId: 'company-123',
        ...createDto,
        street2: null,
        imageUrl: null,
        contacts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockClientsService.create.mockResolvedValue(mockResult);

      const result = await controller.create(mockRequest, createDto);

      expect(result).toEqual(mockResult);
      expect(mockClientsService.create).toHaveBeenCalledWith(
        'company-123',
        createDto,
      );
    });

    it('should create a client with contacts', async () => {
      const createDto = {
        name: 'Acme Corporation',
        type: ClientType.COMMERCIAL,
        street1: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'USA',
        contacts: [
          {
            name: 'John Doe',
            email: 'john@acme.com',
            phone: '555-0100',
            role: 'Project Manager',
            isPrimary: true,
          },
        ],
      };

      const mockResult = {
        id: 'client-123',
        companyId: 'company-123',
        ...createDto,
        contacts: createDto.contacts.map((c) => ({
          id: 'contact-123',
          clientId: 'client-123',
          ...c,
          imageUrl: null,
        })),
      };

      mockClientsService.create.mockResolvedValue(mockResult);

      const result = await controller.create(mockRequest, createDto);

      expect(result).toEqual(mockResult);
      expect(mockClientsService.create).toHaveBeenCalledWith(
        'company-123',
        createDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return all clients for the company', async () => {
      const mockClients = [
        {
          id: 'client-1',
          companyId: 'company-123',
          name: 'Acme Corporation',
          type: ClientType.COMMERCIAL,
          contacts: [],
        },
        {
          id: 'client-2',
          companyId: 'company-123',
          name: 'Smith Residence',
          type: ClientType.RESIDENTIAL,
          contacts: [],
        },
      ];

      mockClientsService.findAll.mockResolvedValue(mockClients);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual(mockClients);
      expect(mockClientsService.findAll).toHaveBeenCalledWith('company-123');
    });

    it('should return empty array if no clients exist', async () => {
      mockClientsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual([]);
      expect(mockClientsService.findAll).toHaveBeenCalledWith('company-123');
    });
  });

  describe('findOne', () => {
    it('should return a single client', async () => {
      const mockClient = {
        id: 'client-123',
        companyId: 'company-123',
        name: 'Acme Corporation',
        type: ClientType.COMMERCIAL,
        contacts: [
          {
            id: 'contact-123',
            clientId: 'client-123',
            name: 'John Doe',
            email: 'john@acme.com',
            phone: '555-0100',
          },
        ],
      };

      mockClientsService.findOne.mockResolvedValue(mockClient);

      const result = await controller.findOne(mockRequest, 'client-123');

      expect(result).toEqual(mockClient);
      expect(mockClientsService.findOne).toHaveBeenCalledWith(
        'client-123',
        'company-123',
      );
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const updateDto = {
        name: 'Updated Name',
        city: 'New City',
      };

      const mockUpdatedClient = {
        id: 'client-123',
        companyId: 'company-123',
        name: 'Updated Name',
        city: 'New City',
        type: ClientType.COMMERCIAL,
        contacts: [],
      };

      mockClientsService.update.mockResolvedValue(mockUpdatedClient);

      const result = await controller.update(
        mockRequest,
        'client-123',
        updateDto,
      );

      expect(result).toEqual(mockUpdatedClient);
      expect(mockClientsService.update).toHaveBeenCalledWith(
        'client-123',
        'company-123',
        updateDto,
      );
    });

    it('should update a client and replace contacts', async () => {
      const updateDto = {
        name: 'Updated Name',
        contacts: [
          {
            name: 'New Contact',
            email: 'new@example.com',
            phone: '555-9999',
          },
        ],
      };

      const mockUpdatedClient = {
        id: 'client-123',
        companyId: 'company-123',
        name: 'Updated Name',
        type: ClientType.COMMERCIAL,
        contacts: updateDto.contacts.map((c) => ({
          id: 'new-contact-123',
          clientId: 'client-123',
          ...c,
          imageUrl: null,
          role: null,
          isPrimary: false,
        })),
      };

      mockClientsService.update.mockResolvedValue(mockUpdatedClient);

      const result = await controller.update(
        mockRequest,
        'client-123',
        updateDto,
      );

      expect(result).toEqual(mockUpdatedClient);
      expect(mockClientsService.update).toHaveBeenCalledWith(
        'client-123',
        'company-123',
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a client', async () => {
      const mockResult = { message: 'Client deleted successfully' };

      mockClientsService.remove.mockResolvedValue(mockResult);

      const result = await controller.remove(mockRequest, 'client-123');

      expect(result).toEqual(mockResult);
      expect(mockClientsService.remove).toHaveBeenCalledWith(
        'client-123',
        'company-123',
      );
    });
  });
});
