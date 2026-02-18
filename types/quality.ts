// Quality Scoring & Auto-Improvement System
// Evaluates generated presentations and suggests improvements

export interface QualityScore {
  overall: number; // 0-100
  version: string; // Algorithm version
  timestamp: string;
  
  // Category scores
  categories: QualityCategories;
  
  // Per-slide scores
  slideScores: SlideQualityScore[];
  
  // Overall assessment
  assessment: QualityAssessment;
  
  // Specific issues found
  issues: QualityIssue[];
  
  // Improvement suggestions
  suggestions: ImprovementSuggestion[];
  
  // Comparison to benchmarks
  benchmarks?: BenchmarkComparison;
}

export interface QualityCategories {
  completeness: number;    // 0-100: Are all key points covered?
  accuracy: number;        // 0-100: Does it match the paper?
  clarity: number;         // 0-100: Easy to understand?
  structure: number;       // 0-100: Logical flow?
  visualAppeal: number;    // 0-100: Good design?
  engagement: number;      // 0-100: Interesting to audience?
  technical: number;       // 0-100: Proper formatting, no errors?
}

export interface SlideQualityScore {
  slideId: string;
  slideNumber: number;
  overall: number;
  
  // Specific metrics
  contentDensity: 'too-sparse' | 'good' | 'too-dense';
  visualTextBalance: 'text-heavy' | 'balanced' | 'visual-heavy';
  
  // Issues on this slide
  issues: SlideSpecificIssue[];
  
  // Suggestions
  suggestions: string[];
}

export interface SlideSpecificIssue {
  type: 'content' | 'visual' | 'structure' | 'technical';
  severity: 'critical' | 'warning' | 'suggestion';
  description: string;
  autoFixable: boolean;
  fixAction?: AutoFixAction;
}

export interface AutoFixAction {
  type: 'reword' | 'shorten' | 'split' | 'add-visual' | 'reformat' | 'reorder';
  description: string;
  confidence: number;
}

export interface QualityAssessment {
  summary: string; // "Good overall, needs visual improvements"
  grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';
  readiness: 'presentation-ready' | 'minor-edits-needed' | 'significant-revision-needed' | 'needs-redo';
  targetAudience: string;
  estimatedPresentationTime: number; // minutes
}

export interface QualityIssue {
  id: string;
  category: keyof QualityCategories;
  severity: 'critical' | 'major' | 'minor' | 'info';
  title: string;
  description: string;
  affectedSlides: string[];
  
  // How to fix
  fixSuggestion: string;
  autoFixable: boolean;
  
  // Learning data
  pattern?: string; // For ML training
}

export interface ImprovementSuggestion {
  id: string;
  category: keyof QualityCategories;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  
  // Implementation
  action: SuggestedAction;
  effort: 'quick' | 'moderate' | 'substantial';
  impact: 'high' | 'medium' | 'low';
  
  // AI can do it?
  autoImplementable: boolean;
}

export interface SuggestedAction {
  type: 'add-content' | 'remove-content' | 'restructure' | 'add-visual' | 'improve-visual' | 'reword' | 'fix-technical';
  description: string;
  targetSlides?: string[];
  newContent?: string;
}

export interface BenchmarkComparison {
  // How does this compare to similar presentations?
  similarPapers: {
    paperType: string;
    averageScore: number;
    thisScore: number;
    percentile: number;
  };
  
  // Historical performance
  userAverage: number;
  improvement: 'better' | 'similar' | 'worse';
  
  // Domain-specific
  domainAverage: number;
  domainPercentile: number;
}

// Quality thresholds
export const QUALITY_THRESHOLDS = {
  excellent: 90,
  good: 75,
  acceptable: 60,
  poor: 40,
  unacceptable: 0
};

// Auto-improvement settings
export interface AutoImproveSettings {
  enabled: boolean;
  threshold: number; // Auto-improve if score below this
  maxIterations: number; // Don't loop forever
  
  // What to auto-improve
  autoFixContent: boolean;
  autoFixVisuals: boolean;
  autoFixStructure: boolean;
  autoFixTechnical: boolean;
  
  // Confirmation required?
  confirmChanges: boolean;
}

export const DEFAULT_AUTO_IMPROVE_SETTINGS: AutoImproveSettings = {
  enabled: true,
  threshold: 75,
  maxIterations: 3,
  autoFixContent: true,
  autoFixVisuals: false, // Usually needs human input
  autoFixStructure: true,
  autoFixTechnical: true,
  confirmChanges: true
};

// Quality report for users
export interface QualityReport {
  score: QualityScore;
  executiveSummary: string;
  topStrengths: string[];
  topImprovements: string[];
  actionItems: ActionItem[];
  
  // Visual summary
  radarChartData: RadarChartPoint[];
  trendData?: TrendPoint[]; // If regenerating
}

export interface ActionItem {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'quick' | 'moderate' | 'substantial';
  category: string;
  completed: boolean;
}

export interface RadarChartPoint {
  category: string;
  score: number;
  benchmark: number; // Domain average
}

export interface TrendPoint {
  iteration: number;
  overallScore: number;
  timestamp: string;
}

// Quality metrics history for learning
export interface QualityMetricsHistory {
  generations: {
    timestamp: string;
    paperDomain: string;
    paperLength: number;
    settings: unknown;
    qualityScore: QualityScore;
    userFeedback?: number; // User rating after presentation
  }[];
  
  // What works best
  insights: {
    bestSettingsForDomain: Record<string, unknown>;
    commonIssues: { issue: string; frequency: number }[];
    improvementTrend: 'improving' | 'stable' | 'needs-attention';
  };
}

// Scoring rubric for transparency
export interface ScoringRubric {
  category: string;
  maxPoints: number;
  criteria: {
    description: string;
    points: number;
    howToEvaluate: string;
  }[];
}

export const QUALITY_RUBRICS: ScoringRubric[] = [
  {
    category: 'Completeness',
    maxPoints: 100,
    criteria: [
      { description: 'All major contributions covered', points: 30, howToEvaluate: 'Check against paper contributions' },
      { description: 'Key results included', points: 25, howToEvaluate: 'Verify main experimental results present' },
      { description: 'Methodology explained', points: 20, howToEvaluate: 'Check for approach overview' },
      { description: 'Related work mentioned', points: 15, howToEvaluate: 'Context slide present' },
      { description: 'Limitations acknowledged', points: 10, howToEvaluate: 'Limitations or future work slide' }
    ]
  },
  {
    category: 'Clarity',
    maxPoints: 100,
    criteria: [
      { description: 'Language appropriate for audience', points: 25, howToEvaluate: 'Check jargon level' },
      { description: 'Logical flow between slides', points: 25, howToEvaluate: 'Review transition quality' },
      { description: 'Key message per slide is clear', points: 25, howToEvaluate: 'Each slide has one main point' },
      { description: 'Visuals support understanding', points: 25, howToEvaluate: 'Images/diagrams are helpful' }
    ]
  }
];
