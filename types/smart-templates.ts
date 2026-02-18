// Smart Templates
// Templates that adapt based on paper structure and content

export interface SmartTemplate {
  id: string;
  name: string;
  description: string;
  
  // When to use this template
  matching: TemplateMatchingCriteria;
  
  // The structure
  structure: TemplateStructure;
  
  // Domain this works best for
  recommendedDomains: string[];
  
  // Success metrics
  stats: TemplateStats;
  
  // Author info
  author: {
    name: string;
    institution?: string;
    verified: boolean;
  };
  
  metadata: {
    created: string;
    updated: string;
    version: string;
    downloads: number;
    rating: number;
    ratingCount: number;
  };
}

export interface TemplateMatchingCriteria {
  // Keywords that suggest this template
  keywords: string[];
  
  // Paper structure patterns
  hasSections?: string[];
  hasFigures?: boolean;
  hasTables?: boolean;
  hasEquations?: boolean;
  
  // Length criteria
  wordCount?: { min?: number; max?: number };
  slideCount?: { min?: number; max?: number };
  
  // Confidence threshold
  minConfidence: number; // 0-1
}

export interface TemplateStructure {
  // Ordered list of expected slides
  slides: TemplateSlide[];
  
  // Overall flow description
  flowDescription: string;
  
  // Timing guidance
  suggestedTiming: {
    totalMinutes: number;
    perSlide: { slideType: string; minutes: number }[];
  };
}

export interface TemplateSlide {
  id: string;
  type: 'title' | 'content' | 'visual' | 'transition' | 'final';
  purpose: string;
  
  // Layout preferences
  layout: {
    type: string;
    columns?: number;
    visualPosition?: 'left' | 'right' | 'top' | 'bottom' | 'background';
  };
  
  // Content guidance
  content: {
    maxBulletPoints?: number;
    maxWordsPerBullet?: number;
    mustInclude?: string[];
    shouldInclude?: string[];
    optional?: string[];
  };
  
  // Visual guidance
  visual?: {
    type: 'chart' | 'diagram' | 'figure' | 'illustration' | 'none';
    nanoPromptTemplate?: string;
    required?: boolean;
  };
  
  // Speaker notes template
  speakerNotes?: string;
  
  // Duration
  suggestedDuration: number; // minutes
  
  // Can be skipped?
  optional: boolean;
}

export interface TemplateStats {
  timesUsed: number;
  averageRating: number;
  completionRate: number; // % of users who finished presentations
  avgGenerationTime: number; // seconds
  
  // Quality metrics
  qualityScores: {
    completeness: number;
    clarity: number;
    visualAppeal: number;
  };
}

// Pre-built smart templates
export const BUILT_IN_TEMPLATES: SmartTemplate[] = [
  {
    id: 'cs-ml-standard',
    name: 'ML Research Paper (NeurIPS/ICML Style)',
    description: 'Standard template for machine learning research papers',
    matching: {
      keywords: ['neural', 'learning', 'model', 'training', 'dataset', 'accuracy', 'benchmark'],
      hasFigures: true,
      hasTables: true,
      minConfidence: 0.7
    },
    structure: {
      slides: [
        {
          id: 'title',
          type: 'title',
          purpose: 'Grab attention, establish credibility',
          layout: { type: 'hero' },
          content: {
            mustInclude: ['Title', 'Authors', 'Affiliation'],
            optional: ['One-line contribution summary']
          },
          suggestedDuration: 0.5,
          optional: false
        },
        {
          id: 'problem',
          type: 'content',
          purpose: 'Motivate the problem',
          layout: { type: 'split', visualPosition: 'right' },
          content: {
            maxBulletPoints: 3,
            mustInclude: ['What is the problem?', 'Why does it matter?', 'Current limitations'],
          },
          visual: {
            type: 'illustration',
            nanoPromptTemplate: 'Abstract illustration of {problem} challenge in machine learning, modern tech aesthetic, geometric shapes, blue and purple tones',
            required: false
          },
          suggestedDuration: 2,
          optional: false
        },
        {
          id: 'contributions',
          type: 'content',
          purpose: 'Clearly state contributions',
          layout: { type: 'centered' },
          content: {
            maxBulletPoints: 3,
            mustInclude: ['3-4 clear contributions'],
          },
          suggestedDuration: 1,
          optional: false
        },
        {
          id: 'method-overview',
          type: 'visual',
          purpose: 'High-level approach',
          layout: { type: 'full-visual' },
          content: {},
          visual: {
            type: 'diagram',
            nanoPromptTemplate: 'Clean neural network architecture diagram for {method_name}, flow chart style, showing input processing through layers to output, blue technical aesthetic',
            required: true
          },
          suggestedDuration: 2,
          optional: false
        },
        {
          id: 'method-details',
          type: 'content',
          purpose: 'Key technical details',
          layout: { type: 'two-column' },
          content: {
            maxBulletPoints: 4,
            mustInclude: ['Architecture details', 'Key equations', 'Training procedure'],
          },
          suggestedDuration: 3,
          optional: false
        },
        {
          id: 'experiments',
          type: 'content',
          purpose: 'Experimental setup',
          layout: { type: 'standard' },
          content: {
            mustInclude: ['Datasets', 'Baselines', 'Metrics', 'Implementation details'],
          },
          suggestedDuration: 1.5,
          optional: false
        },
        {
          id: 'main-results',
          type: 'visual',
          purpose: 'Show best results',
          layout: { type: 'full-visual' },
          content: {},
          visual: {
            type: 'chart',
            required: true
          },
          suggestedDuration: 2,
          optional: false
        },
        {
          id: 'results-table',
          type: 'visual',
          purpose: 'Detailed comparison',
          layout: { type: 'full-visual' },
          content: {},
          visual: {
            type: 'figure',
            required: true
          },
          suggestedDuration: 2,
          optional: false
        },
        {
          id: 'ablation',
          type: 'visual',
          purpose: 'Component analysis',
          layout: { type: 'full-visual' },
          content: {},
          visual: {
            type: 'chart',
            required: true
          },
          suggestedDuration: 1.5,
          optional: true
        },
        {
          id: 'analysis',
          type: 'content',
          purpose: 'Interpret results',
          layout: { type: 'split', visualPosition: 'left' },
          content: {
            maxBulletPoints: 3,
            mustInclude: ['Key findings', 'Why it works', 'Limitations'],
          },
          suggestedDuration: 2,
          optional: false
        },
        {
          id: 'conclusion',
          type: 'content',
          purpose: 'Takeaways and future work',
          layout: { type: 'standard' },
          content: {
            maxBulletPoints: 3,
            mustInclude: ['Summary', 'Impact', 'Future directions'],
          },
          suggestedDuration: 1,
          optional: false
        },
        {
          id: 'questions',
          type: 'final',
          purpose: 'Q&A',
          layout: { type: 'simple' },
          content: {},
          suggestedDuration: 5,
          optional: false
        }
      ],
      flowDescription: 'Follows the standard ML conference presentation flow: Problem → Contributions → Method → Results → Analysis',
      suggestedTiming: {
        totalMinutes: 12,
        perSlide: [
          { slideType: 'title', minutes: 0.5 },
          { slideType: 'problem', minutes: 2 },
          { slideType: 'method', minutes: 5 },
          { slideType: 'results', minutes: 3 },
          { slideType: 'conclusion', minutes: 1.5 }
        ]
      }
    },
    recommendedDomains: ['computer-science', 'engineering'],
    stats: {
      timesUsed: 15000,
      averageRating: 4.7,
      completionRate: 0.92,
      avgGenerationTime: 45,
      qualityScores: {
        completeness: 92,
        clarity: 88,
        visualAppeal: 85
      }
    },
    author: {
      name: 'AcademiaSlides Team',
      institution: 'AcademiaSlides',
      verified: true
    },
    metadata: {
      created: '2024-01-01',
      updated: '2024-06-15',
      version: '2.1',
      downloads: 15000,
      rating: 4.7,
      ratingCount: 2300
    }
  },

  {
    id: 'biomedical-clinical',
    name: 'Clinical Research (CONSORT-compliant)',
    description: 'Template for clinical trials and biomedical research',
    matching: {
      keywords: ['clinical', 'trial', 'patient', 'treatment', 'efficacy', 'safety', 'endpoint'],
      hasSections: ['Methods', 'Results'],
      minConfidence: 0.8
    },
    structure: {
      slides: [
        {
          id: 'title',
          type: 'title',
          purpose: 'Study identification',
          layout: { type: 'standard' },
          content: {
            mustInclude: ['Title', 'Trial registration number', 'Funding disclosure']
          },
          suggestedDuration: 0.5,
          optional: false
        },
        {
          id: 'background',
          type: 'content',
          purpose: 'Rationale',
          layout: { type: 'standard' },
          content: {
            maxBulletPoints: 3,
            mustInclude: ['Disease burden', 'Current treatments', 'Study rationale'],
          },
          suggestedDuration: 1.5,
          optional: false
        },
        {
          id: 'objectives',
          type: 'content',
          purpose: 'Clear objectives',
          layout: { type: 'centered' },
          content: {
            mustInclude: ['Primary endpoint', 'Secondary endpoints'],
          },
          suggestedDuration: 1,
          optional: false
        },
        {
          id: 'consort',
          type: 'visual',
          purpose: 'Patient flow',
          layout: { type: 'full-visual' },
          content: {},
          visual: {
            type: 'diagram',
            nanoPromptTemplate: 'CONSORT flow diagram showing patient recruitment, randomization, and analysis, clean medical illustration style, blue and green tones',
            required: true
          },
          suggestedDuration: 1.5,
          optional: false
        },
        {
          id: 'methods',
          type: 'content',
          purpose: 'Study design',
          layout: { type: 'two-column' },
          content: {
            mustInclude: ['Design', 'Participants', 'Interventions', 'Outcomes', 'Sample size'],
          },
          suggestedDuration: 2,
          optional: false
        },
        {
          id: 'baseline',
          type: 'visual',
          purpose: 'Table 1',
          layout: { type: 'full-visual' },
          content: {},
          visual: {
            type: 'figure',
            required: true
          },
          suggestedDuration: 1,
          optional: false
        },
        {
          id: 'efficacy',
          type: 'visual',
          purpose: 'Primary results',
          layout: { type: 'full-visual' },
          content: {},
          visual: {
            type: 'chart',
            required: true
          },
          suggestedDuration: 2,
          optional: false
        },
        {
          id: 'safety',
          type: 'content',
          purpose: 'Adverse events',
          layout: { type: 'split', visualPosition: 'right' },
          content: {
            mustInclude: ['AE summary', 'Serious AEs', 'Discontinuations'],
          },
          suggestedDuration: 1.5,
          optional: false
        },
        {
          id: 'conclusion',
          type: 'content',
          purpose: 'Interpretation',
          layout: { type: 'standard' },
          content: {
            mustInclude: ['Key findings', 'Clinical significance', 'Limitations', 'Implications'],
          },
          suggestedDuration: 1.5,
          optional: false
        }
      ],
      flowDescription: 'CONSORT-compliant flow for clinical trial presentations',
      suggestedTiming: {
        totalMinutes: 12,
        perSlide: []
      }
    },
    recommendedDomains: ['medicine', 'biology'],
    stats: {
      timesUsed: 8000,
      averageRating: 4.8,
      completionRate: 0.95,
      avgGenerationTime: 50,
      qualityScores: {
        completeness: 95,
        clarity: 90,
        visualAppeal: 82
      }
    },
    author: {
      name: 'AcademiaSlides Medical Team',
      verified: true
    },
    metadata: {
      created: '2024-02-01',
      updated: '2024-05-20',
      version: '1.5',
      downloads: 8000,
      rating: 4.8,
      ratingCount: 1200
    }
  }
];

// Template recommendation engine
export interface TemplateRecommendation {
  template: SmartTemplate;
  confidence: number;
  reason: string;
  
  // How well this matches
  matchDetails: {
    keywordMatch: number;
    structureMatch: number;
    domainMatch: number;
  };
  
  // Alternative options
  alternatives: {
    template: SmartTemplate;
    confidence: number;
  }[];
}

// User template library
export interface UserTemplateLibrary {
  saved: SmartTemplate[];
  recent: string[]; // Template IDs
  favorites: string[];
  created: SmartTemplate[];
}
