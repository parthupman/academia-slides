// User Feedback System Types
// Collects feedback to continuously improve AI generation

export interface FeedbackData {
  id: string;
  timestamp: string;
  userId?: string;
  
  // What was generated
  presentationId: string;
  paperMetadata: {
    title: string;
    domain: string;
    wordCount: number;
  };
  
  // Overall rating
  overallRating: 1 | 2 | 3 | 4 | 5;
  
  // Specific feedback per slide
  slideFeedback: SlideFeedback[];
  
  // Categorical feedback
  categories: FeedbackCategories;
  
  // Optional corrections
  corrections?: UserCorrection[];
  
  // Improvement suggestions
  suggestions?: string;
  
  // Would use again?
  wouldRecommend: boolean;
  
  // Comparison to manual creation
  timeSaved?: 'none' | 'some' | 'significant' | 'massive';
}

export interface SlideFeedback {
  slideId: string;
  slideNumber: number;
  slideType: string;
  
  // Ratings
  contentAccuracy: 1 | 2 | 3 | 4 | 5;  // Did it capture key points?
  clarity: 1 | 2 | 3 | 4 | 5;          // Easy to understand?
  visualAppeal: 1 | 2 | 3 | 4 | 5;     // Looks good?
  
  // Issues
  issues?: SlideIssue[];
  
  // Specific comments
  comment?: string;
}

export type SlideIssue = 
  | 'missing-key-point'
  | 'wrong-emphasis'
  | 'too-much-text'
  | 'too-little-text'
  | 'poor-visual'
  | 'incorrect-fact'
  | 'bad-layout'
  | 'unclear-message'
  | 'technical-error'
  | 'formatting-issue';

export interface FeedbackCategories {
  contentQuality: 1 | 2 | 3 | 4 | 5;
  visualDesign: 1 | 2 | 3 | 4 | 5;
  structure: 1 | 2 | 3 | 4 | 5;
  accuracy: 1 | 2 | 3 | 4 | 5;
  usefulness: 1 | 2 | 3 | 4 | 5;
}

export interface UserCorrection {
  slideId: string;
  originalContent: string;
  correctedContent: string;
  correctionType: 'addition' | 'deletion' | 'rewording' | 'restructuring';
}

// Aggregated feedback for analysis
export interface FeedbackAggregate {
  totalFeedbacks: number;
  averageRating: number;
  
  // By category
  byCategory: {
    [category: string]: {
      average: number;
      count: number;
      trend: 'improving' | 'stable' | 'declining';
    };
  };
  
  // Common issues
  topIssues: {
    issue: SlideIssue;
    count: number;
    percentage: number;
  }[];
  
  // By domain
  byDomain: {
    [domain: string]: {
      averageRating: number;
      count: number;
    };
  };
  
  // Temporal trends
  last30Days: {
    date: string;
    averageRating: number;
    count: number;
  }[];
}

// Feedback-based improvements
export interface FeedbackDrivenImprovement {
  id: string;
  type: 'prompt-update' | 'template-update' | 'feature-addition' | 'bug-fix';
  description: string;
  triggeredBy: {
    feedbackPattern: string;
    occurrenceCount: number;
  };
  implemented: boolean;
  implementedAt?: string;
  impact?: {
    beforeRating: number;
    afterRating: number;
  };
}

// Few-shot examples from good feedback
export interface QualityExample {
  id: string;
  paperExcerpt: string;
  generatedSlides: unknown; // The good example
  domain: string;
  rating: number;
  whyItWorks: string;
  useInTraining: boolean;
}

// Feedback collection UI config
export interface FeedbackUIConfig {
  enablePerSlideFeedback: boolean;
  enableCategoryRatings: boolean;
  enableCorrections: boolean;
  enableSuggestions: boolean;
  showAggregateStats: boolean;
  incentivizeFeedback: boolean; // Offer credits/discounts
}

export const DEFAULT_FEEDBACK_CONFIG: FeedbackUIConfig = {
  enablePerSlideFeedback: true,
  enableCategoryRatings: true,
  enableCorrections: true,
  enableSuggestions: true,
  showAggregateStats: false,
  incentivizeFeedback: true
};

// Issue type labels for UI
export const ISSUE_TYPE_LABELS: Record<SlideIssue, { label: string; icon: string }> = {
  'missing-key-point': { label: 'Missing Key Point', icon: 'alert-circle' },
  'wrong-emphasis': { label: 'Wrong Emphasis', icon: 'align-left' },
  'too-much-text': { label: 'Too Much Text', icon: 'type' },
  'too-little-text': { label: 'Too Little Text', icon: 'minus' },
  'poor-visual': { label: 'Poor Visual', icon: 'image' },
  'incorrect-fact': { label: 'Incorrect Fact', icon: 'x-circle' },
  'bad-layout': { label: 'Bad Layout', icon: 'layout' },
  'unclear-message': { label: 'Unclear Message', icon: 'help-circle' },
  'technical-error': { label: 'Technical Error', icon: 'alert-triangle' },
  'formatting-issue': { label: 'Formatting Issue', icon: 'settings' }
};
