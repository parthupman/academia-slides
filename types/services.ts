// Multi-service AI architecture
// Each service handles what it's best at

export type ServiceType = 
  | 'text-analysis'      // GPT-4, Claude, Gemini - for understanding papers
  | 'image-generation'   // Nano Banana, DALL-E, Midjourney - for visuals
  | 'chart-generation'   // QuickChart, Chart.js - for data viz
  | 'diagram-generation' // Mermaid, PlantUML - for diagrams
  | 'equation-rendering' // MathJax, KaTeX - for math
  | 'voice-generation'   // ElevenLabs, AWS Polly - for narration
  | 'slide-layout'       // Internal - for layout optimization
  | 'citation-formatting'; // Internal - for references

export interface AIService {
  id: string;
  type: ServiceType;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  config: ServiceConfig;
  requiresApiKey?: boolean;
  priority?: number; // Lower = preferred
}

export interface ServiceConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  maxRequestsPerMinute?: number;
  timeout?: number;
  enabled: boolean;
  temperature?: number;
  maxTokens?: number;
}

// Service Registry - defines which service does what
export const SERVICE_REGISTRY: AIService[] = [
  // TEXT ANALYSIS SERVICES
  {
    id: 'openai-gpt4',
    type: 'text-analysis',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Best for paper analysis, slide content, summaries',
    capabilities: ['paper-analysis', 'slide-generation', 'summarization', 'qa-generation'],
    config: { enabled: true },
    priority: 1
  },
  {
    id: 'anthropic-claude',
    type: 'text-analysis',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Excellent for academic content, long context',
    capabilities: ['paper-analysis', 'slide-generation', 'script-generation'],
    config: { enabled: true },
    priority: 2
  },
  {
    id: 'google-gemini',
    type: 'text-analysis',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Good free tier, multimodal',
    capabilities: ['paper-analysis', 'slide-generation'],
    config: { enabled: true },
    priority: 3
  },
  {
    id: 'local-ollama',
    type: 'text-analysis',
    name: 'Local Ollama',
    provider: 'Local',
    description: '100% private, runs locally',
    capabilities: ['paper-analysis', 'slide-generation'],
    config: { enabled: false },
    priority: 4
  },

  // IMAGE GENERATION SERVICES
  {
    id: 'nano-banana',
    type: 'image-generation',
    name: 'Nano Banana',
    provider: 'Nano Banana',
    description: 'Fast, affordable image generation for slides',
    capabilities: ['slide-illustrations', 'diagrams', 'backgrounds', 'icons'],
    config: { enabled: true },
    priority: 1
  },
  {
    id: 'dall-e-3',
    type: 'image-generation',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    description: 'High quality, follows prompts precisely',
    capabilities: ['slide-illustrations', 'diagrams', 'backgrounds'],
    config: { enabled: true },
    priority: 2
  },
  {
    id: 'midjourney',
    type: 'image-generation',
    name: 'Midjourney API',
    provider: 'Midjourney',
    description: 'Artistic, beautiful visuals',
    capabilities: ['slide-illustrations', 'backgrounds', 'covers'],
    config: { enabled: false },
    priority: 3
  },
  {
    id: 'stable-diffusion',
    type: 'image-generation',
    name: 'Stable Diffusion XL',
    provider: 'Stability AI',
    description: 'Open source, customizable',
    capabilities: ['slide-illustrations', 'diagrams', 'backgrounds'],
    config: { enabled: false },
    priority: 4
  },

  // CHART/DATA VISUALIZATION
  {
    id: 'quickchart',
    type: 'chart-generation',
    name: 'QuickChart',
    provider: 'QuickChart',
    description: 'Generate charts from data',
    capabilities: ['bar-charts', 'line-charts', 'pie-charts', 'scatter-plots'],
    config: { enabled: true },
    priority: 1
  },
  {
    id: 'chartjs-server',
    type: 'chart-generation',
    name: 'Chart.js Server',
    provider: 'Internal',
    description: 'Custom chart rendering',
    capabilities: ['all-chart-types', 'custom-styling'],
    config: { enabled: true },
    priority: 2
  },

  // DIAGRAM GENERATION
  {
    id: 'mermaid',
    type: 'diagram-generation',
    name: 'Mermaid.js',
    provider: 'Mermaid',
    description: 'Flowcharts, sequence diagrams, graphs',
    capabilities: ['flowcharts', 'sequence-diagrams', 'class-diagrams', 'er-diagrams', 'gantt'],
    config: { enabled: true },
    priority: 1
  },
  {
    id: 'plantuml',
    type: 'diagram-generation',
    name: 'PlantUML',
    provider: 'PlantUML',
    description: 'Complex technical diagrams',
    capabilities: ['uml-diagrams', 'architecture-diagrams'],
    config: { enabled: true },
    priority: 2
  },

  // EQUATION RENDERING
  {
    id: 'katex',
    type: 'equation-rendering',
    name: 'KaTeX',
    provider: 'KaTeX',
    description: 'Fast math rendering',
    capabilities: ['latex-equations', 'math-symbols', 'formulas'],
    config: { enabled: true },
    priority: 1
  },
  {
    id: 'mathjax',
    type: 'equation-rendering',
    name: 'MathJax',
    provider: 'MathJax',
    description: 'Comprehensive math support',
    capabilities: ['latex-equations', 'asciimath', 'mml'],
    config: { enabled: true },
    priority: 2
  }
];

// Service Routing - maps tasks to appropriate services
export interface TaskRouting {
  task: string;
  serviceType: ServiceType;
  preferredServices: string[]; // Service IDs in priority order
  fallbackStrategy: 'next-available' | 'fail' | 'degrade';
}

export const TASK_ROUTING: TaskRouting[] = [
  // Text Analysis Tasks
  {
    task: 'paper-analysis',
    serviceType: 'text-analysis',
    preferredServices: ['openai-gpt4', 'anthropic-claude', 'google-gemini', 'local-ollama'],
    fallbackStrategy: 'next-available'
  },
  {
    task: 'slide-content-generation',
    serviceType: 'text-analysis',
    preferredServices: ['openai-gpt4', 'anthropic-claude', 'google-gemini'],
    fallbackStrategy: 'next-available'
  },
  {
    task: 'speaker-script',
    serviceType: 'text-analysis',
    preferredServices: ['anthropic-claude', 'openai-gpt4'],
    fallbackStrategy: 'next-available'
  },

  // Visual Generation Tasks
  {
    task: 'slide-illustration',
    serviceType: 'image-generation',
    preferredServices: ['nano-banana', 'dall-e-3', 'stable-diffusion'],
    fallbackStrategy: 'next-available'
  },
  {
    task: 'slide-background',
    serviceType: 'image-generation',
    preferredServices: ['nano-banana', 'dall-e-3', 'midjourney'],
    fallbackStrategy: 'next-available'
  },
  {
    task: 'diagram-illustration',
    serviceType: 'image-generation',
    preferredServices: ['dall-e-3', 'nano-banana', 'stable-diffusion'],
    fallbackStrategy: 'next-available'
  },
  {
    task: 'concept-visualization',
    serviceType: 'image-generation',
    preferredServices: ['nano-banana', 'dall-e-3'],
    fallbackStrategy: 'next-available'
  },

  // Data Visualization
  {
    task: 'data-chart',
    serviceType: 'chart-generation',
    preferredServices: ['quickchart', 'chartjs-server'],
    fallbackStrategy: 'next-available'
  },

  // Diagrams
  {
    task: 'flowchart',
    serviceType: 'diagram-generation',
    preferredServices: ['mermaid', 'plantuml'],
    fallbackStrategy: 'next-available'
  },
  {
    task: 'sequence-diagram',
    serviceType: 'diagram-generation',
    preferredServices: ['mermaid', 'plantuml'],
    fallbackStrategy: 'next-available'
  },
  {
    task: 'architecture-diagram',
    serviceType: 'diagram-generation',
    preferredServices: ['plantuml', 'mermaid'],
    fallbackStrategy: 'next-available'
  },

  // Math
  {
    task: 'equation-render',
    serviceType: 'equation-rendering',
    preferredServices: ['katex', 'mathjax'],
    fallbackStrategy: 'next-available'
  }
];

// Visual Asset Types that Nano Banana is best at
export interface VisualAssetRequest {
  type: 'illustration' | 'diagram' | 'background' | 'icon' | 'chart-visual' | 'concept-art';
  prompt: string;
  style: 'realistic' | 'flat' | 'isometric' | 'sketch' | '3d' | 'minimalist';
  colors: string[]; // Hex colors to match theme
  dimensions: { width: number; height: number; aspectRatio: string };
  context?: {
    slideTitle: string;
    paperTitle: string;
    subjectArea: string;
  };
}

// Text Analysis Request
export interface TextAnalysisRequest {
  type: 'extract-metadata' | 'generate-slides' | 'summarize' | 'simplify' | 'qa-generation';
  content: string;
  options: {
    detailLevel: 'brief' | 'standard' | 'detailed' | 'comprehensive';
    targetAudience: 'experts' | 'general' | 'students' | 'mixed';
    maxTokens: number;
    temperature: number;
  };
}

// Orchestration Request - combines multiple services
export interface OrchestratedRequest {
  // Step 1: Analyze paper (Text Analysis Service)
  analysis: {
    serviceId: string;
    request: TextAnalysisRequest;
  };
  
  // Step 2: Generate visuals (Image Generation Service)
  visuals: {
    serviceId: string;
    requests: VisualAssetRequest[];
  };
  
  // Step 3: Generate diagrams (Diagram Service)
  diagrams?: {
    serviceId: string;
    types: ('flowchart' | 'sequence' | 'architecture' | 'mindmap')[];
  };
  
  // Step 4: Generate charts (Chart Service)
  charts?: {
    serviceId: string;
    data: unknown[];
  };
}

// Service Health Status
export interface ServiceHealth {
  serviceId: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  latency: number; // ms
  lastChecked: string;
  errorRate: number;
  remainingQuota?: number;
}
