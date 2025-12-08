import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const mockPrismaService = {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    client: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const companyId = 'company-123';
    const createDto = {
      clientId: 'client-123',
      name: 'Office Renovation',
      description: 'Complete office renovation project',
      status: ProjectStatus.PLANNED,
      street1: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'USA',
      startDate: '2024-01-15',
      estimatedCompletionDate: '2024-06-30',
      estimatedBudget: 50000,
    };

    it('should successfully create a project', async () => {
      const mockClient = {
        id: 'client-123',
        companyId,
      };

      const mockProject = {
        id: 'project-123',
        companyId,
        ...createDto,
        startDate: new Date(createDto.startDate),
        estimatedCompletionDate: new Date(createDto.estimatedCompletionDate),
        estimatedBudget: new Decimal(50000),
        actualCompletionDate: null,
        actualCost: null,
        client: mockClient,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.project.create.mockResolvedValue(mockProject);

      const result = await service.create(companyId, createDto);

      expect(result).toEqual(mockProject);
      expect(mockPrismaService.client.findUnique).toHaveBeenCalledWith({
        where: { id: 'client-123' },
      });
      expect(mockPrismaService.project.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyId,
          clientId: 'client-123',
          name: 'Office Renovation',
        }),
        include: {
          client: {
            include: {
              contacts: true,
            },
          },
        },
      });
    });

    it('should throw ForbiddenException if client belongs to different company', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue({
        id: 'client-123',
        companyId: 'different-company',
      });

      await expect(service.create(companyId, createDto)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.create(companyId, createDto)).rejects.toThrow(
        'Client not found or does not belong to your company',
      );
    });

    it('should throw ForbiddenException if client not found', async () => {
      mockPrismaService.client.findUnique.mockResolvedValue(null);

      await expect(service.create(companyId, createDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should handle projects with all optional fields', async () => {
      const minimalDto = {
        clientId: 'client-123',
        name: 'Minimal Project',
        street1: '456 Oak Ave',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62702',
        country: 'USA',
      };

      const mockClient = {
        id: 'client-123',
        companyId,
      };

      const mockProject = {
        id: 'project-456',
        companyId,
        ...minimalDto,
        description: null,
        status: ProjectStatus.PLANNED,
        imageUrl: null,
        street2: null,
        startDate: null,
        estimatedCompletionDate: null,
        actualCompletionDate: null,
        estimatedBudget: null,
        actualCost: null,
        client: mockClient,
      };

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.project.create.mockResolvedValue(mockProject);

      const result = await service.create(companyId, minimalDto);

      expect(result).toEqual(mockProject);
    });
  });

  describe('findAll', () => {
    const companyId = 'company-123';

    it('should return all projects for a company', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          companyId,
          name: 'Office Renovation',
          status: ProjectStatus.ACTIVE,
          client: {
            id: 'client-1',
            name: 'Acme Corp',
          },
        },
        {
          id: 'project-2',
          companyId,
          name: 'Warehouse Build',
          status: ProjectStatus.PLANNED,
          client: {
            id: 'client-2',
            name: 'BuildCo',
          },
        },
      ];

      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.findAll(companyId);

      expect(result).toEqual(mockProjects);
      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: { companyId },
        include: {
          client: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return empty array if no projects exist', async () => {
      mockPrismaService.project.findMany.mockResolvedValue([]);

      const result = await service.findAll(companyId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const companyId = 'company-123';
    const projectId = 'project-123';

    it('should return a project if found and belongs to company', async () => {
      const mockProject = {
        id: projectId,
        companyId,
        name: 'Office Renovation',
        status: ProjectStatus.ACTIVE,
        client: {
          id: 'client-123',
          name: 'Acme Corp',
          contacts: [],
        },
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.findOne(projectId, companyId);

      expect(result).toEqual(mockProject);
      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: projectId },
        include: {
          client: {
            include: {
              contacts: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.findOne(projectId, companyId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(projectId, companyId)).rejects.toThrow(
        'Project not found',
      );
    });

    it('should throw ForbiddenException if project belongs to different company', async () => {
      const mockProject = {
        id: projectId,
        companyId: 'different-company',
        name: 'Office Renovation',
        status: ProjectStatus.ACTIVE,
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

      await expect(service.findOne(projectId, companyId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.findOne(projectId, companyId)).rejects.toThrow(
        'You do not have access to this project',
      );
    });
  });

  describe('update', () => {
    const companyId = 'company-123';
    const projectId = 'project-123';

    it('should successfully update a project', async () => {
      const updateDto = {
        name: 'Updated Project Name',
        status: ProjectStatus.COMPLETED,
        actualCost: 48500,
      };

      const existingProject = {
        id: projectId,
        companyId,
        name: 'Old Name',
        status: ProjectStatus.ACTIVE,
      };

      const updatedProject = {
        ...existingProject,
        ...updateDto,
        actualCost: new Decimal(48500),
        client: {
          id: 'client-123',
          name: 'Acme Corp',
          contacts: [],
        },
      };

      mockPrismaService.project.findUnique.mockResolvedValue(existingProject);
      mockPrismaService.project.update.mockResolvedValue(updatedProject);

      const result = await service.update(projectId, companyId, updateDto);

      expect(result).toEqual(updatedProject);
      expect(mockPrismaService.project.update).toHaveBeenCalledWith({
        where: { id: projectId },
        data: expect.objectContaining({
          name: 'Updated Project Name',
          status: ProjectStatus.COMPLETED,
        }),
        include: {
          client: {
            include: {
              contacts: true,
            },
          },
        },
      });
    });

    it('should update project with new client', async () => {
      const updateDto = {
        clientId: 'new-client-123',
      };

      const existingProject = {
        id: projectId,
        companyId,
        clientId: 'old-client-123',
      };

      const newClient = {
        id: 'new-client-123',
        companyId,
      };

      const updatedProject = {
        ...existingProject,
        clientId: 'new-client-123',
        client: newClient,
      };

      mockPrismaService.project.findUnique.mockResolvedValue(existingProject);
      mockPrismaService.client.findUnique.mockResolvedValue(newClient);
      mockPrismaService.project.update.mockResolvedValue(updatedProject);

      const result = await service.update(projectId, companyId, updateDto);

      expect(result).toEqual(updatedProject);
      expect(mockPrismaService.client.findUnique).toHaveBeenCalledWith({
        where: { id: 'new-client-123' },
      });
    });

    it('should throw ForbiddenException when updating to client from different company', async () => {
      const updateDto = {
        clientId: 'new-client-123',
      };

      const existingProject = {
        id: projectId,
        companyId,
      };

      mockPrismaService.project.findUnique.mockResolvedValue(existingProject);
      mockPrismaService.client.findUnique.mockResolvedValue({
        id: 'new-client-123',
        companyId: 'different-company',
      });

      await expect(
        service.update(projectId, companyId, updateDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(
        service.update(projectId, companyId, { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if project belongs to different company', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue({
        id: projectId,
        companyId: 'different-company',
      });

      await expect(
        service.update(projectId, companyId, { name: 'New Name' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    const companyId = 'company-123';
    const projectId = 'project-123';

    it('should successfully delete a project', async () => {
      const existingProject = {
        id: projectId,
        companyId,
        name: 'Office Renovation',
        status: ProjectStatus.COMPLETED,
      };

      mockPrismaService.project.findUnique.mockResolvedValue(existingProject);
      mockPrismaService.project.delete.mockResolvedValue(existingProject);

      const result = await service.remove(projectId, companyId);

      expect(result).toEqual({ message: 'Project deleted successfully' });
      expect(mockPrismaService.project.delete).toHaveBeenCalledWith({
        where: { id: projectId },
      });
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.remove(projectId, companyId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if project belongs to different company', async () => {
      const existingProject = {
        id: projectId,
        companyId: 'different-company',
      };

      mockPrismaService.project.findUnique.mockResolvedValue(existingProject);

      await expect(service.remove(projectId, companyId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
