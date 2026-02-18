import { AIService } from '@/types/services';

export const DEFAULT_SERVICES: AIService[] = [
  {
    id: 'openai-text',
    name: 'OpenAI GPT-4',
    type: 'text-analysis',
    provider: 'openai',
    description: 'Primary text analysis and content generation',
    capabilities: ['paper-analysis', 'slide-content', 'summarization', 'key-point-extraction'],
    requiresApiKey: true,
    config: {
      enabled: true,
      apiKey: '',
      model: 'gpt-4o',
      temperature: 0.3,
      maxTokens: 4000
    }
  },
  {
    id: 'anthropic-text',
    name: 'Claude 3',
    type: 'text-analysis',
    provider: 'anthropic',
    description: 'Alternative text analysis with longer context',
    capabilities: ['paper-analysis', 'slide-content', 'summarization', 'structured-output'],
    requiresApiKey: true,
    config: {
      enabled: false,
      apiKey: '',
      model: 'claude-3-opus-20240229',
      temperature: 0.3,
      maxTokens: 4000
    }
  },
  {
    id: 'nano-visual',
    name: 'Nano Banana',
    type: 'image-generation',
    provider: 'nano',
    description: 'AI-powered illustrations and slide visuals',
    capabilities: ['slide-backgrounds', 'illustrations', 'diagrams', 'concept-visualization'],
    requiresApiKey: true,
    config: {
      enabled: false,
      apiKey: '',
      model: 'nano-xl',
      temperature: 0.7
    }
  },
  {
    id: 'openai-image',
    name: 'OpenAI DALL-E',
    type: 'image-generation',
    provider: 'openai',
    description: 'High-quality AI image generation',
    capabilities: ['slide-backgrounds', 'illustrations', 'concept-art'],
    requiresApiKey: true,
    config: {
      enabled: false,
      apiKey: '',
      model: 'dall-e-3',
      temperature: 0.7
    }
  },
  {
    id: 'mermaid-diagram',
    name: 'Mermaid.js',
    type: 'diagram-generation',
    provider: 'local',
    description: 'Code-based diagrams and flowcharts',
    capabilities: ['flowcharts', 'sequence-diagrams', 'class-diagrams', 'gantt-charts'],
    requiresApiKey: false,
    config: {
      enabled: true
    }
  },
  {
    id: 'plotly-chart',
    name: 'Plotly.js',
    type: 'chart-generation',
    provider: 'local',
    description: 'Interactive data visualizations',
    capabilities: ['line-charts', 'bar-charts', 'scatter-plots', '3d-visualizations'],
    requiresApiKey: false,
    config: {
      enabled: true
    }
  },
  {
    id: 'katex-equations',
    name: 'KaTeX',
    type: 'equation-rendering',
    provider: 'local',
    description: 'Fast math equation rendering',
    capabilities: ['latex-equations', 'math-symbols', 'formulas'],
    requiresApiKey: false,
    config: {
      enabled: true
    }
  },
  {
    id: 'elevenlabs-voice',
    name: 'ElevenLabs',
    type: 'voice-generation',
    provider: 'elevenlabs',
    description: 'AI voice narration for slides',
    capabilities: ['speaker-notes', 'presentation-narration', 'voice-over'],
    requiresApiKey: true,
    config: {
      enabled: false,
      apiKey: '',
      model: 'eleven-multilingual-v2'
    }
  },
  {
    id: 'smart-layout',
    name: 'Smart Layout Engine',
    type: 'slide-layout',
    provider: 'local',
    description: 'AI-optimized slide layouts',
    capabilities: ['auto-layout', 'content-optimization', 'design-suggestions'],
    requiresApiKey: false,
    config: {
      enabled: true
    }
  },
  {
    id: 'citation-formatter',
    name: 'Citation Formatter',
    type: 'citation-formatting',
    provider: 'local',
    description: 'Academic citation formatting',
    capabilities: ['apa', 'mla', 'chicago', 'harvard', 'ieee', 'bibtex'],
    requiresApiKey: false,
    config: {
      enabled: true
    }
  }
];

const STORAGE_KEY = 'academia-services';

export function getServices(): AIService[] {
  if (typeof window === 'undefined') return DEFAULT_SERVICES;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure new services are added
      const storedIds = new Set(parsed.map((s: AIService) => s.id));
      const missingDefaults = DEFAULT_SERVICES.filter(s => !storedIds.has(s.id));
      return [...parsed, ...missingDefaults];
    }
  } catch {
    console.error('Failed to parse services from localStorage');
  }
  
  return DEFAULT_SERVICES;
}

export function saveServices(services: AIService[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  } catch {
    console.error('Failed to save services to localStorage');
  }
}

export function getActiveService(type: AIService['type'], services = getServices()): AIService | undefined {
  return services.find(s => s.type === type && s.config.enabled);
}

export function getAllActiveServices(services = getServices()): AIService[] {
  return services.filter(s => s.config.enabled);
}

export function shouldUseVisualService(services = getServices()): boolean {
  return services.some(s => 
    s.type === 'image-generation' && s.config.enabled
  );
}

export function getServiceForTask(task: string, services = getServices()): AIService | undefined {
  const taskMap: Record<string, AIService['type']> = {
    'image': 'image-generation',
    'diagram': 'diagram-generation',
    'chart': 'chart-generation',
    'equation': 'equation-rendering',
    'voice': 'voice-generation',
    'layout': 'slide-layout',
    'citation': 'citation-formatting'
  };

  const serviceType = taskMap[task.toLowerCase()];
  if (!serviceType) return undefined;

  return getActiveService(serviceType, services);
}
