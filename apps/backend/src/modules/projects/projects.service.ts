import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, createProjectDto: CreateProjectDto) {
    // Verify client belongs to company
    const client = await this.prisma.client.findUnique({
      where: { id: createProjectDto.clientId },
    });

    if (!client || client.companyId !== companyId) {
      throw new ForbiddenException('Client not found or does not belong to your company');
    }

    // Convert budget/cost to Decimal if provided
    const data: any = { ...createProjectDto };
    if (data.estimatedBudget !== undefined) {
      data.estimatedBudget = new Decimal(data.estimatedBudget);
    }
    if (data.actualCost !== undefined) {
      data.actualCost = new Decimal(data.actualCost);
    }

    // Convert date strings to Date objects
    if (data.startDate) {
      data.startDate = new Date(data.startDate);
    }
    if (data.estimatedCompletionDate) {
      data.estimatedCompletionDate = new Date(data.estimatedCompletionDate);
    }
    if (data.actualCompletionDate) {
      data.actualCompletionDate = new Date(data.actualCompletionDate);
    }

    return this.prisma.project.create({
      data: {
        ...data,
        companyId,
      },
      include: {
        client: {
          include: {
            contacts: true,
          },
        },
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.project.findMany({
      where: { companyId },
      include: {
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, companyId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            contacts: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.companyId !== companyId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async update(id: string, companyId: string, updateProjectDto: UpdateProjectDto) {
    // Verify project belongs to company
    const project = await this.findOne(id, companyId);

    // If updating client, verify new client belongs to company
    if (updateProjectDto.clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: updateProjectDto.clientId },
      });

      if (!client || client.companyId !== companyId) {
        throw new ForbiddenException('Client not found or does not belong to your company');
      }
    }

    // Convert budget/cost to Decimal if provided
    const data: any = { ...updateProjectDto };
    if (data.estimatedBudget !== undefined) {
      data.estimatedBudget = new Decimal(data.estimatedBudget);
    }
    if (data.actualCost !== undefined) {
      data.actualCost = new Decimal(data.actualCost);
    }

    // Convert date strings to Date objects
    if (data.startDate) {
      data.startDate = new Date(data.startDate);
    }
    if (data.estimatedCompletionDate) {
      data.estimatedCompletionDate = new Date(data.estimatedCompletionDate);
    }
    if (data.actualCompletionDate) {
      data.actualCompletionDate = new Date(data.actualCompletionDate);
    }

    return this.prisma.project.update({
      where: { id },
      data,
      include: {
        client: {
          include: {
            contacts: true,
          },
        },
      },
    });
  }

  async remove(id: string, companyId: string) {
    // Verify project belongs to company
    await this.findOne(id, companyId);

    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }
}
