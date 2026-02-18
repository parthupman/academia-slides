import { NextRequest, NextResponse } from 'next/server';
import { PaperAnalysis, GenerateOptions } from '@/types';
import { UserSettings } from '@/types/settings';
import { generateSlidesWithProvider } from '@/lib/ai-providers';
import PptxGenJS from 'pptxgenjs';

interface GenerateRequest {
  analysis: PaperAnalysis;
  options: GenerateOptions;
}

export async function POST(request: NextRequest) {
  try {
    // Get settings from headers
    const provider = request.headers.get('x-provider') as UserSettings['provider'] || 'openai';
    const apiKey = request.headers.get('x-api-key') || '';
    const model = request.headers.get('x-model') || 'gpt-4o-mini';
    
    const settings: UserSettings = {
      provider,
      apiKey,
      model,
      maxTokens: 4000,
      temperature: 0.3,
      saveLocally: false
    };
    
    // Check if API key is configured
    if (provider !== 'local' && !apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Please go to Settings to configure your AI provider.' },
        { status: 401 }
      );
    }

    const body: GenerateRequest = await request.json();
    const { analysis, options } = body;
    
    if (!analysis || !options) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate slides using selected provider
    let slides;
    try {
      slides = await generateSlidesWithProvider(analysis, options, settings);
    } catch (aiError) {
      console.error('❌ Slide generation error:', aiError);
      const errorMsg = aiError instanceof Error ? aiError.message : 'Generation failed';
      return NextResponse.json(
        { error: `Generation failed: ${errorMsg}` },
        { status: 500 }
      );
    }
    
    // Create presentation object
    const presentation = {
      title: analysis.title,
      subtitle: analysis.abstract.slice(0, 150) + '...',
      author: analysis.authors?.[0] || 'Unknown',
      slides,
      theme: options.theme,
      createdAt: new Date().toISOString()
    };
    
    // Generate PPTX
    const pptx = new PptxGenJS();
    const colors = getThemeColors(options.theme);
    
    // Set presentation properties
    pptx.title = presentation.title;
    pptx.author = presentation.author;
    pptx.company = 'AcademiaSlides';
    
    // Define master slide
    pptx.defineSlideMaster({
      title: 'MASTER_SLIDE',
      background: { color: colors.background },
      objects: [
        {
          rect: { x: 0, y: 0, w: '100%', h: 0.15, fill: { color: colors.accent } }
        }
      ]
    });
    
    // Generate slides
    slides.forEach((slide, index) => {
      const pptSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
      addSlideContent(pptSlide, slide, colors, index + 1);
    });
    
    // Generate buffer
    const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;
    
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${analysis.title.replace(/[^a-z0-9]/gi, '_')}.pptx"`
      }
    });
    
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate presentation. Please try again.' },
      { status: 500 }
    );
  }
}

function getThemeColors(theme: string) {
  const themes: Record<string, { background: string; title: string; text: string; accent: string; secondary: string }> = {
    minimal: {
      background: 'FFFFFF',
      title: '1a1a1a',
      text: '333333',
      accent: '2563eb',
      secondary: 'f3f4f6'
    },
    modern: {
      background: 'f8fafc',
      title: '1e293b',
      text: '475569',
      accent: '6366f1',
      secondary: 'e2e8f0'
    },
    academic: {
      background: 'fafaf9',
      title: '292524',
      text: '57534e',
      accent: '0369a1',
      secondary: 'e7e5e4'
    },
    dark: {
      background: '0f172a',
      title: 'f8fafc',
      text: 'cbd5e1',
      accent: '38bdf8',
      secondary: '1e293b'
    },
    vibrant: {
      background: 'fff7ed',
      title: '7c2d12',
      text: '9a3412',
      accent: 'ea580c',
      secondary: 'ffedd5'
    }
  };
  
  return themes[theme] || themes.minimal;
}

interface SlideContent {
  layout: string;
  title: string;
  content: string[];
}

interface ThemeColors {
  background: string;
  title: string;
  text: string;
  accent: string;
  secondary: string;
}

function addSlideContent(slide: PptxGenJS.Slide, content: SlideContent, colors: ThemeColors, slideNum: number) {
  // Add slide number
  slide.addText(String(slideNum), {
    x: 12.5,
    y: 7.2,
    w: 0.5,
    h: 0.3,
    fontSize: 10,
    color: colors.text,
    align: 'right'
  });
  
  switch (content.layout) {
    case 'title':
      // Title
      slide.addText(content.title, {
        x: 1,
        y: 2.5,
        w: 11,
        h: 1.5,
        fontSize: 36,
        bold: true,
        color: colors.title,
        align: 'center',
        fontFace: 'Arial'
      });
      
      // Subtitle
      if (content.content[0]) {
        slide.addText(content.content[0], {
          x: 1,
          y: 4.2,
          w: 11,
          h: 0.8,
          fontSize: 20,
          color: colors.text,
          align: 'center',
          fontFace: 'Arial'
        });
      }
      
      // Decorative line
      slide.addShape(PptxGenJS.ShapeType.rect, {
        x: 4.5,
        y: 1.5,
        w: 4,
        h: 0.08,
        fill: { color: colors.accent }
      });
      break;
      
    case 'content':
    default:
      // Title
      slide.addText(content.title, {
        x: 0.75,
        y: 0.5,
        w: 11.5,
        h: 0.8,
        fontSize: 28,
        bold: true,
        color: colors.title,
        fontFace: 'Arial'
      });
      
      // Underline
      slide.addShape(PptxGenJS.ShapeType.rect, {
        x: 0.75,
        y: 1.25,
        w: 2,
        h: 0.06,
        fill: { color: colors.accent }
      });
      
      // Content bullets
      const bulletPoints = content.content.map((item: string) => ({
        text: item,
        options: { fontSize: 18, color: colors.text, breakLine: true }
      }));
      
      slide.addText(bulletPoints, {
        x: 0.75,
        y: 1.6,
        w: 11.5,
        h: 5,
        bullet: true,
        lineSpacing: 32,
        fontFace: 'Arial'
      });
      break;
  }
}

export const runtime = 'nodejs';
export const maxDuration = 120;
