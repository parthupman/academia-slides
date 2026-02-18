import OpenAI from 'openai';
import { PaperAnalysis, Slide, GenerateOptions } from '@/types';

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  
  return new OpenAI({ apiKey });
}

export async function analyzePaper(text: string): Promise<PaperAnalysis> {
  const openai = getOpenAIClient();
  const truncatedText = text.slice(0, 15000); // Limit to avoid token limits
  
  const prompt = `You are an expert academic research assistant. Analyze the following research paper text and extract structured information.

Return a JSON object with this exact structure:
{
  "title": "Paper title",
  "authors": ["Author 1", "Author 2"],
  "abstract": "Complete abstract text",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "figures": 5,
  "tables": 3,
  "references": 25,
  "sections": [
    {
      "heading": "Introduction",
      "content": "Brief summary of this section's key points",
      "importance": "high",
      "subsections": []
    }
  ]
}

Sections should include: Introduction, Literature Review, Methodology, Results, Discussion, Conclusion (or whatever sections actually exist).
Mark importance based on: "high" for core contributions/methodology/results, "medium" for background/discussion, "low" for supplementary info.

Paper text:
${truncatedText}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert academic paper analyzer. Always return valid JSON.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content || '{}';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }

  return JSON.parse(jsonMatch[0]) as PaperAnalysis;
}

export async function generateSlides(
  analysis: PaperAnalysis,
  options: GenerateOptions
): Promise<Slide[]> {
  const openai = getOpenAIClient();
  const { slideCount, detailLevel, focusAreas } = options;
  
  const prompt = `Create a professional academic presentation outline based on this paper analysis.

Paper Title: ${analysis.title}
Abstract: ${analysis.abstract}
Sections: ${analysis.sections.map(s => s.heading).join(', ')}

Generate ${slideCount} slides following academic presentation best practices:

Slide Structure Rules:
1. Slide 1: Title slide with paper title, authors, and institution placeholder
2. Slide 2: Overview/Outline
3. Use 30-40% for Introduction + Literature Review
4. Use 30-40% for Methodology
5. Use 20-30% for Results
6. Use 10-20% for Discussion/Conclusion/Future Work

Detail Level: ${detailLevel}
${focusAreas.length > 0 ? `Focus Areas: ${focusAreas.join(', ')}` : ''}

Return a JSON array of slides with this structure:
[
  {
    "id": 1,
    "title": "Slide Title",
    "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
    "layout": "title" | "content" | "split" | "image" | "quote" | "references",
    "notes": "Speaker notes for this slide"
  }
]

Guidelines:
- Keep bullet points concise (1-2 lines each)
- Maximum 5-6 bullet points per slide
- Use "title" layout for title slide
- Use "content" for most slides
- Use "split" for comparison content
- Use "quote" for highlighting key findings
- Use "references" for final reference slide
- Make titles descriptive and engaging
- Include specific data/numbers when available
- Use action verbs and active voice`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert academic presentation designer. Create clear, concise, and visually structured slides. Always return valid JSON.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.4,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content || '[]';
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  
  if (!jsonMatch) {
    throw new Error('Failed to parse slide generation response');
  }

  const slides = JSON.parse(jsonMatch[0]) as Slide[];
  
  // Ensure proper slide numbering
  return slides.map((slide, index) => ({
    ...slide,
    id: index + 1
  }));
}

export function estimateSlides(paperText: string): { min: number; max: number; recommended: number } {
  const wordCount = paperText.split(/\s+/).length;
  
  // Rough estimation: 100 words ≈ 1 slide for academic presentations
  const estimatedSlides = Math.ceil(wordCount / 150);
  
  return {
    min: Math.max(5, Math.floor(estimatedSlides * 0.5)),
    max: Math.min(50, Math.ceil(estimatedSlides * 1.5)),
    recommended: Math.min(30, Math.max(10, estimatedSlides))
  };
}
