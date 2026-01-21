import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto, UpdateProjectDto } from './dto/create.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { isValidObjectId, Model } from 'mongoose';
import { CloudinaryService } from 'src/lib/cloudinary/cloudinary.service';
import type { AuthUser } from 'src/users/types/user.type';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly cloudinaryConfig: CloudinaryService,
  ) {}

  async fetchAll(user: AuthUser, limits?: number, page?: number) {
    try {
      const limit = limits || 10;
      const pages = page || 1;
      const skip = (pages - 1) * limit;

      const project = await this.projectModel
        .find({ userId: user._id })
        .sort({ createdAt: -1 });

      if (!project) {
        throw new NotFoundException('Empty project');
      }

      const totalPage = this.projectModel.length / limit;

      return { totalPage, limits, pages, skip, project };
    } catch (error) {
      console.error(error);
      if (error instanceof Error)
        throw new InternalServerErrorException(error.message);
      throw new InternalServerErrorException('Failed to fetch projects');
    }
  }
  async fetchSingle(id: string) {
    try {
      if (!isValidObjectId(id)) {
        throw new NotFoundException('Invalid project ID');
      }

      const project = await this.projectModel.findById(id);

      if (!project) {
        throw new NotFoundException();
      }

      return project;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to find project');
    }
  }

  async createProject(
    projectDto: CreateProjectDto,
    user: AuthUser,
    file?: Express.Multer.File,
  ) {
    try {
      const { title, desc, regNo, chapters } = projectDto;

      if (!title || !desc) {
        throw new BadRequestException('Title and description are required');
      }

      let logo = '';

      // Upload only if file is provided
      if (file?.buffer) {
        const uploadResult = await this.cloudinaryConfig.uploadImage(
          file.buffer,
          'project_logos',
        );

        if (!uploadResult?.secure_url) {
          throw new BadRequestException('Image upload failed');
        }

        logo = uploadResult.secure_url;
      }

      const project = await this.projectModel.create({
        title,
        desc,
        regNo,
        logo, // empty string if not uploaded
        author: user.fullName ?? '',
        userId: user._id,
        chapters: chapters ?? [],
      });

      await this.userModel.updateOne(
        { _id: user._id },
        { $push: { projects: project._id } },
      );

      return {
        message: 'Project created successfully',
        project,
      };
    } catch (error) {
      console.error('Creating project error:', error);
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  async updateProject(
    id: string,
    projectDto: UpdateProjectDto,
    user: AuthUser,
  ) {
    try {
      const project = await this.projectModel.findById(id);

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (project.userId.toString() !== user._id.toString()) {
        throw new BadRequestException(
          'You are not authorized to update this project',
        );
      }

      const updatedProject = await this.projectModel.findByIdAndUpdate(
        id,
        projectDto,
        { new: true },
      );

      return { message: 'Project updated successfully', updatedProject };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to update project');
    }
  }

  async deleteProject(id: string, userId: string) {
    try {
      const project = await this.projectModel.findById(id);

      if (!project) {
        throw new NotFoundException('Project not found');
      }
      console.log('user id:', userId.toString());

      if (project.userId.toString() !== userId.toString()) {
        throw new BadRequestException(
          'You are not authorized to delete this project',
        );
      }

      await this.projectModel.findByIdAndDelete(id);

      return { message: 'Project deleted successful' };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to delete project');
    }
  }

  async searchProject(searchTerm: string) {
    try {
      const projects = await this.projectModel.find({
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { desc: { $regex: searchTerm, $options: 'i' } },
          { author: { $regex: searchTerm, $options: 'i' } },
        ],
      });

      if (!projects || projects.length === 0) {
        throw new NotFoundException('No projects found');
      }

      return projects;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to search projects');
    }
  }
}
