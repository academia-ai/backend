import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AIProjectdto, AIProjectStyle } from './dto/ai.dto';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly ai: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateProject(aiProjectdto: AIProjectdto) {
    try {
      const { title, style, desc, chapNum } = aiProjectdto;

      if (!title || !style || !chapNum) {
        throw new BadRequestException('Please provide all required fields');
      }

      const prompt = `
You are a senior university project writer and academic researcher.

Generate a COMPLETE undergraduate final year project that strictly follows Nigerian university standards.

========================
PROJECT DETAILS
========================
Title: ${title}
Writing Style: ${style}
Number of Chapters: ${chapNum}
Extra Description: ${desc || 'N/A'}

========================
STRICT OUTPUT RULES
========================
1. Respond ONLY with valid JSON
2. Use double quotes for ALL keys and values
3. No markdown, no explanations, no comments
4. No trailing commas
5. Content must be DETAILED and ACADEMIC
6. Each section content must be MULTIPLE PARAGRAPHS (minimum 120–200 words per section)


CHAPTER TITLE RULES (MANDATORY):
- Chapter 1 title MUST be "Introduction"
- Chapter 2 title MUST be "Literature Review"
- Chapter 3 title MUST be "Methodology"
- Chapter 4 title MUST be "Results and Discussion"
- Chapter 5 title MUST be "Conclusion and Recommendations"

If Number of Chapters > 5:
- Chapter 6+ titles must be logical academic extensions (e.g. System Design, Implementation, Evaluation)

Each chapter title MUST be UNIQUE.
Repeated chapter titles are INVALID.


========================
JSON STRUCTURE (MUST MATCH EXACTLY)
========================
{
  "title": "",
  "desc": "",
  "certification": {
    "content": "",
    "supervisorName": "",
    "hodName": ""
  },
  "declaration": {
    "content": ""
  },
  "dedication": {
    "content": ""
  },
  "acknowledgement": {
    "content": ""
  },
  "abstract": {
    "content": ""
  },
  "tableOfContents": [
    { "title": "", "pageNumber": 1 }
  ],
 "chapters": [
  {
    "chapter_number": 1,
    "title": "",
    "desc": "",
    "sections": [
      {
        "title": "",
        "content": ""
      }
    ]
  }
  // Repeat this chapter object until chapter_number = ${chapNum}
]

    }
  ]
}

CONTENT GUIDELINES (MANDATORY):
- certification.content must be at least 120 words
- declaration.content must be at least 100 words
- dedication.content must be at least 30 words
- acknowledgement.content must be at least 120 words
- abstract.content must be 250–350 words
- desc must be 150–250 words

IMPORTANT:
- NO front-matter field may be empty
- Empty strings are NOT allowed
- If any field is empty, the response is INVALID
t

Generate now.
`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      });

      const text = response.text;

      if (!text) {
        throw new InternalServerErrorException('AI returned empty response');
      }

      const project = this.extractJSONFromAIResponse(text);
      return { project: this.ensureFrontMatter(project) };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to generate project');
    }
  }

  private ensureFrontMatter(project: any) {
    const defaults = {
      certification:
        'This project has been examined and approved by the undersigned supervisor as meeting the requirements for the award of a Bachelor’s degree. The work was carried out under my supervision and is deemed fit for academic submission.',
      declaration:
        'I hereby declare that this project is the result of my own research and effort, except where references are duly acknowledged. This work has not been submitted to any institution for the award of any degree.',
      dedication:
        'This project is dedicated to my parents and loved ones for their unwavering support, encouragement, and prayers throughout the course of this academic journey.',
      acknowledgement:
        'The successful completion of this project would not have been possible without the guidance, encouragement, and support of many individuals. I sincerely appreciate my project supervisor, lecturers, family members, and friends for their invaluable contributions. Above all, I give glory to God for wisdom, strength, and grace.',
      abstract:
        project.desc?.trim() ||
        'This project presents a detailed study relevant to the chosen field of study.',
    };

    for (const key of Object.keys(defaults)) {
      // Replace if missing OR empty string
      if (
        !project[key] ||
        typeof project[key].content !== 'string' ||
        !project[key].content.trim()
      ) {
        project[key] = { content: defaults[key] };
      }
    }

    return project;
  }

  private extractJSONFromAIResponse(aiText: string) {
    try {
      let cleaned = aiText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/[“”]/g, '"')
        .replace(/,(\s*[}\]])/g, '$1')
        .trim();

      // Extract first valid JSON object
      let depth = 0;
      let start = -1;
      let end = -1;

      for (let i = 0; i < cleaned.length; i++) {
        if (cleaned[i] === '{') {
          if (depth === 0) start = i;
          depth++;
        } else if (cleaned[i] === '}') {
          depth--;
          if (depth === 0) {
            end = i + 1;
            break;
          }
        }
      }

      if (start === -1 || end === -1) {
        throw new Error('No complete JSON object found');
      }

      const jsonStr = cleaned.slice(start, end);
      return JSON.parse(jsonStr);
    } catch (err) {
      console.error('JSON PARSE FAILED');
      console.error(aiText);
      throw new Error('AI returned invalid JSON');
    }
  }

  async generateChapter(
    chapterTitle: string,
    chapterDesc: string,
    style: AIProjectStyle,
  ) {
    try {
      if (!chapterTitle) {
        throw new BadRequestException('Chapter title is required');
      }

      const prompt = `
You are a professional university project writer.

Write a FULL, DETAILED chapter suitable for a final year project.

Chapter Title: ${chapterTitle}
Chapter Description: ${chapterDesc}
Writing Style: ${style}

RULES:
- Minimum 1200 words
- Use clear academic language
- Include introduction, body, and conclusion
- Use subheadings naturally
- Plain text only (no markdown)
- Flow logically and academically

Begin writing now.
`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      });

      return {
        message: 'Chapter generated successfully',
        chapter: response.text,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to generate chapter');
    }
  }
}
