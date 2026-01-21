// src/projects/schemas/project.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

export type ProjectDocument = HydratedDocument<Project>;

// =====================
// Section Subdocument
// =====================
@Schema({ _id: false })
export class Section {
  @ApiProperty({ example: '1.1 Background of the Study' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ example: 'This section explains the background...' })
  @Prop({ default: '' })
  content: string;
}

export const SectionSchema = SchemaFactory.createForClass(Section);

// =====================
// Chapter Subdocument
// =====================
@Schema({ _id: false })
export class Chapter {
  @ApiProperty({ example: 1 })
  @Prop()
  chapter_number?: number;

  @ApiProperty({ example: 'Introduction' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ example: 'This chapter introduces the study' })
  @Prop({ default: '' })
  desc?: string;

  @ApiProperty({ type: [Section] })
  @Prop({ type: [SectionSchema], default: [] })
  sections: Section[];
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);

// =====================
// Front Matter Schemas
// =====================
@Schema({ _id: false })
export class Certification {
  @ApiProperty({ example: 'This project has been approved...' })
  @Prop({ default: '' })
  content: string;

  @ApiProperty({ example: 'Dr. John Doe' })
  @Prop()
  supervisorName?: string;

  @ApiProperty({ example: 'Head of Department' })
  @Prop()
  hodName?: string;
}

export const CertificationSchema = SchemaFactory.createForClass(Certification);

@Schema({ _id: false })
export class Declaration {
  @ApiProperty({
    example:
      'I hereby declare that this project was carried out by me and has not been submitted elsewhere.',
  })
  @Prop({ default: '' })
  content: string;
}

export const DeclarationSchema = SchemaFactory.createForClass(Declaration);

@Schema({ _id: false })
export class Dedication {
  @ApiProperty({ example: 'This project is dedicated to my parents.' })
  @Prop({ default: '' })
  content: string;
}

export const DedicationSchema = SchemaFactory.createForClass(Dedication);

@Schema({ _id: false })
export class Acknowledgement {
  @ApiProperty({
    example:
      'I sincerely appreciate my supervisor and lecturers for their guidance.',
  })
  @Prop({ default: '' })
  content: string;
}

export const AcknowledgementSchema =
  SchemaFactory.createForClass(Acknowledgement);

@Schema({ _id: false })
export class Abstract {
  @ApiProperty({
    example:
      'This study investigates the production of biogas from organic waste...',
  })
  @Prop({ default: '' })
  content: string;
}

export const AbstractSchema = SchemaFactory.createForClass(Abstract);

// =====================
// Table of Contents
// =====================
@Schema({ _id: false })
export class TableOfContentItem {
  @ApiProperty({ example: 'Chapter One: Introduction' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ example: 1 })
  @Prop({ required: true })
  pageNumber: number;
}

export const TableOfContentItemSchema =
  SchemaFactory.createForClass(TableOfContentItem);

// =====================
// Project Main Schema
// =====================
export enum ProjectStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @ApiProperty({ example: 'Biogas Production' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ example: 'Using organic waste to generate energy' })
  @Prop({ default: '' })
  desc: string;

  @ApiProperty({ example: 'http://example.com/logo.png' })
  @Prop({ default: '' })
  logo: string;

  @ApiProperty({ example: 'Mazi Yusuf' })
  @Prop()
  author: string;

  @ApiProperty({ example: '2014326534' })
  @Prop()
  regNo: string;

  // -------- Front Matter --------
  @Prop({ type: CertificationSchema, default: {} })
  certification: Certification;

  @Prop({ type: DeclarationSchema, default: {} })
  declaration: Declaration;

  @Prop({ type: DedicationSchema, default: {} })
  dedication: Dedication;

  @Prop({ type: AcknowledgementSchema, default: {} })
  acknowledgement: Acknowledgement;

  @Prop({ type: AbstractSchema, default: {} })
  abstract: Abstract;

  @Prop({ type: [TableOfContentItemSchema], default: [] })
  tableOfContents: TableOfContentItem[];

  // -------- Chapters --------
  @Prop({ type: [ChapterSchema], default: [] })
  chapters: Chapter[];

  @ApiProperty({ enum: ProjectStatus })
  @Prop({ type: String, enum: ProjectStatus, default: ProjectStatus.PENDING })
  status: ProjectStatus;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
