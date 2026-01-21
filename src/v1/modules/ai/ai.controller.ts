import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from 'src/utils/common/guard';
import { AIProjectdto, AIProjectStyle } from './dto/ai.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('/project')
  @ApiOperation({ summary: 'Generate Project using AI' })
  generateProject(@Body() aiProjectdto: AIProjectdto) {
    return this.aiService.generateProject(aiProjectdto);
  }

  @Post('/chapter')
  @ApiOperation({ summary: 'Generate Chapters using AI' })
  generateChapter(
    @Body()
    chapterTitle: string,
    chapterDesc: string,
    style: AIProjectStyle,
  ) {
    return this.aiService.generateChapter(chapterTitle, chapterDesc, style);
  }
}
