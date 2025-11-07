import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: any, @Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(req.user.companyId, createClientDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Request() req: any) {
    return this.clientsService.findAll(req.user.companyId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.findOne(id, req.user.companyId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, req.user.companyId, updateClientDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.remove(id, req.user.companyId);
  }
}
