// Vision Model Analysis
// Understanding figures, charts, and images from papers

export interface VisionAnalysisConfig {
  enabled: boolean;
  model: 'gpt-4o-vision' | 'claude-vision' | 'gemini-vision';
  maxImagesPerPaper: number;
  
  // What to analyze
  analyzeFigures: boolean;
  analyzeTables: boolean;
  analyzeDiagrams: boolean;
  
  // Analysis depth
  depth: 'basic' | 'standard' | 'detailed';
}

// Extracted figure with analysis
export interface AnalyzedFigure {
  id: string;
  type: 'chart' | 'diagram' | 'image' | 'table' | 'equation' | 'unknown';
  
  // Source
  sourcePage: number;
  figureNumber?: string;
  caption: string;
  
  // Image data
  image: {
    url: string; // Base64 or URL
    width: number;
    height: number;
    format: 'png' | 'jpg' | 'svg';
  };
  
  // AI Analysis
  analysis: FigureAnalysis;
  
  // Extracted data
  extractedData?: ExtractedChartData | ExtractedTableData;
  
  // Relevance to paper
  relevance: {
    score: number; // 0-1
    keyFindings: string[];
    importance: 'critical' | 'important' | 'supporting' | 'optional';
  };
  
  // Should include in slides?
  includeInSlides: boolean;
  suggestedSlides: number[]; // Which slides this should appear on
}

export interface FigureAnalysis {
  // What is shown
  description: string;
  
  // Type-specific analysis
  chartType?: 'bar' | 'line' | 'scatter' | 'pie' | 'heatmap' | 'box' | 'violin' | 'area' | 'other';
  diagramType?: 'flowchart' | 'architecture' | 'timeline' | 'comparison' | 'hierarchy' | 'process' | 'other';
  
  // Content
  title?: string;
  axes?: {
    x?: { label: string; unit?: string; scale: 'linear' | 'log' | 'ordinal' | 'time' };
    y?: { label: string; unit?: string; scale: 'linear' | 'log' | 'percent' };
  };
  legend?: string[];
  series?: { name: string; color?: string; dataPoints: number }[];
  
  // Key findings from the figure
  keyFindings: string[];
  trends?: string[];
  outliers?: string[];
  comparisons?: string[];
  
  // Statistical info (for charts)
  statistics?: {
    sampleSize?: number;
    confidenceInterval?: string;
    pValue?: string;
    effectSize?: string;
  };
  
  // OCR text from image
  extractedText?: string;
}

export interface ExtractedChartData {
  type: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
    errorBars?: { min: number; max: number }[];
  }[];
  
  // Raw values for recreating
  raw: unknown;
}

export interface ExtractedTableData {
  headers: string[];
  rows: (string | number)[][];
  
  // Structure detection
  hasHeaderRow: boolean;
  hasRowHeaders: boolean;
  
  // Data types per column
  columnTypes: ('text' | 'number' | 'percentage' | 'currency' | 'date')[];
  
  // Highlighted cells (bold/best values)
  highlightedCells: { row: number; col: number; reason: string }[];
  
  // Raw
  raw: unknown;
}

// Vision-based slide generation
export interface VisionSlideSuggestion {
  figureId: string;
  slideType: 'full-figure' | 'split-with-text' | 'zoomed-region' | 'comparison';
  
  // Layout
  layout: {
    figurePosition: 'full' | 'left' | 'right' | 'top' | 'bottom';
    figureSize: 'small' | 'medium' | 'large';
  };
  
  // Content to accompany figure
  content: {
    title: string;
    bulletPoints: string[];
    keyTakeaway: string;
  };
  
  // Annotations to add
  annotations?: {
    type: 'arrow' | 'circle' | 'text' | 'highlight';
    position: { x: number; y: number };
    text?: string;
    target?: string; // What to point to
  }[];
  
  // Visual enhancements
  enhance?: {
    improveResolution: boolean;
    enhanceColors: boolean;
    addGridLines: boolean;
    simplify: boolean;
  };
}

// Table understanding
export interface TableAnalysis {
  id: string;
  tableNumber?: string;
  caption: string;
  
  // Structure
  structure: {
    rowCount: number;
    columnCount: number;
    hasHeader: boolean;
    hasSubheader: boolean;
    hasFooter: boolean;
    hasRowLabels: boolean;
  };
  
  // Content analysis
  content: {
    title?: string;
    columnHeaders: string[];
    rowLabels?: string[];
    data: (string | number)[][];
  };
  
  // Semantic understanding
  semantics: {
    tableType: 'comparison' | 'summary' | 'baseline' | 'results' | 'ablation' | 'configuration' | 'other';
    comparedItems?: string[];
    metrics?: string[];
    bestValues?: { row: number; col: number; value: string; context: string }[];
    statisticallySignificant?: { cells: { row: number; col: number }[]; indicator: string }[];
  };
  
  // Should be included?
  importance: 'critical' | 'important' | 'supporting' | 'supplementary';
  slideSuggestion?: {
    format: 'full-table' | 'key-rows' | 'highlighted-cells' | 'summary-only';
    rowsToInclude?: number[];
    highlightCells?: { row: number; col: number }[];
  };
}

// Figure generation prompts from analysis
export interface FigurePromptGeneration {
  originalFigure: AnalyzedFigure;
  
  // Generated prompts for Nano Banana
  prompts: {
    recreation: string; // Make a cleaner version
    simplification: string; // Simplified version
    highlightVersion: string; // With key elements emphasized
    alternateStyle: string; // Different visual style
  };
  
  // For data visualization
  chartConfig?: {
    type: string;
    library: 'plotly' | 'chartjs' | 'd3';
    config: unknown;
  };
}

// Batch analysis result
export interface BatchVisionAnalysis {
  paperId: string;
  analyzedAt: string;
  
  figures: AnalyzedFigure[];
  tables: TableAnalysis[];
  
  summary: {
    totalFigures: number;
    totalTables: number;
    criticalFigures: number;
    estimatedSlideCount: number;
  };
  
  suggestions: {
    figuresToInclude: AnalyzedFigure[];
    tablesToInclude: TableAnalysis[];
    suggestedVisualSlides: VisionSlideSuggestion[];
  };
}

// Vision model settings
export const DEFAULT_VISION_CONFIG: VisionAnalysisConfig = {
  enabled: true,
  model: 'gpt-4o-vision',
  maxImagesPerPaper: 20,
  analyzeFigures: true,
  analyzeTables: true,
  analyzeDiagrams: true,
  depth: 'detailed'
};

// Prompts for vision analysis
export const VISION_ANALYSIS_PROMPTS = {
  figureAnalysis: `Analyze this figure from an academic paper. Provide:
1. Type of figure (chart, diagram, image, etc.)
2. What it shows (detailed description)
3. Key findings/trends visible
4. Axes labels and units (if chart)
5. Legend contents
6. Statistical information (sample sizes, p-values, confidence intervals if visible)
7. Importance to the paper (critical/important/supporting)

Format as JSON.`,

  tableAnalysis: `Analyze this table from an academic paper. Provide:
1. Structure (rows, columns, headers)
2. Content summary
3. What is being compared
4. Best/highlighted values
5. Statistical significance indicators
6. Importance to the paper

Format as JSON.`,

  slideSuggestion: `Based on this figure, suggest how to present it in slides:
1. Slide layout (full figure vs split with text)
2. Key points to emphasize
3. Annotations that would help
4. Accompanying bullet points

Format as JSON.`
};
