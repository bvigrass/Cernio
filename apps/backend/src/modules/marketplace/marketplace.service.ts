import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryItemType } from '@prisma/client';

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  async findAllSalvageItems() {
    // Public endpoint - return ALL salvage items with transparency about status
    return this.prisma.inventoryItem.findMany({
      where: {
        type: InventoryItemType.SALVAGE,
        // Show all salvage items regardless of status
        // Status will be displayed to buyers for transparency
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
        photos: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOneSalvageItem(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
        photos: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // Only allow viewing salvage items (show all statuses for transparency)
    if (item.type !== InventoryItemType.SALVAGE) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }
}
