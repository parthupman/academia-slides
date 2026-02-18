/* eslint-disable @typescript-eslint/no-unused-vars */
import { 
  VisionAnalysisConfig,
  AnalyzedFigure,
  FigureAnalysis,
  TableAnalysis,
  BatchVisionAnalysis,
  DEFAULT_VISION_CONFIG
} from '@/types/vision-analysis';
import { PaperMetadata, ExtractedFigure } from '@/types/enhanced';
import OpenAI from 'openai';

// Analyze all figures in a paper
export async function analyzePaperFigures(
  figures: ExtractedFigure[],
  config: VisionAnalysisConfig = DEFAULT_VISION_CONFIG,
  openaiClient?: OpenAI
): Promise<AnalyzedFigure[]> {
  if (!config.enabled || figures.length === 0) {
    return [];
  }
  
  const analyzed: AnalyzedFigure[] = [];
  const limit = Math.min(figures.length, config.maxImagesPerPaper);
  
  for (let i = 0; i < limit; i++) {
    const figure = figures[i];
    
    try {
      const analysis = await analyzeSingleFigure(figure, config, openaiClient);
      analyzed.push(analysis);
    } catch (error) {
      console.error(`Failed to analyze figure ${figure.id}:`, error);
    }
  }
  
  return analyzed;
}

// Analyze a single figure
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function analyzeSingleFigure(
  figure: ExtractedFigure,
  _config: VisionAnalysisConfig,
  _openaiClient?: OpenAI
): Promise<AnalyzedFigure> {
  // For now, return a basic analysis structure
  // In production, this would use GPT-4 Vision API
  
  const analysis: FigureAnalysis = {
    description: figure.caption || 'Figure from paper',
    keyFindings: [],
    trends: [],
    outliers: []
  };
  
  // Detect figure type from caption
  const caption_lower = (figure.caption || '').toLowerCase();
  
  if (caption_lower.includes('fig.') || caption_lower.includes('figure')) {
    if (caption_lower.includes('chart') || caption_lower.includes('graph') || caption_lower.includes('plot')) {
      analysis.chartType = detectChartType(caption_lower);
    } else if (caption_lower.includes('diagram') || caption_lower.includes('schematic')) {
      analysis.diagramType = 'architecture';
    }
  }
  
  // Determine importance
  const relevanceScore = calculateRelevance(figure, caption_lower);
  
  return {
    id: figure.id,
    type: analysis.chartType ? 'chart' : analysis.diagramType ? 'diagram' : 'image',
    sourcePage: figure.page || 0,
    figureNumber: figure.id,
    caption: figure.caption || '',
    image: {
      url: '', // Would be populated from actual image extraction
      width: 800,
      height: 600,
      format: 'png'
    },
    analysis,
    relevance: {
      score: relevanceScore,
      keyFindings: analysis.keyFindings,
      importance: relevanceScore > 0.8 ? 'critical' : relevanceScore > 0.5 ? 'important' : 'supporting'
    },
    includeInSlides: relevanceScore > 0.5,
    suggestedSlides: []
  };
}

// Detect chart type from caption
function detectChartType(caption: string): FigureAnalysis['chartType'] {
  if (caption.includes('bar')) return 'bar';
  if (caption.includes('line') || caption.includes('trend') || caption.includes('over time')) return 'line';
  if (caption.includes('scatter') || caption.includes('correlation')) return 'scatter';
  if (caption.includes('pie') || caption.includes('distribution')) return 'pie';
  if (caption.includes('heatmap') || caption.includes('matrix')) return 'heatmap';
  if (caption.includes('box')) return 'box';
  return 'other';
}

// Calculate relevance score
function calculateRelevance(figure: ExtractedFigure, caption: string): number {
  let score = 0.5; // Base score
  
  // Early figures tend to be more important
  // Using id to estimate order (would be better with actual figure numbers)
  const figureOrder = parseInt(figure.id.replace(/\D/g, '')) || 1;
  if (figureOrder <= 3) {
    score += 0.2;
  }
  
  // Figures with results keywords are important
  const resultKeywords = ['result', 'performance', 'accuracy', 'comparison', 'main', 'key'];
  if (resultKeywords.some(kw => caption.includes(kw))) {
    score += 0.2;
  }
  
  // Figures showing main contributions are critical
  const criticalKeywords = ['overview', 'architecture', 'framework', 'approach'];
  if (criticalKeywords.some(kw => caption.includes(kw))) {
    score += 0.15;
  }
  
  return Math.min(1, score);
}

// Analyze tables
export async function analyzeTables(
  tables: ExtractedFigure[],
  config: VisionAnalysisConfig = DEFAULT_VISION_CONFIG
): Promise<TableAnalysis[]> {
  if (!config.enabled || !config.analyzeTables) {
    return [];
  }
  
  return tables.map((table, index) => analyzeSingleTable(table, index));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function analyzeSingleTable(table: ExtractedFigure, _index: number): TableAnalysis {
  const caption = table.caption || '';
  const caption_lower = caption.toLowerCase();
  
  // Detect table type
  let tableType: TableAnalysis['semantics']['tableType'] = 'other';
  
  if (caption_lower.includes('baseline') || caption_lower.includes('characteristic')) {
    tableType = 'baseline';
  } else if (caption_lower.includes('result') || caption_lower.includes('performance')) {
    tableType = 'results';
  } else if (caption_lower.includes('ablation')) {
    tableType = 'ablation';
  } else if (caption_lower.includes('configuration') || caption_lower.includes('hyperparameter')) {
    tableType = 'configuration';
  }
  
  // Determine importance
  const importance: TableAnalysis['importance'] = 
    tableType === 'results' ? 'critical' :
    tableType === 'baseline' ? 'important' :
    tableType === 'ablation' ? 'important' : 'supporting';
  
  return {
    id: table.id,
    tableNumber: table.id,
    caption,
    structure: {
      rowCount: 0, // Would need actual parsing
      columnCount: 0,
      hasHeader: true,
      hasSubheader: false,
      hasFooter: false,
      hasRowLabels: true
    },
    content: {
      columnHeaders: [],
      rowLabels: [],
      data: []
    },
    semantics: {
      tableType,
      comparedItems: [],
      metrics: [],
      bestValues: [],
      statisticallySignificant: []
    },
    importance,
    slideSuggestion: generateTableSlideSuggestion(tableType)
  };
}

function generateTableSlideSuggestion(tableType: TableAnalysis['semantics']['tableType']): TableAnalysis['slideSuggestion'] {
  switch (tableType) {
    case 'results':
      return {
        format: 'key-rows',
        rowsToInclude: [0, 1, 2] // Top results
      };
    case 'baseline':
      return {
        format: 'summary-only',
        highlightCells: []
      };
    case 'ablation':
      return {
        format: 'highlighted-cells',
        highlightCells: [{ row: 0, col: 0 }]
      };
    default:
      return { format: 'full-table' };
  }
}

// Full batch analysis
export async function analyzePaperWithVision(
  metadata: PaperMetadata,
  paperText: string,
  config: VisionAnalysisConfig = DEFAULT_VISION_CONFIG,
  openaiClient?: OpenAI
): Promise<BatchVisionAnalysis> {
  const analyzedAt = new Date().toISOString();
  
  // Analyze figures
  const figures = await analyzePaperFigures(metadata.figures, config, openaiClient);
  
  // Analyze tables
  const tables = await analyzeTables(metadata.tables, config);
  
  // Determine what to include in slides
  const figuresToInclude = figures.filter(f => f.includeInSlides);
  const tablesToInclude = tables.filter(t => t.importance !== 'supplementary');
  
  // Generate slide suggestions
  const suggestedVisualSlides = figuresToInclude.map(figure => ({
    figureId: figure.id,
    slideType: 'full-figure' as const,
    layout: {
      figurePosition: 'full' as const,
      figureSize: 'large' as const
    },
    content: {
      title: figure.caption.slice(0, 50),
      bulletPoints: figure.analysis.keyFindings,
      keyTakeaway: figure.analysis.keyFindings[0] || ''
    }
  }));
  
  return {
    paperId: metadata.title,
    analyzedAt,
    figures,
    tables,
    summary: {
      totalFigures: figures.length,
      totalTables: tables.length,
      criticalFigures: figures.filter(f => f.relevance.importance === 'critical').length,
      estimatedSlideCount: figuresToInclude.length + tablesToInclude.length
    },
    suggestions: {
      figuresToInclude,
      tablesToInclude,
      suggestedVisualSlides
    }
  };
}

// Generate prompts for Nano Banana based on figure analysis
export function generateNanoPromptsFromFigure(
  figure: AnalyzedFigure,
  context: {
    paperTitle: string;
    domain: string;
  }
): { recreation: string; simplified: string; highlighted: string } {
  const basePrompt = figure.analysis.description || figure.caption;
  
  return {
    recreation: `Clean, professional recreation of scientific figure: ${basePrompt}. 
      ${context.domain} research paper style. High resolution, clear labels.`,
    
    simplified: `Simplified version of: ${basePrompt}. 
      Remove clutter, emphasize key finding. Clean minimalist design.`,
    
    highlighted: `Scientific figure with key elements highlighted: ${basePrompt}. 
      Use arrows and annotations to emphasize main finding. 
      ${context.domain} presentation style.`
  };
}

// Extract data from chart (placeholder)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function extractChartData(_figure: AnalyzedFigure): unknown | null {
  // This would use computer vision to extract actual data points
  // For now, return null
  return null;
}

// Reconstruct chart data
export function reconstructChart(
  figure: AnalyzedFigure,
  extractedData: unknown
): { type: string; config: unknown } | null {
  if (!figure.analysis.chartType) return null;
  
  return {
    type: figure.analysis.chartType,
    config: {
      data: extractedData,
      layout: {
        title: figure.caption,
        xaxis: figure.analysis.axes?.x,
        yaxis: figure.analysis.axes?.y
      }
    }
  };
}
