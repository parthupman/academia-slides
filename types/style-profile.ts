// User Style Profiles
// Personalization system for consistent, branded presentations

export interface StyleProfile {
  id: string;
  name: string;
  description?: string;
  userId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Content Style Preferences
  content: ContentStylePreferences;
  
  // Visual Style Preferences
  visual: VisualStylePreferences;
  
  // Structure Preferences
  structure: StructurePreferences;
  
  // Domain-Specific Overrides
  domainOverrides?: Record<string, Partial<StyleProfile>>;
}

export interface ContentStylePreferences {
  // Tone and Voice
  tone: 'formal' | 'conversational' | 'enthusiastic' | 'professional' | 'accessible';
  
  // Detail Level
  detailLevel: 'overview' | 'balanced' | 'detailed' | 'comprehensive';
  
  // Bullet Point Style
  bulletStyle: 'fragments' | 'short-phrases' | 'complete-sentences' | 'mixed';
  
  // Language Complexity
  languageComplexity: 'simplified' | 'standard' | 'technical' | 'expert';
  
  // Use of Examples
  useExamples: 'none' | 'minimal' | 'moderate' | 'extensive';
  
  // Humor/Engagement
  engagementLevel: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  
  // Personal Voice
  usePersonalPronouns: boolean; // "we found" vs "the authors found"
  
  // Transitions
  transitionStyle: 'none' | 'simple' | 'elaborate';
  
  // Citations
  citationStyle: 'apa' | 'mla' | 'chicago' | 'ieee' | 'harvard' | 'vancouver' | 'numbered';
  citationDensity: 'minimal' | 'moderate' | 'extensive';
}

export interface VisualStylePreferences {
  // Color Scheme
  colors: ColorScheme;
  
  // Typography
  typography: TypographySettings;
  
  // Layout Style
  layoutStyle: 'minimal' | 'content-focused' | 'visual-focused' | 'balanced' | 'bold';
  
  // Background
  background: BackgroundSettings;
  
  // Visual Elements
  visualElements: VisualElementSettings;
  
  // Spacing
  spacing: 'compact' | 'normal' | 'spacious';
  
  // Institution Branding
  branding?: BrandingSettings;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textMuted: string;
  success?: string;
  warning?: string;
  error?: string;
  
  // Predefined palettes
  preset?: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'teal' | 'gray' | 'custom';
}

export interface TypographySettings {
  headingFont: string;
  bodyFont: string;
  codeFont?: string;
  
  // Size scale
  titleSize: 'small' | 'medium' | 'large' | 'xlarge';
  bodySize: 'small' | 'medium' | 'large';
  
  // Weight
  headingWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  
  // Line height
  lineHeight: 'tight' | 'normal' | 'relaxed';
}

export interface BackgroundSettings {
  type: 'solid' | 'gradient' | 'image' | 'pattern';
  value: string;
  
  // For images
  imageUrl?: string;
  imageOverlay?: 'none' | 'light' | 'dark';
  
  // For gradients
  gradientDirection?: 'to-right' | 'to-bottom' | 'to-bottom-right' | 'radial';
}

export interface VisualElementSettings {
  // Icons
  iconStyle: 'outline' | 'filled' | 'two-tone' | 'none';
  iconSet: 'lucide' | 'heroicons' | 'fontawesome' | 'custom';
  
  // Borders
  borderStyle: 'none' | 'subtle' | 'prominent';
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  
  // Shadows
  shadowStyle: 'none' | 'subtle' | 'medium' | 'prominent';
  
  // Charts
  chartStyle: 'minimal' | 'colorful' | 'monochrome' | 'gradient' | 'professional' | 'modern';
  chartColors: string[];
}

export interface BrandingSettings {
  // Institution
  institutionName?: string;
  
  // Logos
  logoLight?: string; // URL or base64
  logoDark?: string;
  logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'none';
  logoSize: 'small' | 'medium' | 'large';
  
  // Footer
  footerText?: string;
  showPageNumbers: boolean;
  showDate: boolean;
  
  // Watermark
  watermark?: string;
  watermarkOpacity: number;
}

export interface StructurePreferences {
  // Default slide count
  targetSlideCount: number;
  
  // Sections to always include
  requiredSections: string[];
  
  // Sections to never include
  excludedSections: string[];
  
  // Section order (can be reordered)
  sectionOrder: string[];
  
  // Title slide format
  titleSlideFormat: 'minimal' | 'standard' | 'elaborate';
  
  // Content slide format
  contentSlideFormat: 'bullets' | 'paragraphs' | 'visual' | 'mixed';
  
  // Final slide
  finalSlide: 'thank-you' | 'questions' | 'contact' | 'summary' | 'none';
  
  // Speaker notes
  includeSpeakerNotes: boolean;
  speakerNotesDetail: 'minimal' | 'moderate' | 'detailed';
}

// Preset profiles
export const STYLE_PROFILE_PRESETS: Record<string, Partial<StyleProfile>> = {
  'minimal-clean': {
    name: 'Minimal & Clean',
    description: 'Modern, distraction-free design',
    content: {
      tone: 'professional',
      detailLevel: 'balanced',
      bulletStyle: 'fragments',
      languageComplexity: 'standard',
      useExamples: 'minimal',
      engagementLevel: 3,
      usePersonalPronouns: false,
      transitionStyle: 'simple',
      citationStyle: 'apa',
      citationDensity: 'minimal'
    },
    visual: {
      colors: {
        primary: '#18181b',
        secondary: '#3f3f46',
        accent: '#71717a',
        background: '#ffffff',
        text: '#18181b',
        textMuted: '#71717a'
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        titleSize: 'large',
        bodySize: 'medium',
        headingWeight: 'semibold',
        lineHeight: 'normal'
      },
      background: { type: 'solid', value: '#ffffff' },
      layoutStyle: 'minimal',
      visualElements: {
        iconStyle: 'outline',
        iconSet: 'lucide',
        borderStyle: 'none',
        borderRadius: 'small',
        shadowStyle: 'none',
        chartStyle: 'minimal',
        chartColors: ['#18181b', '#3f3f46', '#71717a', '#a1a1aa']
      },
      spacing: 'spacious'
    }
  },
  
  'academic-traditional': {
    name: 'Academic Traditional',
    description: 'Classic academic presentation style',
    content: {
      tone: 'formal',
      detailLevel: 'comprehensive',
      bulletStyle: 'complete-sentences',
      languageComplexity: 'technical',
      useExamples: 'moderate',
      engagementLevel: 2,
      usePersonalPronouns: false,
      transitionStyle: 'none',
      citationStyle: 'apa',
      citationDensity: 'extensive'
    },
    visual: {
      colors: {
        primary: '#1e3a5f',
        secondary: '#2c5282',
        accent: '#3182ce',
        background: '#ffffff',
        text: '#1a202c',
        textMuted: '#4a5568'
      },
      typography: {
        headingFont: 'Georgia',
        bodyFont: 'Georgia',
        titleSize: 'xlarge',
        bodySize: 'medium',
        headingWeight: 'bold',
        lineHeight: 'relaxed'
      },
      background: { type: 'solid', value: '#ffffff' },
      layoutStyle: 'content-focused',
      visualElements: {
        iconStyle: 'none',
        iconSet: 'lucide',
        borderStyle: 'subtle',
        borderRadius: 'none',
        shadowStyle: 'none',
        chartStyle: 'monochrome',
        chartColors: ['#1e3a5f', '#2c5282', '#3182ce', '#63b3ed']
      },
      spacing: 'normal'
    }
  },
  
  'bold-impact': {
    name: 'Bold & Impactful',
    description: 'High-contrast, attention-grabbing design',
    content: {
      tone: 'enthusiastic',
      detailLevel: 'overview',
      bulletStyle: 'short-phrases',
      languageComplexity: 'simplified',
      useExamples: 'extensive',
      engagementLevel: 8,
      usePersonalPronouns: true,
      transitionStyle: 'elaborate',
      citationStyle: 'numbered',
      citationDensity: 'minimal'
    },
    visual: {
      colors: {
        primary: '#7c3aed',
        secondary: '#db2777',
        accent: '#f59e0b',
        background: '#0f0f0f',
        text: '#ffffff',
        textMuted: '#a1a1aa'
      },
      typography: {
        headingFont: 'Poppins',
        bodyFont: 'Inter',
        titleSize: 'xlarge',
        bodySize: 'large',
        headingWeight: 'bold',
        lineHeight: 'tight'
      },
      background: { type: 'solid', value: '#0f0f0f' },
      layoutStyle: 'visual-focused',
      visualElements: {
        iconStyle: 'filled',
        iconSet: 'heroicons',
        borderStyle: 'prominent',
        borderRadius: 'large',
        shadowStyle: 'prominent',
        chartStyle: 'colorful',
        chartColors: ['#7c3aed', '#db2777', '#f59e0b', '#10b981']
      },
      spacing: 'normal'
    }
  },
  
  'nature-science': {
    name: 'Nature/Science Journal',
    description: 'Inspired by top-tier journal styles',
    content: {
      tone: 'professional',
      detailLevel: 'detailed',
      bulletStyle: 'mixed',
      languageComplexity: 'expert',
      useExamples: 'moderate',
      engagementLevel: 4,
      usePersonalPronouns: true,
      transitionStyle: 'simple',
      citationStyle: 'numbered',
      citationDensity: 'moderate'
    },
    visual: {
      colors: {
        primary: '#c41e3a', // Nature red
        secondary: '#1a1a1a',
        accent: '#4a90a4',
        background: '#fafafa',
        text: '#1a1a1a',
        textMuted: '#666666'
      },
      typography: {
        headingFont: 'Helvetica Neue',
        bodyFont: 'Helvetica Neue',
        titleSize: 'large',
        bodySize: 'medium',
        headingWeight: 'bold',
        lineHeight: 'normal'
      },
      background: { type: 'solid', value: '#fafafa' },
      layoutStyle: 'balanced',
      visualElements: {
        iconStyle: 'outline',
        iconSet: 'lucide',
        borderStyle: 'subtle',
        borderRadius: 'small',
        shadowStyle: 'subtle',
        chartStyle: 'professional',
        chartColors: ['#c41e3a', '#4a90a4', '#e67e22', '#27ae60']
      },
      spacing: 'normal'
    }
  }
};

// Default profile
export const DEFAULT_STYLE_PROFILE: StyleProfile = {
  id: 'default',
  name: 'Default',
  userId: 'system',
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {
    tone: 'professional',
    detailLevel: 'balanced',
    bulletStyle: 'short-phrases',
    languageComplexity: 'standard',
    useExamples: 'moderate',
    engagementLevel: 5,
    usePersonalPronouns: true,
    transitionStyle: 'simple',
    citationStyle: 'apa',
    citationDensity: 'moderate'
  },
  visual: {
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#8b5cf6',
      background: '#ffffff',
      text: '#1f2937',
      textMuted: '#6b7280'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      titleSize: 'large',
      bodySize: 'medium',
      headingWeight: 'semibold',
      lineHeight: 'normal'
    },
    background: { type: 'solid', value: '#ffffff' },
    layoutStyle: 'balanced',
    visualElements: {
      iconStyle: 'outline',
      iconSet: 'lucide',
      borderStyle: 'subtle',
      borderRadius: 'medium',
      shadowStyle: 'subtle',
      chartStyle: 'modern',
      chartColors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    },
    spacing: 'normal',
    branding: {
      logoPosition: 'none',
      logoSize: 'medium',
      showPageNumbers: true,
      showDate: false,
      watermarkOpacity: 0.1
    }
  },
  structure: {
    targetSlideCount: 15,
    requiredSections: [],
    excludedSections: [],
    sectionOrder: ['title', 'introduction', 'methods', 'results', 'discussion', 'conclusion'],
    titleSlideFormat: 'standard',
    contentSlideFormat: 'bullets',
    finalSlide: 'questions',
    includeSpeakerNotes: true,
    speakerNotesDetail: 'moderate'
  }
};

// Storage key
export const STYLE_PROFILE_STORAGE_KEY = 'academia-style-profiles';
export const DEFAULT_STYLE_PROFILE_KEY = 'academia-default-profile-id';
