import { UserSettings } from '@/types/settings';
import { PaperMetadata, EnhancedSlide, PresentationConfig } from '@/types/enhanced';

// Enhanced paper analysis with figures, tables, citations
export async function analyzePaperEnhanced(
  text: string,
  settings: UserSettings
): Promise<PaperMetadata> {
  const provider = settings.provider;
  const prompt = `Analyze this research paper comprehensively. Extract ALL of the following:

1. Basic metadata: title, authors, affiliations, abstract, keywords
2. ALL figures with captions and descriptions
3. ALL tables with descriptions
4. ALL citations mentioned in text
5. Full reference list
6. Publication info (journal, conference, date, DOI)

Return JSON in this exact structure:
{
  "title": "string",
  "authors": ["Name 1", "Name 2"],
  "affiliations": ["University 1", "University 2"],
  "abstract": "string",
  "keywords": ["kw1", "kw2"],
  "publicationDate": "2024-01",
  "doi": "10.xxxx/xxxxx",
  "journal": "Journal Name",
  "figures": [
    {
      "id": "fig1",
      "page": 3,
      "caption": "Figure 1: Description",
      "type": "figure",
      "description": "Detailed description of what the figure shows"
    }
  ],
  "tables": [
    {
      "id": "tab1",
      "page": 5,
      "caption": "Table 1: Description",
      "type": "table",
      "description": "What the table contains"
    }
  ],
  "citations": [
    {
      "id": "cite1",
      "text": "(Smith et al., 2023)",
      "authors": ["Smith", "Jones"],
      "year": 2023,
      "title": "Paper Title",
      "journal": "Journal Name"
    }
  ],
  "references": [...],
  "wordCount": 5000,
  "pageCount": 10,
  "language": "en"
}

Paper text:
${text.slice(0, 20000)}`;

  let response: string;
  
  switch (provider) {
    case 'openai':
      response = await callOpenAIEnhanced(prompt, settings);
      break;
    case 'anthropic':
      response = await callAnthropicEnhanced(prompt, settings);
      break;
    case 'google':
      response = await callGeminiEnhanced(prompt, settings);
      break;
    default:
      throw new Error('Provider not supported for enhanced analysis');
  }

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid response format');
  
  return JSON.parse(jsonMatch[0]) as PaperMetadata;
}

// Generate comprehensive presentation structure
export async function generateEnhancedSlides(
  metadata: PaperMetadata,
  config: PresentationConfig,
  settings: UserSettings
): Promise<EnhancedSlide[]> {
  const provider = settings.provider;
  
  const prompt = `Create a professional academic presentation with ${config.slideCount} slides.

Paper: "${metadata.title}"
Abstract: ${metadata.abstract}
Sections: ${config.sections}
Audience: ${config.targetAudience}
Detail Level: ${config.detailLevel}

Generate slides with this structure for EACH slide:
{
  "id": 1,
  "title": "Slide Title",
  "content": ["Bullet 1", "Bullet 2", "Bullet 3"],
  "layout": "content|figure|table|comparison|diagram|section-divider",
  "notes": "Speaker notes - what to say",
  "speakerScript": "Exact script for presenter",
  "timing": 120,
  "citations": ["cite1"],
  "figure": { "id": "fig1", "caption": "..." }
}

Layout guidelines:
- Use "figure" layout for slides with figures
- Use "table" layout for data tables  
- Use "comparison" for comparing methods/results
- Use "diagram" for processes/flows
- Use "section-divider" between major sections
- Use "two-column" for side-by-side content

Make content:
- ${config.simplifyLanguage ? 'Simple and accessible' : 'Academic and detailed'}
- ${config.targetAudience === 'experts' ? 'Technical with jargon' : config.targetAudience === 'general' ? 'Accessible to general audience' : 'Balanced for mixed audience'}
- Include specific numbers and findings
- Connect ideas with transitions

Return JSON array of slides.`;

  let response: string;
  
  switch (provider) {
    case 'openai':
      response = await callOpenAIEnhanced(prompt, settings);
      break;
    case 'anthropic':
      response = await callAnthropicEnhanced(prompt, settings);
      break;
    case 'google':
      response = await callGeminiEnhanced(prompt, settings);
      break;
    default:
      throw new Error('Provider not supported');
  }

  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Invalid response format');
  
  const slides = JSON.parse(jsonMatch[0]) as EnhancedSlide[];
  return slides.map((s, i) => ({ ...s, id: i + 1 }));
}

// Generate speaker script for entire presentation
export async function generateFullScript(
  slides: EnhancedSlide[],
  metadata: PaperMetadata,
  settings: UserSettings
): Promise<string> {
  const prompt = `Create a complete presenter script for this academic presentation.

Paper: "${metadata.title}"
Authors: ${metadata.authors.join(', ')}

Slides:
${slides.map(s => `Slide ${s.id}: ${s.title}\n${s.content.join('\n')}`).join('\n\n')}

Generate a natural, engaging script that:
- Has smooth transitions between slides
- Explains technical concepts clearly
- Includes presenter cues [PAUSE], [POINT TO FIGURE], etc.
- Takes approximately ${slides.reduce((acc, s) => acc + (s.timing || 120), 0)} seconds total
- Sounds professional but conversational

Format as:
SLIDE 1: [Title]
Script: ...
Duration: 2 minutes

[Continue for all slides]`;

  let response: string;
  
  switch (settings.provider) {
    case 'openai':
      response = await callOpenAIEnhanced(prompt, settings);
      break;
    case 'anthropic':
      response = await callAnthropicEnhanced(prompt, settings);
      break;
    case 'google':
      response = await callGeminiEnhanced(prompt, settings);
      break;
    default:
      throw new Error('Provider not supported');
  }

  return response;
}

// AI Chat for slide refinement
export async function chatWithAI(
  message: string,
  context: {
    currentSlide?: EnhancedSlide;
    allSlides: EnhancedSlide[];
    metadata: PaperMetadata;
  },
  settings: UserSettings
): Promise<{
  reply: string;
  action?: {
    type: string;
    target?: number;
    data?: unknown;
  };
}> {
  const prompt = `You are an expert presentation designer helping refine an academic presentation.

Paper: "${context.metadata.title}"
Current Slide: ${context.currentSlide ? `${context.currentSlide.id}: ${context.currentSlide.title}` : 'None selected'}
All Slides: ${context.allSlides.map(s => `${s.id}. ${s.title}`).join(', ')}

User request: "${message}"

Respond with:
1. A helpful, conversational reply
2. If the user wants changes, specify the action in JSON format

Possible actions:
- edit_slide: { target: slideId, data: { title?, content?, layout? } }
- add_slide: { data: newSlideObject }
- remove_slide: { target: slideId }
- reorder: { data: [newOrder] }
- change_theme: { data: themeName }

Return format:
Reply: [your conversational response]
Action: { action JSON or null }`;

  let response: string;
  
  switch (settings.provider) {
    case 'openai':
      response = await callOpenAIEnhanced(prompt, settings);
      break;
    case 'anthropic':
      response = await callAnthropicEnhanced(prompt, settings);
      break;
    case 'google':
      response = await callGeminiEnhanced(prompt, settings);
      break;
    default:
      throw new Error('Provider not supported');
  }

  const replyMatch = response.match(/Reply:\s*([\s\S]*?)(?=Action:|$)/);
  const actionMatch = response.match(/Action:\s*(\{[\s\S]*\}|null)/);
  
  return {
    reply: replyMatch ? replyMatch[1].trim() : response,
    action: actionMatch && actionMatch[1] !== 'null' ? JSON.parse(actionMatch[1]) : undefined
  };
}

// Simplify complex content
export async function simplifyContent(
  content: string,
  targetLevel: 'general' | 'students' | 'experts',
  settings: UserSettings
): Promise<string> {
  const prompt = `Simplify this academic content for a ${targetLevel} audience:

"${content}"

Make it:
${targetLevel === 'general' ? '- Accessible to non-experts\n- Remove jargon\n- Use analogies' : targetLevel === 'students' ? '- Educational tone\n- Define technical terms\n- Clear explanations' : '- Technical but concise\n- Precise terminology\n- Efficient communication'}

Return the simplified text only.`;

  let response: string;
  
  switch (settings.provider) {
    case 'openai':
      response = await callOpenAIEnhanced(prompt, settings);
      break;
    case 'anthropic':
      response = await callAnthropicEnhanced(prompt, settings);
      break;
    case 'google':
      response = await callGeminiEnhanced(prompt, settings);
      break;
    default:
      throw new Error('Provider not supported');
  }

  return response.trim();
}

// Generate Q&A slide
export async function generateQASlides(
  metadata: PaperMetadata,
  slides: EnhancedSlide[],
  count: number,
  settings: UserSettings
): Promise<EnhancedSlide[]> {
  const prompt = `Generate ${count} likely Q&A slides for this presentation.

Paper: "${metadata.title}"
Abstract: ${metadata.abstract}

Based on typical conference Q&A, generate questions and answers.

Return JSON array:
[{
  "id": 1,
  "title": "Q: Question text?",
  "content": ["A: Detailed answer..."],
  "layout": "content",
  "notes": "Why this question matters"
}]`;

  let response: string;
  
  switch (settings.provider) {
    case 'openai':
      response = await callOpenAIEnhanced(prompt, settings);
      break;
    case 'anthropic':
      response = await callAnthropicEnhanced(prompt, settings);
      break;
    case 'google':
      response = await callGeminiEnhanced(prompt, settings);
      break;
    default:
      throw new Error('Provider not supported');
  }

  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Invalid response format');
  
  return JSON.parse(jsonMatch[0]) as EnhancedSlide[];
}

// Helper functions for different providers
async function callOpenAIEnhanced(prompt: string, settings: UserSettings): Promise<string> {
  const { default: OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey: settings.apiKey });
  
  const response = await openai.chat.completions.create({
    model: settings.model || 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an expert academic presentation designer and analyst.' },
      { role: 'user', content: prompt }
    ],
    temperature: settings.temperature || 0.3,
    max_tokens: settings.maxTokens || 4000,
  });
  
  return response.choices[0]?.message?.content || '';
}

async function callAnthropicEnhanced(prompt: string, settings: UserSettings): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: settings.model || 'claude-3-5-sonnet-20241022',
      max_tokens: settings.maxTokens || 4000,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  if (!response.ok) throw new Error('Anthropic API error');
  const data = await response.json();
  return data.content?.[0]?.text || '';
}

async function callGeminiEnhanced(prompt: string, settings: UserSettings): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${settings.model || 'gemini-1.5-pro'}:generateContent?key=${settings.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      })
    }
  );
  
  if (!response.ok) throw new Error('Gemini API error');
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
