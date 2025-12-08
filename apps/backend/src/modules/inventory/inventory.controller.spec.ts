import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryItemType, InventoryStatus } from '@prisma/client';

describe('InventoryController', () => {
  let controller: InventoryController;

  const mockInventoryService = {
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
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new inventory item', async () => {
      const createDto = {
        type: InventoryItemType.SALVAGE,
        name: 'Copper Wire',
        description: 'High-grade copper wire',
        quantity: 150,
        unit: 'lbs',
        status: InventoryStatus.EXTRACTED,
        condition: 'Good',
        estimatedValue: 450,
        storageLocation: 'Warehouse A',
      };

      const mockResult = {
        id: 'item-123',
        companyId: 'company-123',
        ...createDto,
        photos: [],
        project: null,
      };

      mockInventoryService.create.mockResolvedValue(mockResult);

      const result = await controller.create(mockRequest, createDto);

      expect(result).toEqual(mockResult);
      expect(mockInventoryService.create).toHaveBeenCalledWith(
        'company-123',
        createDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return all inventory items for the company', async () => {
      const mockItems = [
        {
          id: 'item-1',
          companyId: 'company-123',
          type: InventoryItemType.SALVAGE,
          name: 'Copper Wire',
        },
        {
          id: 'item-2',
          companyId: 'company-123',
          type: InventoryItemType.MATERIAL,
          name: 'Lumber',
        },
      ];

      mockInventoryService.findAll.mockResolvedValue(mockItems);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual(mockItems);
      expect(mockInventoryService.findAll).toHaveBeenCalledWith(
        'company-123',
        {},
      );
    });

    it('should filter by type', async () => {
      const mockItems = [
        {
          id: 'item-1',
          type: InventoryItemType.SALVAGE,
          name: 'Copper Wire',
        },
      ];

      mockInventoryService.findAll.mockResolvedValue(mockItems);

      const result = await controller.findAll(mockRequest, 'SALVAGE');

      expect(result).toEqual(mockItems);
      expect(mockInventoryService.findAll).toHaveBeenCalledWith('company-123', {
        type: 'SALVAGE',
      });
    });

    it('should filter by status', async () => {
      const mockItems = [
        {
          id: 'item-1',
          status: InventoryStatus.AVAILABLE_FOR_SALE,
          name: 'Copper Wire',
        },
      ];

      mockInventoryService.findAll.mockResolvedValue(mockItems);

      const result = await controller.findAll(
        mockRequest,
        undefined,
        'AVAILABLE_FOR_SALE',
      );

      expect(result).toEqual(mockItems);
      expect(mockInventoryService.findAll).toHaveBeenCalledWith('company-123', {
        status: 'AVAILABLE_FOR_SALE',
      });
    });

    it('should filter by projectId', async () => {
      const mockItems = [
        {
          id: 'item-1',
          projectId: 'project-123',
          name: 'Materials',
        },
      ];

      mockInventoryService.findAll.mockResolvedValue(mockItems);

      const result = await controller.findAll(
        mockRequest,
        undefined,
        undefined,
        'project-123',
      );

      expect(result).toEqual(mockItems);
      expect(mockInventoryService.findAll).toHaveBeenCalledWith('company-123', {
        projectId: 'project-123',
      });
    });

    it('should filter by multiple criteria', async () => {
      const mockItems = [
        {
          id: 'item-1',
          type: InventoryItemType.MATERIAL,
          status: InventoryStatus.IN_STOCK,
          projectId: 'project-123',
        },
      ];

      mockInventoryService.findAll.mockResolvedValue(mockItems);

      const result = await controller.findAll(
        mockRequest,
        'MATERIAL',
        'IN_STOCK',
        'project-123',
      );

      expect(result).toEqual(mockItems);
      expect(mockInventoryService.findAll).toHaveBeenCalledWith('company-123', {
        type: 'MATERIAL',
        status: 'IN_STOCK',
        projectId: 'project-123',
      });
    });
  });

  describe('findOne', () => {
    it('should return a single inventory item', async () => {
      const mockItem = {
        id: 'item-123',
        companyId: 'company-123',
        type: InventoryItemType.SALVAGE,
        name: 'Copper Wire',
        photos: [],
        project: null,
      };

      mockInventoryService.findOne.mockResolvedValue(mockItem);

      const result = await controller.findOne('item-123', mockRequest);

      expect(result).toEqual(mockItem);
      expect(mockInventoryService.findOne).toHaveBeenCalledWith(
        'item-123',
        'company-123',
      );
    });
  });

  describe('update', () => {
    it('should update an inventory item', async () => {
      const updateDto = {
        name: 'Updated Name',
        quantity: 200,
        status: InventoryStatus.SOLD,
      };

      const mockUpdatedItem = {
        id: 'item-123',
        companyId: 'company-123',
        ...updateDto,
      };

      mockInventoryService.update.mockResolvedValue(mockUpdatedItem);

      const result = await controller.update(
        'item-123',
        mockRequest,
        updateDto,
      );

      expect(result).toEqual(mockUpdatedItem);
      expect(mockInventoryService.update).toHaveBeenCalledWith(
        'item-123',
        'company-123',
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete an inventory item', async () => {
      const mockResult = { message: 'Inventory item deleted successfully' };

      mockInventoryService.remove.mockResolvedValue(mockResult);

      const result = await controller.remove('item-123', mockRequest);

      expect(result).toEqual(mockResult);
      expect(mockInventoryService.remove).toHaveBeenCalledWith(
        'item-123',
        'company-123',
      );
    });
  });
});
