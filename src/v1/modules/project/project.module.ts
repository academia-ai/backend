import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schemas/project.schema';
import { GuardModule } from 'src/utils/common/guard/guard.module';
import { CloudinaryModule } from 'src/lib/cloudinary/cloudinary.module';
import { UsersModule } from 'src/users/users.module';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    GuardModule,
    CloudinaryModule,
    UsersModule,
    AiModule,
  ],
  providers: [ProjectService],
  controllers: [ProjectController],
  exports: [ProjectService, MongooseModule],
})
export class ProjectModule {}
