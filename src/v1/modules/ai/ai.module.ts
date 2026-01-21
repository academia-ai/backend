import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from '../project/schemas/project.schema';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { GuardModule } from 'src/utils/common/guard/guard.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    GuardModule,
    UsersModule,
  ],
  exports: [AiService],
  providers: [AiService],
  controllers: [AiController],
})
export class AiModule {}
