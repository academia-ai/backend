import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ExportService } from './export.service';

@ApiTags('Export')
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get(':id/docx')
  @ApiOperation({
    summary: 'Export project as DOCX',
    description: 'Generates and downloads a Word (DOCX) document for a project',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: '64f7b8c9a1e9c123456789ab',
  })
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
  @ApiResponse({
    status: 200,
    description: 'DOCX file generated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to generate document',
  })
  async exportProjectAsDocx(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.exportService.exportAsDoc(id);

    res.status(HttpStatus.OK);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  }

  @Get(':id/pdf')
  @ApiOperation({
    summary: 'Export project as PDF',
    description: 'Downloads a PDF document for a project',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: '64f7b8c9a1e9c123456789cc',
  })
  @ApiResponse({
    status: 200,
    description: 'DOCX file generated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to generate document',
  })
  async exportProjectAsPDF(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.exportService.exportAsPDF(id);

    res.status(HttpStatus.OK);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  }
}
