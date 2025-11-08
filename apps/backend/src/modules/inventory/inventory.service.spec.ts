import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryItemType, InventoryStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: PrismaService;

  const mockPrismaService = {
    inventoryItem: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const companyId = 'company-123';
    const createDto = {
      type: InventoryItemType.SALVAGE,
      name: 'Copper Wire',
      description: 'High-grade copper wire from demolition',
      quantity: 150,
      unit: 'lbs',
      status: InventoryStatus.EXTRACTED,
      condition: 'Good',
      estimatedValue: 450,
      storageLocation: 'Warehouse A',
    };

    it('should successfully create a salvage item', async () => {
      const mockItem = {
        id: 'item-123',
        companyId,
        ...createDto,
        quantity: new Decimal(150),
        estimatedValue: new Decimal(450),
        photos: [],
        project: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.inventoryItem.create.mockResolvedValue(mockItem);

      const result = await service.create(companyId, createDto);

      expect(result).toEqual(mockItem);
      expect(mockPrismaService.inventoryItem.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyId,
          type: InventoryItemType.SALVAGE,
          name: 'Copper Wire',
        }),
        include: {
          project: true,
          photos: true,
        },
      });
    });

    it('should create a material item with project', async () => {
      const projectId = 'project-123';
      const materialDto = {
        ...createDto,
        type: InventoryItemType.MATERIAL,
        projectId,
        supplier: 'BuildCo',
        purchaseCost: 200,
      };

      const mockProject = {
        id: projectId,
        companyId,
      };

      const mockItem = {
        id: 'item-456',
        companyId,
        ...materialDto,
        quantity: new Decimal(150),
        estimatedValue: new Decimal(450),
        purchaseCost: new Decimal(200),
        photos: [],
        project: mockProject,
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.inventoryItem.create.mockResolvedValue(mockItem);

      const result = await service.create(companyId, materialDto);

      expect(result).toEqual(mockItem);
      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: projectId },
      });
    });

    it('should throw ForbiddenException if project belongs to different company', async () => {
      const projectId = 'project-123';
      const dtoWithProject = {
        ...createDto,
        projectId,
      };

      mockPrismaService.project.findUnique.mockResolvedValue({
        id: projectId,
        companyId: 'different-company',
      });

      await expect(service.create(companyId, dtoWithProject)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if project not found', async () => {
      const projectId = 'nonexistent-project';
      const dtoWithProject = {
        ...createDto,
        projectId,
      };

      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.create(companyId, dtoWithProject)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    const companyId = 'company-123';

    it('should return all items for a company', async () => {
      const mockItems = [
        {
          id: 'item-1',
          companyId,
          type: InventoryItemType.SALVAGE,
          name: 'Copper Wire',
          photos: [],
          project: null,
        },
        {
          id: 'item-2',
          companyId,
          type: InventoryItemType.MATERIAL,
          name: 'Lumber',
          photos: [],
          project: null,
        },
      ];

      mockPrismaService.inventoryItem.findMany.mockResolvedValue(mockItems);

      const result = await service.findAll(companyId);

      expect(result).toEqual(mockItems);
      expect(mockPrismaService.inventoryItem.findMany).toHaveBeenCalledWith({
        where: { companyId },
        include: {
          project: true,
          photos: {
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should filter by type', async () => {
      const mockItems = [
        {
          id: 'item-1',
          companyId,
          type: InventoryItemType.SALVAGE,
          name: 'Copper Wire',
        },
      ];

      mockPrismaService.inventoryItem.findMany.mockResolvedValue(mockItems);

      await service.findAll(companyId, { type: 'SALVAGE' });

      expect(mockPrismaService.inventoryItem.findMany).toHaveBeenCalledWith({
        where: {
          companyId,
          type: 'SALVAGE',
        },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });

    it('should filter by status', async () => {
      await service.findAll(companyId, { status: 'AVAILABLE_FOR_SALE' });

      expect(mockPrismaService.inventoryItem.findMany).toHaveBeenCalledWith({
        where: {
          companyId,
          status: 'AVAILABLE_FOR_SALE',
        },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });

    it('should filter by projectId', async () => {
      const projectId = 'project-123';

      await service.findAll(companyId, { projectId });

      expect(mockPrismaService.inventoryItem.findMany).toHaveBeenCalledWith({
        where: {
          companyId,
          projectId,
        },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });

    it('should filter by multiple criteria', async () => {
      const projectId = 'project-123';

      await service.findAll(companyId, {
        type: 'MATERIAL',
        status: 'IN_STOCK',
        projectId,
      });

      expect(mockPrismaService.inventoryItem.findMany).toHaveBeenCalledWith({
        where: {
          companyId,
          type: 'MATERIAL',
          status: 'IN_STOCK',
          projectId,
        },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });
  });

  describe('findOne', () => {
    const companyId = 'company-123';
    const itemId = 'item-123';

    it('should return an item if found and belongs to company', async () => {
      const mockItem = {
        id: itemId,
        companyId,
        type: InventoryItemType.SALVAGE,
        name: 'Copper Wire',
        photos: [],
        project: null,
      };

      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(mockItem);

      const result = await service.findOne(itemId, companyId);

      expect(result).toEqual(mockItem);
      expect(mockPrismaService.inventoryItem.findUnique).toHaveBeenCalledWith({
        where: { id: itemId },
        include: {
          project: true,
          photos: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });
    });

    it('should throw NotFoundException if item not found', async () => {
      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(null);

      await expect(service.findOne(itemId, companyId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if item belongs to different company', async () => {
      const mockItem = {
        id: itemId,
        companyId: 'different-company',
        type: InventoryItemType.SALVAGE,
        name: 'Copper Wire',
      };

      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(mockItem);

      await expect(service.findOne(itemId, companyId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    const companyId = 'company-123';
    const itemId = 'item-123';

    it('should successfully update an item', async () => {
      const updateDto = {
        name: 'Updated Name',
        quantity: 200,
        status: InventoryStatus.SOLD,
      };

      const existingItem = {
        id: itemId,
        companyId,
        type: InventoryItemType.SALVAGE,
        name: 'Old Name',
      };

      const updatedItem = {
        ...existingItem,
        ...updateDto,
        quantity: new Decimal(200),
      };

      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(existingItem);
      mockPrismaService.inventoryItem.update.mockResolvedValue(updatedItem);

      const result = await service.update(itemId, companyId, updateDto);

      expect(result).toEqual(updatedItem);
      expect(mockPrismaService.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: itemId },
        data: expect.objectContaining({
          name: 'Updated Name',
          status: InventoryStatus.SOLD,
        }),
        include: {
          project: true,
          photos: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });
    });

    it('should throw NotFoundException if item not found', async () => {
      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(null);

      await expect(
        service.update(itemId, companyId, { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when updating projectId to project from different company', async () => {
      const existingItem = {
        id: itemId,
        companyId,
      };

      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(existingItem);
      mockPrismaService.project.findUnique.mockResolvedValue({
        id: 'project-123',
        companyId: 'different-company',
      });

      await expect(
        service.update(itemId, companyId, { projectId: 'project-123' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    const companyId = 'company-123';
    const itemId = 'item-123';

    it('should successfully delete an item', async () => {
      const existingItem = {
        id: itemId,
        companyId,
        type: InventoryItemType.SALVAGE,
        name: 'Copper Wire',
      };

      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(existingItem);
      mockPrismaService.inventoryItem.delete.mockResolvedValue(existingItem);

      const result = await service.remove(itemId, companyId);

      expect(result).toEqual({ message: 'Inventory item deleted successfully' });
      expect(mockPrismaService.inventoryItem.delete).toHaveBeenCalledWith({
        where: { id: itemId },
      });
    });

    it('should throw NotFoundException if item not found', async () => {
      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(null);

      await expect(service.remove(itemId, companyId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if item belongs to different company', async () => {
      const existingItem = {
        id: itemId,
        companyId: 'different-company',
      };

      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(existingItem);

      await expect(service.remove(itemId, companyId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
