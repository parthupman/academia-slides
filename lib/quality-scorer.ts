/* eslint-disable @typescript-eslint/no-unused-vars */
import { 
  QualityScore, 
  QualityCategories, 
  QualityIssue, 
  ImprovementSuggestion,
  QualityAssessment,
  SlideQualityScore,
  QualityReport
} from '@/types/quality';
import { EnhancedSlide, PaperMetadata } from '@/types/enhanced';
import { UserSettings } from '@/types/settings';

// Main scoring function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function scorePresentation(
  slides: EnhancedSlide[],
  paperText: string,
  metadata: PaperMetadata,
  _settings: UserSettings
): Promise<QualityScore> {
  const categories = await scoreCategories(slides, paperText, metadata);
  const slideScores = scoreSlides(slides);
  const issues = identifyIssues(slides, paperText, metadata);
  const suggestions = generateSuggestions(slides, issues, categories);
  const assessment = generateAssessment(categories, issues);
  
  const overall = Math.round(
    Object.values(categories).reduce((a, b) => a + b, 0) / Object.keys(categories).length
  );
  
  return {
    overall,
    version: '1.0',
    timestamp: new Date().toISOString(),
    categories,
    slideScores,
    assessment,
    issues,
    suggestions
  };
}

// Score each category
async function scoreCategories(
  slides: EnhancedSlide[],
  paperText: string,
  metadata: PaperMetadata
): Promise<QualityCategories> {
  // Completeness: Does it cover key paper elements?
  const completeness = scoreCompleteness(slides, metadata);
  
  // Accuracy: Does it accurately reflect the paper?
  const accuracy = scoreAccuracy(slides, paperText);
  
  // Clarity: Is it easy to understand?
  const clarity = scoreClarity(slides);
  
  // Structure: Is the flow logical?
  const structure = scoreStructure(slides);
  
  // Visual appeal: Design quality
  const visualAppeal = scoreVisualAppeal(slides);
  
  // Engagement: Will it hold attention?
  const engagement = scoreEngagement(slides);
  
  // Technical: Errors, formatting
  const technical = scoreTechnical(slides);
  
  return {
    completeness,
    accuracy,
    clarity,
    structure,
    visualAppeal,
    engagement,
    technical
  };
}

function scoreCompleteness(slides: EnhancedSlide[], metadata: PaperMetadata): number {
  let score = 100;
  
  // Check for title slide
  if (!slides.some(s => s.layout === 'title')) {
    score -= 15;
  }
  
  // Check for key sections
  const hasIntroduction = slides.some(s => 
    s.title.toLowerCase().includes('intro') || 
    s.title.toLowerCase().includes('background')
  );
  if (!hasIntroduction) score -= 10;
  
  const hasMethods = slides.some(s => 
    s.title.toLowerCase().includes('method') ||
    s.title.toLowerCase().includes('approach')
  );
  if (!hasMethods) score -= 10;
  
  const hasResults = slides.some(s => 
    s.title.toLowerCase().includes('result') ||
    s.title.toLowerCase().includes('finding')
  );
  if (!hasResults) score -= 10;
  
  const hasConclusion = slides.some(s => 
    s.title.toLowerCase().includes('conclusion') ||
    s.title.toLowerCase().includes('summary')
  );
  if (!hasConclusion) score -= 10;
  
  // Check if key findings are covered
  if (metadata.abstract) {
    const abstractKeywords = extractKeywords(metadata.abstract);
    const slideText = slides.map(s => s.content.join(' ')).join(' ');
    const coverage = abstractKeywords.filter(kw => 
      slideText.toLowerCase().includes(kw.toLowerCase())
    ).length / abstractKeywords.length;
    
    if (coverage < 0.5) score -= 15;
    else if (coverage < 0.7) score -= 5;
  }
  
  return Math.max(0, score);
}

function scoreAccuracy(slides: EnhancedSlide[], paperText: string): number {
  let score = 100;
  
  // Check for claims not supported by paper
  const paperLower = paperText.toLowerCase();
  
  slides.forEach(slide => {
    const content = slide.content.join(' ').toLowerCase();
    
    // Check for specific numbers that might be wrong
    const numbers = content.match(/\d+\.?\d*/g) || [];
    numbers.forEach(num => {
      // If number appears in slide but not in paper, flag it
      if (!paperLower.includes(num)) {
        score -= 2; // Small penalty per questionable number
      }
    });
  });
  
  // Check citations match
  const paperCitations: string[] = paperText.match(/\[\d+\]/g) || [];
  const slideCitations: string[] = slides.flatMap(s => s.content.join(' ').match(/\[\d+\]/g) || []);
  
  const invalidCitations = slideCitations.filter(c => !paperCitations.includes(c));
  score -= invalidCitations.length * 5;
  
  return Math.max(0, score);
}

function scoreClarity(slides: EnhancedSlide[]): number {
  let score = 100;
  
  slides.forEach(slide => {
    const content = slide.content.join(' ');
    
    // Check sentence length (long sentences = less clear)
    const sentences = content.split(/[.!?]+/);
    const avgLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    
    if (avgLength > 25) score -= 5;
    else if (avgLength > 20) score -= 2;
    
    // Check jargon density (too much jargon = less clear)
    const words = content.split(/\s+/);
    const longWords = words.filter(w => w.length > 12).length;
    const jargonDensity = longWords / words.length;
    
    if (jargonDensity > 0.3) score -= 5;
    
    // Check bullet point length
    slide.content.forEach(bullet => {
      if (bullet.length > 150) score -= 2;
    });
  });
  
  return Math.max(0, score);
}

function scoreStructure(slides: EnhancedSlide[]): number {
  let score = 100;
  
  // Check logical flow
  const slideTypes = slides.map(s => s.layout);
  
  // Title should be first
  if (slideTypes[0] !== 'title') score -= 10;
  
  // Should have logical progression
  // Check based on slide titles for section detection
  const slideTitles = slides.map(s => s.title.toLowerCase());
  
  const resultsIndex = slideTitles.findIndex(t => t.includes('result') || t.includes('findings'));
  const methodsIndex = slideTitles.findIndex(t => t.includes('method') || t.includes('approach'));
  
  if (resultsIndex !== -1 && methodsIndex !== -1 && resultsIndex < methodsIndex) {
    score -= 15; // Results come before methods - illogical flow
  }
  
  // Check for transitions between major sections
  // (Would need more sophisticated analysis)
  
  return Math.max(0, score);
}

function scoreVisualAppeal(slides: EnhancedSlide[]): number {
  let score = 100;
  
  // Check visual variety
  const layouts = new Set(slides.map(s => s.layout));
  if (layouts.size < 3) score -= 10;
  
  // Check for text-heavy slides
  const textHeavySlides = slides.filter(s => 
    s.content.join(' ').length > 500 && !s.figure
  ).length;
  
  if (textHeavySlides > slides.length * 0.3) score -= 15;
  
  // Check for visual elements
  const slidesWithVisuals = slides.filter(s => 
    s.figure || s.layout === 'figure' || s.layout === 'chart' || s.layout === 'diagram'
  ).length;
  
  const visualRatio = slidesWithVisuals / slides.length;
  if (visualRatio < 0.2) score -= 10;
  
  return Math.max(0, score);
}

function scoreEngagement(slides: EnhancedSlide[]): number {
  let score = 100;
  
  // Check for compelling titles
  const boringTitles = slides.filter(s => {
    const title = s.title.toLowerCase();
    return title === 'introduction' || 
           title === 'results' || 
           title === 'conclusion';
  }).length;
  
  if (boringTitles > slides.length * 0.5) score -= 10;
  
  // Check for questions or hooks
  const hasHooks = slides.some(s => 
    s.title.includes('?') || 
    s.content.some(c => c.includes('?'))
  );
  
  if (!hasHooks) score -= 5;
  
  return Math.max(0, score);
}

function scoreTechnical(slides: EnhancedSlide[]): number {
  let score = 100;
  
  // Check for formatting issues
  slides.forEach(slide => {
    slide.content.forEach(bullet => {
      // Check for inconsistent punctuation
      if (bullet.includes('  ')) score -= 1; // Double spaces
      
      // Check for very long words (possible errors)
      const words = bullet.split(/\s+/);
      words.forEach(word => {
        if (word.length > 20) score -= 1;
      });
    });
  });
  
  return Math.max(0, score);
}

// Score individual slides
function scoreSlides(slides: EnhancedSlide[]): SlideQualityScore[] {
  return slides.map((slide, index) => {
    const contentLength = slide.content.join(' ').length;
    const bulletCount = slide.content.length;
    
    return {
      slideId: slide.id.toString(),
      slideNumber: index + 1,
      overall: 80, // Base score
      contentDensity: contentLength > 400 ? 'too-dense' : 
                      contentLength < 100 ? 'too-sparse' : 'good',
      visualTextBalance: slide.figure ? 'balanced' : 
                         contentLength > 300 ? 'text-heavy' : 'balanced',
      issues: [],
      suggestions: bulletCount > 6 ? ['Consider splitting into two slides'] : []
    };
  });
}

// Identify specific issues
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function identifyIssues(
  slides: EnhancedSlide[],
  _paperText: string,
  _metadata: PaperMetadata
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  
  // Check for missing key sections
  const sectionTitles = slides.map(s => s.title.toLowerCase());
  
  if (!sectionTitles.some(t => t.includes('intro') || t.includes('background'))) {
    issues.push({
      id: 'missing-intro',
      category: 'completeness',
      severity: 'major',
      title: 'Missing Introduction',
      description: 'No clear introduction or background section found',
      affectedSlides: [],
      fixSuggestion: 'Add a slide introducing the problem and motivation',
      autoFixable: false
    });
  }
  
  // Check for text-heavy slides
  slides.forEach((slide, index) => {
    const contentLength = slide.content.join(' ').length;
    if (contentLength > 600) {
      issues.push({
        id: `text-heavy-${index}`,
        category: 'visualAppeal',
        severity: 'minor',
        title: 'Text-Heavy Slide',
        description: `Slide ${index + 1} has ${contentLength} characters of text`,
        affectedSlides: [slide.id.toString()],
        fixSuggestion: 'Split content into bullet points or add a visual',
        autoFixable: true,
        pattern: 'content_density_high'
      });
    }
  });
  
  return issues;
}

// Generate improvement suggestions
function generateSuggestions(
  slides: EnhancedSlide[],
  issues: QualityIssue[],
  categories: QualityCategories
): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];
  
  // Completeness suggestions
  if (categories.completeness < 80) {
    suggestions.push({
      id: 'add-missing-sections',
      category: 'completeness',
      priority: 'high',
      title: 'Add Missing Sections',
      description: 'Key sections appear to be missing from the presentation',
      action: {
        type: 'add-content',
        description: 'Generate slides for missing standard sections'
      },
      effort: 'substantial',
      impact: 'high',
      autoImplementable: true
    });
  }
  
  // Clarity suggestions
  if (categories.clarity < 75) {
    suggestions.push({
      id: 'simplify-language',
      category: 'clarity',
      priority: 'high',
      title: 'Simplify Language',
      description: 'Some slides have overly complex language',
      action: {
        type: 'reword',
        description: 'Rewrite complex sentences for clarity'
      },
      effort: 'moderate',
      impact: 'high',
      autoImplementable: true
    });
  }
  
  // Visual suggestions
  if (categories.visualAppeal < 70) {
    suggestions.push({
      id: 'add-visuals',
      category: 'visualAppeal',
      priority: 'medium',
      title: 'Add More Visuals',
      description: 'Presentation is text-heavy',
      action: {
        type: 'add-visual',
        description: 'Generate diagrams and charts for key concepts'
      },
      effort: 'substantial',
      impact: 'medium',
      autoImplementable: false
    });
  }
  
  return suggestions;
}

// Generate overall assessment
function generateAssessment(
  categories: QualityCategories,
  issues: QualityIssue[]
): QualityAssessment {
  const avg = Object.values(categories).reduce((a, b) => a + b, 0) / Object.keys(categories).length;
  
  let grade: QualityAssessment['grade'];
  if (avg >= 95) grade = 'A+';
  else if (avg >= 90) grade = 'A';
  else if (avg >= 85) grade = 'A-';
  else if (avg >= 80) grade = 'B+';
  else if (avg >= 75) grade = 'B';
  else if (avg >= 70) grade = 'B-';
  else if (avg >= 65) grade = 'C+';
  else if (avg >= 60) grade = 'C';
  else grade = 'C-';
  
  let readiness: QualityAssessment['readiness'];
  if (avg >= 85) readiness = 'presentation-ready';
  else if (avg >= 70) readiness = 'minor-edits-needed';
  else if (avg >= 55) readiness = 'significant-revision-needed';
  else readiness = 'needs-redo';
  
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const majorIssues = issues.filter(i => i.severity === 'major').length;
  
  let summary: string;
  if (avg >= 85) {
    summary = `Excellent presentation (${grade}). Ready to present with minimal changes.`;
  } else if (avg >= 70) {
    summary = `Good presentation (${grade}). ${majorIssues} major improvements suggested.`;
  } else {
    summary = `Needs work (${grade}). ${criticalIssues + majorIssues} significant issues to address.`;
  }
  
  return {
    summary,
    grade,
    readiness,
    targetAudience: 'general academic',
    estimatedPresentationTime: Math.round(Object.keys(categories).length * 0.8)
  };
}

// Helper: Extract keywords from text
function extractKeywords(text: string): string[] {
  // Simple keyword extraction
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 4);
  
  const frequency: Record<string, number> = {};
  words.forEach(w => {
    frequency[w] = (frequency[w] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

// Generate quality report
export function generateQualityReport(score: QualityScore): QualityReport {
  const strengths = Object.entries(score.categories)
    .filter(([, value]) => value >= 85)
    .map(([category]) => category);
  
  const improvements = score.suggestions
    .filter(s => s.priority === 'high')
    .map(s => s.title);
  
  const actionItems = score.suggestions.map(s => ({
    id: s.id,
    description: s.title,
    priority: s.priority,
    effort: s.effort,
    category: s.category,
    completed: false
  }));
  
  const radarChartData = Object.entries(score.categories).map(([category, value]) => ({
    category,
    score: value,
    benchmark: 75 // Domain average
  }));
  
  return {
    score,
    executiveSummary: score.assessment.summary,
    topStrengths: strengths,
    topImprovements: improvements,
    actionItems,
    radarChartData
  };
}

// Auto-improve presentation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function autoImprovePresentation(
  slides: EnhancedSlide[],
  score: QualityScore,
  _settings: UserSettings
): Promise<EnhancedSlide[]> {
  const improved = [...slides];
  
  // Apply auto-fixable improvements
  for (const suggestion of score.suggestions) {
    if (!suggestion.autoImplementable) continue;
    
    switch (suggestion.action.type) {
      case 'reword':
        // Simplify complex language
        break;
      case 'add-content':
      case 'remove-content':
      case 'restructure':
      case 'add-visual':
      case 'improve-visual':
      case 'fix-technical':
        // TODO: Implement auto-improvements
        break;
    }
  }
  
  return improved;
}
