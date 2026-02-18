/**
 * Service Orchestrator
 * 
 * Coordinates multiple AI services:
 * - Text Analysis (GPT/Claude) → Understands paper, creates content
 * - Visual Generation (Nano Banana) → Creates images, diagrams
 * - Chart Generation → Data visualization
 * - Diagram Generation → Technical diagrams
 * 
 * Flow:
 * 1. Extract paper metadata (Text)
 * 2. Identify visual needs (Text → Visual mapping)
 * 3. Generate visuals in parallel (Nano Banana)
 * 4. Generate charts (QuickChart)
 * 5. Generate diagrams (Mermaid)
 * 6. Combine into presentation
 */

import { 
  AIService, 
  VisualAssetRequest, 
  ServiceHealth,
  TASK_ROUTING,
  SERVICE_REGISTRY,
  ServiceType
} from '@/types/services';
import { PaperMetadata, EnhancedSlide } from '@/types/enhanced';
import { UserSettings } from '@/types/settings';

// Service Manager - keeps track of configured services
class ServiceManager {
  private services: Map<string, AIService> = new Map();
  private health: Map<string, ServiceHealth> = new Map();

  constructor() {
    // Initialize with defaults
    SERVICE_REGISTRY.forEach(service => {
      this.services.set(service.id, { ...service });
    });
  }

  // Configure a service with user settings
  configureService(serviceId: string, config: Partial<AIService['config']>) {
    const service = this.services.get(serviceId);
    if (service) {
      service.config = { ...service.config, ...config };
      this.services.set(serviceId, service);
    }
  }

  // Get best available service for a task
  getServiceForTask(task: string): AIService | null {
    const routing = TASK_ROUTING.find(r => r.task === task);
    if (!routing) return null;

    for (const serviceId of routing.preferredServices) {
      const service = this.services.get(serviceId);
      if (service && service.config.enabled) {
        const health = this.health.get(serviceId);
        if (!health || health.status === 'healthy') {
          return service;
        }
      }
    }

    return null;
  }

  // Get all enabled services of a type
  getServicesByType(type: ServiceType): AIService[] {
    return Array.from(this.services.values())
      .filter(s => s.type === type && s.config.enabled)
      .sort((a, b) => (a.priority || 99) - (b.priority || 99));
  }

  // Update health status
  updateHealth(serviceId: string, health: ServiceHealth) {
    this.health.set(serviceId, health);
  }
}

// Global service manager instance
export const serviceManager = new ServiceManager();

// Initialize services from user settings
export function initializeServices(settings: UserSettings) {
  // Configure text analysis service
  const textServiceId = settings.provider === 'openai' ? 'openai-gpt4' :
                        settings.provider === 'anthropic' ? 'anthropic-claude' :
                        settings.provider === 'google' ? 'google-gemini' :
                        settings.provider === 'local' ? 'local-ollama' : 'openai-gpt4';
  
  serviceManager.configureService(textServiceId, {
    enabled: true,
    apiKey: settings.apiKey,
    model: settings.model
  });

  // Enable Nano Banana for visuals (if configured)
  serviceManager.configureService('nano-banana', {
    enabled: true // Assume enabled by default
  });

  // Enable other visual services
  serviceManager.configureService('mermaid', { enabled: true });
  serviceManager.configureService('quickchart', { enabled: true });
  serviceManager.configureService('katex', { enabled: true });
}

// ==========================================
// NANO BANANA INTEGRATION
// ==========================================

interface NanoBananaRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  seed?: number;
  steps?: number;
  cfg_scale?: number;
}

interface NanoBananaResponse {
  image_url: string;
  seed: number;
  width: number;
  height: number;
}

/**
 * Generate image using Nano Banana
 */
export async function generateWithNanoBanana(
  request: VisualAssetRequest,
  apiKey: string
): Promise<string> {
  // Enhance prompt for academic context
  const enhancedPrompt = enhanceVisualPrompt(request);
  
  const payload: NanoBananaRequest = {
    prompt: enhancedPrompt,
    negative_prompt: 'blurry, low quality, text, watermark, signature, distorted',
    width: request.dimensions.width,
    height: request.dimensions.height,
    steps: 30,
    cfg_scale: 7.5
  };

  try {
    const response = await fetch('https://api.nano-banana.com/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Nano Banana API error: ${response.status}`);
    }

    const data: NanoBananaResponse = await response.json();
    return data.image_url;
  } catch (error) {
    console.error('Nano Banana generation failed:', error);
    throw error;
  }
}

/**
 * Enhance prompt for better academic visuals
 */
function enhanceVisualPrompt(request: VisualAssetRequest): string {
  const basePrompt = request.prompt;
  const styleModifiers = {
    'realistic': 'photorealistic, high detail, professional photography',
    'flat': 'flat design, vector art, clean lines, minimal',
    'isometric': 'isometric 3D, technical illustration, clean geometry',
    'sketch': 'hand-drawn sketch, technical drawing, pencil style',
    '3d': '3D render, volumetric lighting, professional CGI',
    'minimalist': 'minimalist, clean, simple, elegant'
  };

  const colorInstruction = request.colors.length > 0 
    ? `color palette: ${request.colors.join(', ')}`
    : '';

  const contextHint = request.context 
    ? `for ${request.context.subjectArea} presentation`
    : '';

  return `${basePrompt}, ${styleModifiers[request.style]}, ${colorInstruction}, ${contextHint}, professional, high quality, suitable for academic presentation`.trim();
}

// ==========================================
// VISUAL GENERATION PIPELINE
// ==========================================

interface VisualGenerationPlan {
  slideIndex: number;
  slideTitle: string;
  visualType: 'illustration' | 'diagram' | 'chart' | 'equation' | 'none';
  prompt?: string;
  data?: unknown;
}

/**
 * Analyze slides and determine what visuals are needed
 */
export function planVisuals(
  slides: EnhancedSlide[],
  metadata: PaperMetadata
): VisualGenerationPlan[] {
  const plans: VisualGenerationPlan[] = [];

  slides.forEach((slide, index) => {
    const plan: VisualGenerationPlan = {
      slideIndex: index,
      slideTitle: slide.title,
      visualType: 'none'
    };

    // Determine visual type based on content
    if (slide.layout === 'figure' || slide.figure) {
      plan.visualType = 'illustration';
      plan.prompt = slide.figure?.description || 
        `Illustration for: ${slide.title}. ${slide.content.join(' ')}`;
    } 
    else if (slide.layout === 'diagram' || slide.title.toLowerCase().includes('method')) {
      plan.visualType = 'diagram';
      plan.prompt = `Diagram showing ${slide.title}: ${slide.content.join(', ')}`;
    }
    else if (slide.layout === 'chart' || slide.content.some(c => c.includes('%') || c.includes('increase') || c.includes('decrease'))) {
      plan.visualType = 'chart';
      // Extract data points
      plan.data = extractChartData(slide.content);
    }
    else if (slide.content.some(c => c.includes('$') || c.includes('\\') || c.includes('equation'))) {
      plan.visualType = 'equation';
    }
    // Every 5th slide gets a background illustration
    else if (index % 5 === 0 && index > 0) {
      plan.visualType = 'illustration';
      plan.prompt = `Abstract background illustration for: ${slide.title}. ${metadata.keywords[0] || 'academic'} theme.`;
    }

    if (plan.visualType !== 'none') {
      plans.push(plan);
    }
  });

  return plans;
}

function extractChartData(content: string[]): { labels: string[]; values: number[]; type: string } {
  // Simple extraction - look for patterns like "X: 50%" or "X increased by 20%"
  const data = {
    labels: [] as string[],
    values: [] as number[],
    type: 'bar'
  };

  content.forEach(line => {
    const match = line.match(/([^:]+):\s*(\d+(?:\.\d+)?)%?/);
    if (match) {
      data.labels.push(match[1].trim());
      data.values.push(parseFloat(match[2]));
    }
  });

  return data;
}

// ==========================================
// ORCHESTRATION - MAIN PIPELINE
// ==========================================

export interface OrchestrationResult {
  slides: EnhancedSlide[];
  visuals: Map<number, string>; // slideIndex -> imageUrl
  charts: Map<number, string>;   // slideIndex -> chartUrl
  diagrams: Map<number, string>; // slideIndex -> diagramCode
}

/**
 * Main orchestration function
 * Coordinates text analysis and visual generation
 */
export async function orchestratePresentation(
  paperText: string,
  config: {
    textService: UserSettings;
    visualService?: { provider: 'nano-banana' | 'dall-e'; apiKey: string };
    generateVisuals: boolean;
  }
): Promise<OrchestrationResult> {
  const result: OrchestrationResult = {
    slides: [],
    visuals: new Map(),
    charts: new Map(),
    diagrams: new Map()
  };

  // Step 1: Text Analysis (GPT/Claude)
  console.log('📄 Step 1: Analyzing paper with text service...');
  const metadata = await analyzePaperWithService(paperText, config.textService);

  // Step 2: Generate slide structure
  console.log('🎯 Step 2: Generating slide structure...');
  const slides = await generateSlidesWithService(metadata, config.textService);
  result.slides = slides;

  if (!config.generateVisuals || !config.visualService) {
    return result;
  }

  // Step 3: Plan visuals
  console.log('🎨 Step 3: Planning visuals...');
  const visualPlans = planVisuals(slides, metadata);

  // Step 4: Generate visuals in parallel
  console.log('🖼️ Step 4: Generating visuals...');
  const visualService = config.visualService;
  if (!visualService) throw new Error('Visual service not configured');
  
  const visualPromises = visualPlans.map(async (plan) => {
    try {
      if (plan.visualType === 'illustration' && plan.prompt) {
        const request: VisualAssetRequest = {
          type: 'illustration',
          prompt: plan.prompt,
          style: 'flat',
          colors: ['#3b82f6', '#10b981', '#8b5cf6'],
          dimensions: { width: 1024, height: 768, aspectRatio: '4:3' },
          context: {
            slideTitle: plan.slideTitle,
            paperTitle: metadata.title,
            subjectArea: metadata.keywords[0] || 'academic'
          }
        };

        if (visualService.provider === 'nano-banana') {
          const imageUrl = await generateWithNanoBanana(request, visualService.apiKey);
          result.visuals.set(plan.slideIndex, imageUrl);
        }
      }
      else if (plan.visualType === 'chart' && plan.data) {
        const chartUrl = await generateChart(plan.data);
        result.charts.set(plan.slideIndex, chartUrl);
      }
      else if (plan.visualType === 'diagram') {
        const diagramCode = await generateDiagram(plan.prompt || plan.slideTitle);
        result.diagrams.set(plan.slideIndex, diagramCode);
      }
    } catch (error) {
      console.error(`Failed to generate visual for slide ${plan.slideIndex}:`, error);
    }
  });

  await Promise.all(visualPromises);

  console.log('✅ Orchestration complete!');
  console.log(`   - Slides: ${result.slides.length}`);
  console.log(`   - Visuals: ${result.visuals.size}`);
  console.log(`   - Charts: ${result.charts.size}`);
  console.log(`   - Diagrams: ${result.diagrams.size}`);

  return result;
}

// Placeholder implementations - these would use actual services
async function analyzePaperWithService(
  text: string, 
  settings: UserSettings
): Promise<PaperMetadata> {
  // This would call your existing analysis functions
  const { analyzePaperEnhanced } = await import('./ai-enhanced');
  return analyzePaperEnhanced(text, settings);
}

async function generateSlidesWithService(
  metadata: PaperMetadata,
  settings: UserSettings
): Promise<EnhancedSlide[]> {
  const { generateEnhancedSlides } = await import('./ai-enhanced');
  const config = {
    title: metadata.title,
    subtitle: metadata.abstract.slice(0, 100),
    authors: metadata.authors,
    affiliations: metadata.affiliations,
    date: new Date().toISOString(),
    theme: 'modern',
    colorScheme: 'auto' as const,
    fontHeading: 'Inter',
    fontBody: 'Inter',
    slideCount: 15,
    detailLevel: 'standard' as const,
    includeFigures: true,
    includeTables: true,
    includeCitations: true,
    includeReferences: true,
    citationStyle: 'apa' as const,
    sections: {
      title: true,
      outline: true,
      introduction: true,
      methodology: true,
      results: true,
      discussion: true,
      conclusion: true,
      references: true,
      thankYou: true
    },
    generateSpeakerNotes: true,
    generateScript: false,
    simplifyLanguage: false,
    targetAudience: 'mixed' as const,
    format: 'pptx' as const,
    aspectRatio: '16:9' as const
  };
  return generateEnhancedSlides(metadata, config, settings);
}

async function generateChart(data: unknown): Promise<string> {
  // Use QuickChart or similar
  const chartConfig = {
    type: 'bar',
    data: data,
    options: { responsive: true }
  };
  
  const encoded = encodeURIComponent(JSON.stringify(chartConfig));
  return `https://quickchart.io/chart?c=${encoded}`;
}

async function generateDiagram(description: string): Promise<string> {
  // Generate Mermaid diagram code
  return `flowchart TD
    A[${description}] --> B[Step 1]
    B --> C[Step 2]
    C --> D[Result]`;
}

// ==========================================
// USAGE EXAMPLE
// ==========================================

/*
// Example: Full pipeline with Nano Banana + GPT-4

const result = await orchestratePresentation(
  paperText,
  {
    // Text analysis via GPT-4
    textService: {
      provider: 'openai',
      apiKey: 'sk-...',
      model: 'gpt-4o',
      // ... other settings
    },
    
    // Visual generation via Nano Banana
    visualService: {
      provider: 'nano-banana',
      apiKey: 'nb-...'
    },
    
    generateVisuals: true
  }
);

// Result contains:
// - slides: Content from GPT-4
// - visuals: Images from Nano Banana
// - charts: Data viz from QuickChart
// - diagrams: Diagrams from Mermaid
*/
