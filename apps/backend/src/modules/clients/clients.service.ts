import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new client with optional contacts
   */
  async create(companyId: string, createClientDto: CreateClientDto) {
    const { contacts, ...clientData } = createClientDto;

    return this.prisma.client.create({
      data: {
        ...clientData,
        companyId,
        contacts: contacts
          ? {
              create: contacts,
            }
          : undefined,
      },
      include: {
        contacts: true,
      },
    });
  }

  /**
   * Get all clients for a company
   */
  async findAll(companyId: string) {
    return this.prisma.client.findMany({
      where: { companyId },
      include: {
        contacts: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get a single client by ID
   */
  async findOne(id: string, companyId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        contacts: true,
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    // Ensure the client belongs to the user's company
    if (client.companyId !== companyId) {
      throw new ForbiddenException('You do not have access to this client');
    }

    return client;
  }

  /**
   * Update a client and optionally its contacts
   */
  async update(id: string, companyId: string, updateClientDto: UpdateClientDto) {
    // First verify the client exists and belongs to the company
    await this.findOne(id, companyId);

    const { contacts, ...clientData } = updateClientDto;

    // If contacts are provided, replace all existing contacts
    if (contacts) {
      // Delete existing contacts and create new ones
      await this.prisma.clientContact.deleteMany({
        where: { clientId: id },
      });

      return this.prisma.client.update({
        where: { id },
        data: {
          ...clientData,
          contacts: {
            create: contacts as any,
          },
        },
        include: {
          contacts: true,
        },
      });
    }

    // Update client data only
    return this.prisma.client.update({
      where: { id },
      data: clientData,
      include: {
        contacts: true,
      },
    });
  }

  /**
   * Delete a client
   */
  async remove(id: string, companyId: string) {
    // First verify the client exists and belongs to the company
    await this.findOne(id, companyId);

    await this.prisma.client.delete({
      where: { id },
    });

    return { message: 'Client deleted successfully' };
  }
}
