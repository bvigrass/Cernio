import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(
    companyId: string,
    createInventoryItemDto: CreateInventoryItemDto,
  ) {
    // If projectId is provided, verify it belongs to company
    if (createInventoryItemDto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: createInventoryItemDto.projectId },
      });

      if (!project || project.companyId !== companyId) {
        throw new ForbiddenException(
          'Project not found or does not belong to your company',
        );
      }
    }

    // Convert numeric fields to Decimal
    const data: any = { ...createInventoryItemDto };
    if (data.quantity !== undefined) {
      data.quantity = new Decimal(data.quantity);
    }
    if (data.purchaseCost !== undefined) {
      data.purchaseCost = new Decimal(data.purchaseCost);
    }
    if (data.rentalRate !== undefined) {
      data.rentalRate = new Decimal(data.rentalRate);
    }
    if (data.estimatedValue !== undefined) {
      data.estimatedValue = new Decimal(data.estimatedValue);
    }
    if (data.reservePrice !== undefined) {
      data.reservePrice = new Decimal(data.reservePrice);
    }

    // Convert date strings to Date objects
    if (data.purchaseDate) {
      data.purchaseDate = new Date(data.purchaseDate);
    }
    if (data.maintenanceDate) {
      data.maintenanceDate = new Date(data.maintenanceDate);
    }

    return this.prisma.inventoryItem.create({
      data: {
        ...data,
        companyId,
      },
      include: {
        project: true,
        photos: true,
      },
    });
  }

  async findAll(
    companyId: string,
    filters?: { type?: string; status?: string; projectId?: string },
  ) {
    const where: any = { companyId };

    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    return this.prisma.inventoryItem.findMany({
      where,
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
  }

  async findOne(id: string, companyId: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        project: true,
        photos: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    if (item.companyId !== companyId) {
      throw new ForbiddenException(
        'You do not have access to this inventory item',
      );
    }

    return item;
  }

  async update(
    id: string,
    companyId: string,
    updateInventoryItemDto: UpdateInventoryItemDto,
  ) {
    // Verify item belongs to company
    await this.findOne(id, companyId);

    // If updating projectId, verify new project belongs to company
    if (updateInventoryItemDto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: updateInventoryItemDto.projectId },
      });

      if (!project || project.companyId !== companyId) {
        throw new ForbiddenException(
          'Project not found or does not belong to your company',
        );
      }
    }

    // Convert numeric fields to Decimal
    const data: any = { ...updateInventoryItemDto };
    if (data.quantity !== undefined) {
      data.quantity = new Decimal(data.quantity);
    }
    if (data.purchaseCost !== undefined) {
      data.purchaseCost = new Decimal(data.purchaseCost);
    }
    if (data.rentalRate !== undefined) {
      data.rentalRate = new Decimal(data.rentalRate);
    }
    if (data.estimatedValue !== undefined) {
      data.estimatedValue = new Decimal(data.estimatedValue);
    }
    if (data.reservePrice !== undefined) {
      data.reservePrice = new Decimal(data.reservePrice);
    }

    // Convert date strings to Date objects
    if (data.purchaseDate) {
      data.purchaseDate = new Date(data.purchaseDate);
    }
    if (data.maintenanceDate) {
      data.maintenanceDate = new Date(data.maintenanceDate);
    }

    return this.prisma.inventoryItem.update({
      where: { id },
      data,
      include: {
        project: true,
        photos: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  async remove(id: string, companyId: string) {
    // Verify item belongs to company
    await this.findOne(id, companyId);

    await this.prisma.inventoryItem.delete({
      where: { id },
    });

    return { message: 'Inventory item deleted successfully' };
  }
}
