import { Module } from '@nestjs/common';
import { ProjectModule } from './modules/project/project.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { AiModule } from './modules/ai/ai.module';
import { ExportController } from './modules/export/export.controller';
import { ExportService } from './modules/export/export.service';
import { ExportModule } from './modules/export/export.module';

@Module({
  imports: [ProjectModule, AuthModule, UsersModule, AiModule, ExportModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class v1Module {}
