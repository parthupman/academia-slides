/* eslint-disable @typescript-eslint/no-unused-vars */
import { 
  FeedbackData, 
  FeedbackAggregate, 
  QualityExample,
  DEFAULT_FEEDBACK_CONFIG 
} from '@/types/feedback';
import { AIService } from '@/types/services';

const FEEDBACK_STORAGE_KEY = 'academia-feedback-history';
const FEEDBACK_CONFIG_KEY = 'academia-feedback-config';

// Save feedback
export function saveFeedback(feedback: FeedbackData): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getFeedbackHistory();
    existing.push(feedback);
    
    // Keep only last 100 feedbacks
    if (existing.length > 100) {
      existing.shift();
    }
    
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    console.error('Failed to save feedback');
  }
}

// Get feedback history
export function getFeedbackHistory(): FeedbackData[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Get feedback config
export function getFeedbackConfig() {
  if (typeof window === 'undefined') return DEFAULT_FEEDBACK_CONFIG;
  
  try {
    const stored = localStorage.getItem(FEEDBACK_CONFIG_KEY);
    return stored ? { ...DEFAULT_FEEDBACK_CONFIG, ...JSON.parse(stored) } : DEFAULT_FEEDBACK_CONFIG;
  } catch {
    return DEFAULT_FEEDBACK_CONFIG;
  }
}

// Aggregate feedback for analysis
export function aggregateFeedback(): FeedbackAggregate {
  const feedbacks = getFeedbackHistory();
  
  if (feedbacks.length === 0) {
    return {
      totalFeedbacks: 0,
      averageRating: 0,
      byCategory: {},
      topIssues: [],
      byDomain: {},
      last30Days: []
    };
  }
  
  // Calculate averages
  const totalRating = feedbacks.reduce((sum, f) => sum + f.overallRating, 0);
  const averageRating = totalRating / feedbacks.length;
  
  // By category
  const categoryTotals: Record<string, { total: number; count: number }> = {};
  feedbacks.forEach(f => {
    Object.entries(f.categories).forEach(([cat, rating]) => {
      if (!categoryTotals[cat]) categoryTotals[cat] = { total: 0, count: 0 };
      categoryTotals[cat].total += rating;
      categoryTotals[cat].count++;
    });
  });
  
  const byCategory: FeedbackAggregate['byCategory'] = {};
  Object.entries(categoryTotals).forEach(([cat, data]) => {
    byCategory[cat] = {
      average: data.total / data.count,
      count: data.count,
      trend: 'stable' // Would need historical data to calculate
    };
  });
  
  // Top issues
  const issueCounts: Record<string, number> = {};
  feedbacks.forEach(f => {
    f.slideFeedback.forEach(sf => {
      sf.issues?.forEach(issue => {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      });
    });
  });
  
  const topIssues = Object.entries(issueCounts)
    .map(([issue, count]) => ({
      issue: issue as never,
      count,
      percentage: (count / feedbacks.length) * 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // By domain
  const domainData: Record<string, { total: number; count: number }> = {};
  feedbacks.forEach(f => {
    const domain = f.paperMetadata.domain;
    if (!domainData[domain]) domainData[domain] = { total: 0, count: 0 };
    domainData[domain].total += f.overallRating;
    domainData[domain].count++;
  });
  
  const byDomain: FeedbackAggregate['byDomain'] = {};
  Object.entries(domainData).forEach(([domain, data]) => {
    byDomain[domain] = {
      averageRating: data.total / data.count,
      count: data.count
    };
  });
  
  // Last 30 days
  const last30Days: FeedbackAggregate['last30Days'] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayFeedbacks = feedbacks.filter(f => 
      f.timestamp.startsWith(dateStr)
    );
    
    last30Days.push({
      date: dateStr,
      averageRating: dayFeedbacks.length > 0
        ? dayFeedbacks.reduce((s, f) => s + f.overallRating, 0) / dayFeedbacks.length
        : 0,
      count: dayFeedbacks.length
    });
  }
  
  return {
    totalFeedbacks: feedbacks.length,
    averageRating,
    byCategory,
    topIssues,
    byDomain,
    last30Days
  };
}

// Extract quality examples from high-rated feedback
export function extractQualityExamples(): QualityExample[] {
  const feedbacks = getFeedbackHistory();
  
  return feedbacks
    .filter(f => f.overallRating >= 4) // Only good examples
    .map((f, index) => ({
      id: `example-${index}`,
      paperExcerpt: f.paperMetadata.title,
      generatedSlides: f.presentationId, // Would need to store actual slides
      domain: f.paperMetadata.domain,
      rating: f.overallRating,
      whyItWorks: 'User rated highly with no corrections',
      useInTraining: true
    }));
}

// Generate few-shot examples from feedback
export function generateFewShotExamples(domain: string, count: number = 3): string {
  const examples = extractQualityExamples()
    .filter(e => e.domain === domain)
    .slice(0, count);
  
  if (examples.length === 0) return '';
  
  return examples.map((ex, i) => `
Example ${i + 1}:
Paper: ${ex.paperExcerpt}
Result: High-quality presentation (rated ${ex.rating}/5)
Why it works: ${ex.whyItWorks}
`).join('\n---\n');
}

// Get improvement suggestions based on feedback patterns
export function getFeedbackImprovements(): {
  pattern: string;
  frequency: number;
  suggestion: string;
}[] {
  const aggregate = aggregateFeedback();
  
  const improvements: { pattern: string; frequency: number; suggestion: string }[] = [];
  
  // Check for common issues
  aggregate.topIssues.forEach(issue => {
    const suggestions: Record<string, string> = {
      'missing-key-point': 'Add explicit extraction of key contributions in prompt',
      'too-much-text': 'Implement automatic bullet point summarization',
      'poor-visual': 'Increase visual generation priority and improve prompts',
      'wrong-emphasis': 'Add emphasis weighting based on section importance',
      'unclear-message': 'Add "one key message per slide" validation'
    };
    
    if (suggestions[issue.issue]) {
      improvements.push({
        pattern: issue.issue,
        frequency: issue.count,
        suggestion: suggestions[issue.issue]
      });
    }
  });
  
  return improvements;
}

// Create feedback from AI service response
export async function createFeedbackFromAnalysis(
  presentationId: string,
  paperText: string,
  slides: unknown,
  aiService: AIService
): Promise<Partial<FeedbackData>> {
  // This would use AI to pre-populate feedback
  const analysis = await analyzeWithAI(presentationId, paperText, slides, aiService);
  
  return {
    id: `auto-${Date.now()}`,
    timestamp: new Date().toISOString(),
    presentationId,
    paperMetadata: {
      title: paperText.slice(0, 100),
      domain: 'general',
      wordCount: paperText.split(/\s+/).length
    },
    categories: {
      contentQuality: analysis.contentQuality as 1 | 2 | 3 | 4 | 5,
      visualDesign: analysis.visualDesign as 1 | 2 | 3 | 4 | 5,
      structure: analysis.structure as 1 | 2 | 3 | 4 | 5,
      accuracy: analysis.accuracy as 1 | 2 | 3 | 4 | 5,
      usefulness: analysis.usefulness as 1 | 2 | 3 | 4 | 5
    },
    overallRating: analysis.overall as 1 | 2 | 3 | 4 | 5,
    wouldRecommend: analysis.overall >= 4
  };
}

// Placeholder for AI analysis
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function analyzeWithAI(
  _presentationId: string,
  _paperText: string,
  _slides: unknown,
  _aiService: AIService
): Promise<{
  contentQuality: number;
  visualDesign: number;
  structure: number;
  accuracy: number;
  usefulness: number;
  overall: number;
}> {
  // Would actually call AI to analyze
  return {
    contentQuality: 4,
    visualDesign: 4,
    structure: 4,
    accuracy: 5,
    usefulness: 4,
    overall: 4
  };
}

// Export feedback for analysis
export function exportFeedbackForAnalysis(): string {
  const feedbacks = getFeedbackHistory();
  return JSON.stringify(feedbacks, null, 2);
}
