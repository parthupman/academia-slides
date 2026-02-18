// Enhanced types for comprehensive PPT features

export interface ExtractedFigure {
  id: string;
  page: number;
  caption: string;
  type: 'figure' | 'table' | 'chart';
  description: string;
  placeholder?: string;
}

export interface ExtractedCitation {
  id: string;
  text: string;
  authors: string[];
  year: number;
  title?: string;
  journal?: string;
  doi?: string;
}

export interface PaperMetadata {
  title: string;
  authors: string[];
  affiliations: string[];
  abstract: string;
  keywords: string[];
  publicationDate?: string;
  doi?: string;
  journal?: string;
  conference?: string;
  figures: ExtractedFigure[];
  tables: ExtractedFigure[];
  citations: ExtractedCitation[];
  references: ExtractedCitation[];
  wordCount: number;
  pageCount: number;
  language: string;
}

export interface EnhancedSlide {
  id: number;
  title: string;
  content: string[];
  notes?: string;
  layout: SlideLayout;
  imageUrl?: string;
  figure?: ExtractedFigure;
  citations?: string[];
  speakerScript?: string;
  timing?: number; // estimated seconds
  animation?: AnimationType;
  subSlides?: EnhancedSlide[];
}

export type SlideLayout = 
  | 'title' 
  | 'content' 
  | 'split'
  | 'image'
  | 'quote'
  | 'references'
  | 'figure'
  | 'table'
  | 'chart'
  | 'comparison'
  | 'timeline'
  | 'diagram'
  | 'equation'
  | 'two-column'
  | 'three-column'
  | 'section-divider'
  | 'thank-you';

export type AnimationType = 
  | 'none'
  | 'fade'
  | 'slide'
  | 'zoom'
  | 'appear'
  | 'wipe';

export interface CitationStyle {
  id: 'apa' | 'mla' | 'chicago' | 'ieee' | 'harvard' | 'vancouver';
  name: string;
  description: string;
}

export const CITATION_STYLES: CitationStyle[] = [
  { id: 'apa', name: 'APA 7th Edition', description: 'American Psychological Association' },
  { id: 'mla', name: 'MLA 9th Edition', description: 'Modern Language Association' },
  { id: 'chicago', name: 'Chicago 17th Edition', description: 'Chicago Manual of Style' },
  { id: 'ieee', name: 'IEEE', description: 'Institute of Electrical and Electronics Engineers' },
  { id: 'harvard', name: 'Harvard', description: 'Harvard referencing style' },
  { id: 'vancouver', name: 'Vancouver', description: 'Vancouver referencing style' },
];

export interface PresentationConfig {
  title: string;
  subtitle: string;
  authors: string[];
  affiliations: string[];
  date: string;
  
  // Design
  theme: string;
  colorScheme: 'auto' | 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'monochrome';
  fontHeading: string;
  fontBody: string;
  
  // Content
  slideCount: number;
  detailLevel: 'brief' | 'standard' | 'detailed' | 'comprehensive';
  includeFigures: boolean;
  includeTables: boolean;
  includeCitations: boolean;
  includeReferences: boolean;
  citationStyle: CitationStyle['id'];
  
  // Structure
  sections: {
    title: boolean;
    outline: boolean;
    introduction: boolean;
    methodology: boolean;
    results: boolean;
    discussion: boolean;
    conclusion: boolean;
    references: boolean;
    thankYou: boolean;
  };
  
  // AI Features
  generateSpeakerNotes: boolean;
  generateScript: boolean;
  simplifyLanguage: boolean;
  targetAudience: 'experts' | 'general' | 'students' | 'mixed';
  
  // Export
  format: 'pptx' | 'pdf' | 'google-slides' | 'keynote';
  aspectRatio: '16:9' | '4:3' | '16:10';
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  action?: {
    type: 'edit_slide' | 'add_slide' | 'remove_slide' | 'reorder' | 'change_theme';
    target?: number;
    data?: unknown;
  };
}

export interface ExportOptions {
  format: 'pptx' | 'pdf' | 'google-slides' | 'keynote' | 'html';
  includeSpeakerNotes: boolean;
  includeAnimations: boolean;
  quality: 'standard' | 'high' | 'maximum';
  compressImages: boolean;
}

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  config: Partial<PresentationConfig>;
  category: 'academic' | 'business' | 'minimal' | 'creative' | 'technical';
}

export interface CollaborationSession {
  id: string;
  presentationId: string;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  cursor?: {
    slideId: number;
    x: number;
    y: number;
  };
}

export interface VersionHistory {
  id: string;
  timestamp: string;
  author: string;
  changes: string;
  slides: EnhancedSlide[];
}

export interface AccessibilityOptions {
  highContrast: boolean;
  largeText: boolean;
  altTextForImages: boolean;
  screenReaderOptimized: boolean;
  colorBlindFriendly: boolean;
}

export interface DiagramElement {
  type: 'flowchart' | 'mindmap' | 'venn' | 'pyramid' | 'funnel' | 'cycle' | 'timeline';
  data: unknown;
  title: string;
}
