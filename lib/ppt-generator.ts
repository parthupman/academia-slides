import PptxGenJS from 'pptxgenjs';
import { Presentation, Slide, Theme } from '@/types';

interface ThemeColors {
  background: string;
  title: string;
  text: string;
  accent: string;
  secondary: string;
}

const THEME_COLORS: Record<Theme, ThemeColors> = {
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

export function generatePPTX(presentation: Presentation): Promise<Blob> {
  return new Promise((resolve) => {
    const pptx = new PptxGenJS();
    const colors = THEME_COLORS[presentation.theme];
    
    // Set presentation properties
    pptx.title = presentation.title;
    pptx.author = presentation.author;
    pptx.company = 'AcademiaSlides';
    pptx.subject = 'Academic Research Presentation';
    
    // Set layout
    pptx.layout = 'LAYOUT_16x9';
    
    // Define master slide
    pptx.defineSlideMaster({
      title: 'MASTER_SLIDE',
      background: { color: colors.background },
      objects: [
        {
          rect: { x: 0, y: 0, w: '100%', h: 0.15, fill: { color: colors.accent } }
        },
        {
          text: {
            text: 'AcademiaSlides',
            options: { x: 0.5, y: 7.2, w: 2, h: 0.3, fontSize: 10, color: colors.text }
          }
        }
      ]
    });
    
    // Generate each slide
    presentation.slides.forEach((slide, index) => {
      const pptSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
      
      switch (slide.layout) {
        case 'title':
          addTitleSlide(pptSlide, slide, colors);
          break;
        case 'content':
          addContentSlide(pptSlide, slide, colors);
          break;
        case 'split':
          addSplitSlide(pptSlide, slide, colors);
          break;
        case 'quote':
          addQuoteSlide(pptSlide, slide, colors);
          break;
        case 'references':
          addReferencesSlide(pptSlide, slide, colors);
          break;
        default:
          addContentSlide(pptSlide, slide, colors);
      }
      
      // Add slide number
      pptSlide.addText(String(index + 1), {
        x: 12.5,
        y: 7.2,
        w: 0.5,
        h: 0.3,
        fontSize: 10,
        color: colors.text,
        align: 'right'
      });
    });
    
    // Generate blob
    pptx.writeFile({ fileName: `${presentation.title.replace(/[^a-z0-9]/gi, '_')}.pptx` })
      .then(() => {
        // For browser environment, we need to use write instead
        pptx.write({ outputType: 'blob' }).then((blob) => {
          resolve(blob as Blob);
        });
      });
  });
}

function addTitleSlide(slide: PptxGenJS.Slide, content: Slide, colors: ThemeColors) {
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
  
  // Subtitle if exists
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
  
  // Author/Affiliation
  if (content.content[1]) {
    slide.addText(content.content[1], {
      x: 1,
      y: 5.2,
      w: 11,
      h: 0.6,
      fontSize: 16,
      color: colors.text,
      align: 'center',
      fontFace: 'Arial'
    });
  }
  
  // Decorative element
  slide.addShape(PptxGenJS.ShapeType.rect, {
    x: 4.5,
    y: 1.5,
    w: 4,
    h: 0.08,
    fill: { color: colors.accent }
  });
}

function addContentSlide(slide: PptxGenJS.Slide, content: Slide, colors: ThemeColors) {
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
  const bulletPoints = content.content.map(item => ({
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
}

function addSplitSlide(slide: PptxGenJS.Slide, content: Slide, colors: ThemeColors) {
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
  
  // Split content
  const mid = Math.ceil(content.content.length / 2);
  const leftContent = content.content.slice(0, mid);
  const rightContent = content.content.slice(mid);
  
  // Left side
  slide.addText(leftContent.map(item => ({
    text: item,
    options: { fontSize: 16, color: colors.text, breakLine: true }
  })), {
    x: 0.75,
    y: 1.6,
    w: 5.5,
    h: 5,
    bullet: true,
    lineSpacing: 28,
    fontFace: 'Arial'
  });
  
  // Divider
  slide.addShape(PptxGenJS.ShapeType.line, {
    x: 6.5,
    y: 1.5,
    w: 0,
    h: 5,
    line: { color: colors.secondary, width: 2 }
  });
  
  // Right side
  slide.addText(rightContent.map(item => ({
    text: item,
    options: { fontSize: 16, color: colors.text, breakLine: true }
  })), {
    x: 6.75,
    y: 1.6,
    w: 5.5,
    h: 5,
    bullet: true,
    lineSpacing: 28,
    fontFace: 'Arial'
  });
}

function addQuoteSlide(slide: PptxGenJS.Slide, content: Slide, colors: ThemeColors) {
  // Quote mark
  slide.addText('"', {
    x: 1,
    y: 2,
    w: 1,
    h: 1,
    fontSize: 72,
    color: colors.accent,
    fontFace: 'Georgia'
  });
  
  // Quote text
  const quoteText = content.content[0] || content.title;
  slide.addText(quoteText, {
    x: 1.5,
    y: 2.2,
    w: 10,
    h: 2.5,
    fontSize: 24,
    color: colors.title,
    italic: true,
    align: 'center',
    fontFace: 'Georgia'
  });
  
  // Attribution
  if (content.content[1]) {
    slide.addText(content.content[1], {
      x: 1,
      y: 5,
      w: 11,
      h: 0.5,
      fontSize: 16,
      color: colors.text,
      align: 'right',
      fontFace: 'Arial'
    });
  }
}

function addReferencesSlide(slide: PptxGenJS.Slide, content: Slide, colors: ThemeColors) {
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
  
  // References in smaller font
  slide.addText(content.content.map(item => ({
    text: item,
    options: { fontSize: 14, color: colors.text, breakLine: true }
  })), {
    x: 0.75,
    y: 1.6,
    w: 11.5,
    h: 5.5,
    bullet: true,
    lineSpacing: 24,
    fontFace: 'Arial'
  });
}

export function downloadPPTX(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
