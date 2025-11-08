import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Request() req: any, @Body() createInventoryItemDto: CreateInventoryItemDto) {
    return this.inventoryService.create(req.user.companyId, createInventoryItemDto);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.inventoryService.findAll(req.user.companyId, { type, status, projectId });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.inventoryService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() updateInventoryItemDto: UpdateInventoryItemDto) {
    return this.inventoryService.update(id, req.user.companyId, updateInventoryItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.inventoryService.remove(id, req.user.companyId);
  }
}
