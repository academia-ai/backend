import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Document, Paragraph, TextRun, Packer } from 'docx';
import PDFDocument from 'pdfkit';
import { Project, ProjectDocument } from '../project/schemas/project.schema';

@Injectable()
export class ExportService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  private safeContent(
    value?: { content?: string },
    fallback = 'Content not available.',
  ): string {
    return value?.content?.trim() || fallback;
  }

  // ---------------- DOCX EXPORT ----------------
  async exportAsDoc(id: string): Promise<{ buffer: Buffer; filename: string }> {
    const project = await this.projectModel.findById(id).lean();
    if (!project) throw new NotFoundException('Project not found');

    const paragraphs: Paragraph[] = [];

    // ---------- TITLE PAGE ----------
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: project.title, bold: true, size: 48 })],
        spacing: { after: 600 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'AN UNDERGRADUATE PROJECT SUBMITTED IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF A BACHELOR’S DEGREE',
            size: 24,
          }),
        ],
        spacing: { after: 800 },
      }),
      new Paragraph({ pageBreakBefore: true }),
    );

    // ---------- FRONT MATTER ----------
    const frontMatter = [
      ['CERTIFICATION', project.certification],
      ['DECLARATION', project.declaration],
      ['DEDICATION', project.dedication],
      ['ACKNOWLEDGEMENT', project.acknowledgement],
      ['ABSTRACT', project.abstract],
    ];

    for (const [title, content] of frontMatter) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: title as string, bold: true, size: 32 }),
          ],
          spacing: { after: 300 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: this.safeContent(content as any), size: 24 }),
          ],
          spacing: { after: 600 },
        }),
        new Paragraph({ pageBreakBefore: true }),
      );
    }

    // ---------- CHAPTERS ----------
    project.chapters?.forEach((chapter, idx) => {
      const chapterNumber = idx + 1; // generate chapter number

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `CHAPTER ${chapterNumber}: ${chapter.title}`,
              bold: true,
              size: 32,
            }),
          ],
          spacing: { before: 400, after: 200 },
          pageBreakBefore: true,
        }),
      );

      chapter.sections?.forEach((section) => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: section.title, bold: true, size: 26 }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: section.content || '', size: 24 })],
            spacing: { after: 300 },
          }),
        );
      });
    });

    const doc = new Document({ sections: [{ children: paragraphs }] });
    const buffer = await Packer.toBuffer(doc);

    return {
      buffer,
      filename: `${project.title.replace(/[^a-zA-Z0-9]/g, '-')}.docx`,
    };
  }

  // ---------------- PDF EXPORT ----------------
  async exportAsPDF(id: string): Promise<{ buffer: Buffer; filename: string }> {
    const project = await this.projectModel.findById(id).lean();
    if (!project) throw new NotFoundException('Project not found');

    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));

    // ---------- TITLE PAGE ----------
    doc.fontSize(24).text(project.title, { align: 'center' });
    doc.moveDown(2);
    doc
      .fontSize(12)
      .text(
        'AN UNDERGRADUATE PROJECT SUBMITTED IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF A BACHELOR’S DEGREE',
        { align: 'center' },
      );
    doc.addPage();

    // ---------- FRONT MATTER ----------
    const frontMatter = [
      ['CERTIFICATION', project.certification],
      ['DECLARATION', project.declaration],
      ['DEDICATION', project.dedication],
      ['ACKNOWLEDGEMENT', project.acknowledgement],
      ['ABSTRACT', project.abstract],
    ];

    for (const [title, content] of frontMatter) {
      doc.fontSize(16).text(title as string, { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(this.safeContent(content as any));
      doc.addPage();
    }

    // ---------- CHAPTERS ----------
    project.chapters?.forEach((chapter, idx) => {
      const chapterNumber = idx + 1;

      // Chapter title on new page
      doc.addPage();
      doc.fontSize(16).text(`CHAPTER ${chapterNumber}: ${chapter.title}`, {
        underline: true,
      });
      doc.moveDown();

      chapter.sections?.forEach((section) => {
        doc.fontSize(14).text(section.title);
        doc.moveDown(0.3);
        doc.fontSize(12).text(section.content || '');
        doc.moveDown();
      });
    });

    doc.end();

    const buffer = await new Promise<Buffer>((resolve) =>
      doc.on('end', () => resolve(Buffer.concat(buffers))),
    );

    return {
      buffer,
      filename: `${project.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`,
    };
  }
}
