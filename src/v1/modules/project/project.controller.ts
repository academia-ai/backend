import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  // Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProjectDto, UpdateProjectDto } from './dto/create.dto';
import { UserDecorator } from 'src/utils/common/decorators';
// import { AuthUser } from 'src/users/types/user.type';
import type { AuthUser } from 'src/users/types/user.type';
import { JwtAuthGuard } from 'src/utils/common/guard/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard)
@ApiTags('Project')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch all projects' })
  fetchAll(
    @UserDecorator() user: AuthUser,
    @Query('limit') limit = '10',
    @Query('page') page = '1',
  ) {
    return this.projectService.fetchAll(user, Number(limit), Number(page));
  }
  @Get('/search')
  @ApiOperation({ summary: 'Search projects' })
  @ApiResponse({ status: 200, description: 'Projects returned successfully' })
  @ApiResponse({ status: 404, description: 'No projects found' })
  searchProject(@Query('searchTerm') searchTerm: string) {
    return this.projectService.searchProject(searchTerm);
  }

  @Get(':id')
  @ApiOperation({ summary: 'To fetch single project' })
  fetchSingle(@Param('id') id: string) {
    return this.projectService.fetchSingle(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  @ApiOperation({ summary: 'To create a new project' })
  createProject(
    @Body() projectDto: CreateProjectDto,
    @UserDecorator() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // console.log('Authenticated user:', user);
    return this.projectService.createProject(projectDto, user, file);
  }

  @Put(':id')
  @ApiOperation({ summary: 'To update projects' })
  updateProject(
    @Param('id') id: string,
    @Body() projectDto: UpdateProjectDto,
    @UserDecorator() user: AuthUser,
  ) {
    return this.projectService.updateProject(id, projectDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'To delete all Projects' })
  deleteProject(@Param('id') id: string, @UserDecorator() user: AuthUser) {
    return this.projectService.deleteProject(id, user._id);
  }
}
