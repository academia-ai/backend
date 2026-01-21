import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from '../schemas/project.schema';
import { ApiProperty } from '@nestjs/swagger';

export class SectionDto {
  @ApiProperty({ example: '1.1 Section Title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'This is the content of the section.' })
  @IsOptional()
  @IsString()
  content: string;
}

export class ChapterDto {
  @ApiProperty({
    description: 'Title of the chapter',
    example: 'Introduction to biogas',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Optional description of the chapter',
    example: 'This chapter covers basics.',
  })
  @IsOptional()
  @IsString()
  desc?: string;

  @ApiProperty({
    description: 'Sections inside the chapter',
    type: [SectionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections?: SectionDto[];
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Biogas production' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'A project on biogas production methods' })
  @IsNotEmpty()
  @IsString()
  desc: string;

  @IsOptional()
  @IsString()
  author: string;

  @ApiProperty({ example: 'http://example.com/logo.png' })
  @IsOptional()
  @IsString()
  logo: string;

  @ApiProperty({
    description: 'Registration number of the student',
    example: '2014326534',
  })
  @IsOptional()
  regNo?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({
    description: 'Chapters of the project',
    type: [ChapterDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChapterDto)
  chapters?: ChapterDto[];
}

export class UpdateProjectDto {
  @ApiProperty({ example: 'Biogas production' })
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({ example: 'A project on biogas production methods' })
  @IsOptional()
  @IsString()
  desc: string;

  @IsOptional()
  @IsString()
  author: string;

  @ApiProperty({ example: 'http://example.com/logo.png' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({
    description: 'Registration number of the student',
    example: '2014326534',
  })
  @IsOptional()
  regNo?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({
    description: 'Chapters of the project',
    type: [ChapterDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChapterDto)
  chapters?: ChapterDto[];
}
