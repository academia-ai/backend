import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum AIProjectStyle {
  FORMAL = 'FORMAL',
  INFORMAL = 'INFORMAL',
  TECHNICAL = 'TECHNICAL',
  NARRATIVE = 'NARRATIVE',
}

export class AIProjectdto {
  @ApiProperty({ example: 'Biogas production' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'FORMAL',
  })
  @IsEnum(AIProjectStyle)
  style: AIProjectStyle;

  @ApiProperty({ example: 'A project on biogas production methods' })
  @IsOptional()
  @IsString()
  desc: string;

  @ApiProperty({ example: 5 })
  @IsOptional()
  @IsNumber()
  chapNum: string;
}
