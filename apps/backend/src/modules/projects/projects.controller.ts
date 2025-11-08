import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Request() req: any, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(req.user.companyId, createProjectDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.projectsService.findAll(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, req.user.companyId, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.remove(id, req.user.companyId);
  }
}
