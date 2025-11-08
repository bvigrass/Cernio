import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectStatus } from '@prisma/client';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  const mockProjectsService = {
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
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new project', async () => {
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

      const mockResult = {
        id: 'project-123',
        companyId: 'company-123',
        ...createDto,
        startDate: new Date(createDto.startDate),
        estimatedCompletionDate: new Date(createDto.estimatedCompletionDate),
        client: {
          id: 'client-123',
          name: 'Acme Corp',
          contacts: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProjectsService.create.mockResolvedValue(mockResult);

      const result = await controller.create(mockRequest, createDto);

      expect(result).toEqual(mockResult);
      expect(mockProjectsService.create).toHaveBeenCalledWith(
        'company-123',
        createDto,
      );
    });

    it('should create a minimal project', async () => {
      const createDto = {
        clientId: 'client-123',
        name: 'Minimal Project',
        street1: '456 Oak Ave',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62702',
        country: 'USA',
      };

      const mockResult = {
        id: 'project-456',
        companyId: 'company-123',
        ...createDto,
        description: null,
        status: ProjectStatus.PLANNED,
        street2: null,
        startDate: null,
        estimatedCompletionDate: null,
        actualCompletionDate: null,
        estimatedBudget: null,
        actualCost: null,
        client: {
          id: 'client-123',
          name: 'Acme Corp',
        },
      };

      mockProjectsService.create.mockResolvedValue(mockResult);

      const result = await controller.create(mockRequest, createDto);

      expect(result).toEqual(mockResult);
      expect(mockProjectsService.create).toHaveBeenCalledWith(
        'company-123',
        createDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return all projects for the company', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          companyId: 'company-123',
          name: 'Office Renovation',
          status: ProjectStatus.ACTIVE,
          client: {
            id: 'client-1',
            name: 'Acme Corp',
          },
        },
        {
          id: 'project-2',
          companyId: 'company-123',
          name: 'Warehouse Build',
          status: ProjectStatus.PLANNED,
          client: {
            id: 'client-2',
            name: 'BuildCo',
          },
        },
      ];

      mockProjectsService.findAll.mockResolvedValue(mockProjects);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual(mockProjects);
      expect(mockProjectsService.findAll).toHaveBeenCalledWith('company-123');
    });

    it('should return empty array if no projects exist', async () => {
      mockProjectsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual([]);
      expect(mockProjectsService.findAll).toHaveBeenCalledWith('company-123');
    });
  });

  describe('findOne', () => {
    it('should return a single project', async () => {
      const mockProject = {
        id: 'project-123',
        companyId: 'company-123',
        name: 'Office Renovation',
        status: ProjectStatus.ACTIVE,
        client: {
          id: 'client-123',
          name: 'Acme Corp',
          contacts: [
            {
              id: 'contact-123',
              name: 'John Doe',
              email: 'john@acme.com',
            },
          ],
        },
      };

      mockProjectsService.findOne.mockResolvedValue(mockProject);

      const result = await controller.findOne('project-123', mockRequest);

      expect(result).toEqual(mockProject);
      expect(mockProjectsService.findOne).toHaveBeenCalledWith(
        'project-123',
        'company-123',
      );
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateDto = {
        name: 'Updated Project Name',
        status: ProjectStatus.COMPLETED,
        actualCost: 48500,
      };

      const mockUpdatedProject = {
        id: 'project-123',
        companyId: 'company-123',
        name: 'Updated Project Name',
        status: ProjectStatus.COMPLETED,
        actualCost: 48500,
        client: {
          id: 'client-123',
          name: 'Acme Corp',
        },
      };

      mockProjectsService.update.mockResolvedValue(mockUpdatedProject);

      const result = await controller.update(
        'project-123',
        mockRequest,
        updateDto,
      );

      expect(result).toEqual(mockUpdatedProject);
      expect(mockProjectsService.update).toHaveBeenCalledWith(
        'project-123',
        'company-123',
        updateDto,
      );
    });

    it('should update project with new client', async () => {
      const updateDto = {
        clientId: 'new-client-123',
      };

      const mockUpdatedProject = {
        id: 'project-123',
        companyId: 'company-123',
        clientId: 'new-client-123',
        name: 'Office Renovation',
        client: {
          id: 'new-client-123',
          name: 'New Client Corp',
        },
      };

      mockProjectsService.update.mockResolvedValue(mockUpdatedProject);

      const result = await controller.update(
        'project-123',
        mockRequest,
        updateDto,
      );

      expect(result).toEqual(mockUpdatedProject);
      expect(mockProjectsService.update).toHaveBeenCalledWith(
        'project-123',
        'company-123',
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a project', async () => {
      const mockResult = { message: 'Project deleted successfully' };

      mockProjectsService.remove.mockResolvedValue(mockResult);

      const result = await controller.remove('project-123', mockRequest);

      expect(result).toEqual(mockResult);
      expect(mockProjectsService.remove).toHaveBeenCalledWith(
        'project-123',
        'company-123',
      );
    });
  });
});
