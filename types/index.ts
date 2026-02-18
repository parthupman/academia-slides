export interface PaperAnalysis {
  title: string;
  authors: string[];
  abstract: string;
  sections: PaperSection[];
  keywords: string[];
  figures: number;
  tables: number;
  references: number;
}

export interface PaperSection {
  heading: string;
  content: string;
  subsections?: PaperSection[];
  importance: 'high' | 'medium' | 'low';
}

export interface Slide {
  id: number;
  title: string;
  content: string[];
  notes?: string;
  layout: 'title' | 'content' | 'split' | 'image' | 'quote' | 'references';
  imageUrl?: string;
}

export interface Presentation {
  title: string;
  subtitle: string;
  author: string;
  slides: Slide[];
  theme: Theme;
  createdAt: string;
}

export type Theme = 'minimal' | 'modern' | 'academic' | 'dark' | 'vibrant';

export interface Template {
  name: string;
  description: string;
  theme: Theme;
  preview: string;
}

export interface UploadState {
  status: 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';
  progress: number;
  fileName?: string;
  error?: string;
}

export interface GenerateOptions {
  slideCount: number;
  theme: Theme;
  includeFigures: boolean;
  includeTables: boolean;
  focusAreas: string[];
  detailLevel: 'brief' | 'standard' | 'detailed';
}

export const THEMES: Template[] = [
  {
    name: 'Minimal',
    description: 'Clean, distraction-free design with ample white space',
    theme: 'minimal',
    preview: 'bg-white border-2 border-gray-200'
  },
  {
    name: 'Modern',
    description: 'Contemporary look with subtle gradients and modern typography',
    theme: 'modern',
    preview: 'bg-gradient-to-br from-blue-50 to-indigo-50'
  },
  {
    name: 'Academic',
    description: 'Traditional academic style with formal colors',
    theme: 'academic',
    preview: 'bg-slate-50 border border-slate-200'
  },
  {
    name: 'Dark',
    description: 'Sleek dark theme for dramatic presentations',
    theme: 'dark',
    preview: 'bg-slate-900 text-white'
  },
  {
    name: 'Vibrant',
    description: 'Bold colors for eye-catching presentations',
    theme: 'vibrant',
    preview: 'bg-gradient-to-br from-orange-400 to-pink-500'
  }
];
