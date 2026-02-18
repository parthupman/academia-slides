// Community Templates Marketplace
// Users can share and discover templates

import { SmartTemplate } from './smart-templates';

export interface CommunityTemplate {
  id: string;
  
  // Basic info
  name: string;
  description: string;
  longDescription?: string;
  
  // The actual template data
  template: SmartTemplate;
  
  // Author
  author: CommunityAuthor;
  
  // Categorization
  category: TemplateCategory;
  tags: string[];
  domains: string[]; // Academic domains this works for
  
  // Stats
  stats: CommunityTemplateStats;
  
  // Reviews
  reviews: TemplateReview[];
  
  // Versions
  versions: TemplateVersion[];
  currentVersion: string;
  
  // Pricing/Access
  pricing: {
    type: 'free' | 'freemium' | 'premium';
    price?: number; // If premium, in credits or $
    previewAvailable: boolean;
  };
  
  // Status
  status: 'draft' | 'pending' | 'approved' | 'featured' | 'removed';
  
  // Metadata
  metadata: {
    createdAt: string;
    updatedAt: string;
    approvedAt?: string;
    featuredAt?: string;
    moderationNotes?: string;
  };
}

export interface CommunityAuthor {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  institution?: string;
  title?: string; // "Prof.", "Dr.", etc.
  
  // Reputation
  reputation: {
    score: number;
    level: 'new' | 'established' | 'expert' | 'master';
    badges: AuthorBadge[];
  };
  
  // Stats
  stats: {
    templatesCreated: number;
    totalDownloads: number;
    totalRatings: number;
    averageRating: number;
    followers: number;
  };
  
  // Verification
  verified: boolean;
  verifiedInstitution?: string;
}

export interface AuthorBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

export interface CommunityTemplateStats {
  downloads: number;
  views: number;
  likes: number;
  saves: number; // Users who saved to their library
  
  // Ratings
  rating: number; // 1-5
  ratingCount: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  
  // Quality metrics
  completionRate: number; // % of users who successfully used it
  avgGenerationTime: number;
  
  // Trends
  downloadsThisWeek: number;
  downloadsThisMonth: number;
  trending: 'up' | 'stable' | 'down';
}

export interface TemplateReview {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  title: string;
  content: string;
  
  // Review metadata
  helpful: number; // Number of people who found this helpful
  reported: boolean;
  
  // Context
  usedFor: string; // What paper/conference they used it for
  domain: string;
  
  // Timestamp
  createdAt: string;
  updatedAt?: string;
}

export interface TemplateVersion {
  version: string;
  changelog: string;
  updatedAt: string;
  updatedBy: string;
  
  // Changes
  changes: {
    type: 'added' | 'removed' | 'changed' | 'fixed';
    description: string;
  }[];
  
  // Stats for this version
  downloads: number;
  rating: number;
}

export type TemplateCategory = 
  | 'conference'
  | 'journal-club'
  | 'defense'
  | 'seminar'
  | 'poster'
  | 'webinar'
  | 'keynote'
  | 'lightning-talk'
  | 'workshop';

// Marketplace browsing
export interface MarketplaceFilters {
  category?: TemplateCategory;
  domain?: string;
  rating?: number; // Min rating
  price?: 'free' | 'premium' | 'all';
  sort: 'popular' | 'newest' | 'rating' | 'trending';
  tags?: string[];
}

export interface MarketplaceListing {
  templates: CommunityTemplate[];
  totalCount: number;
  filters: MarketplaceFilters;
  
  // Facets for filtering
  facets: {
    categories: { name: string; count: number }[];
    domains: { name: string; count: number }[];
    tags: { name: string; count: number }[];
    priceRanges: { name: string; count: number }[];
  };
}

// Featured collections
export interface TemplateCollection {
  id: string;
  name: string;
  description: string;
  curator: CommunityAuthor;
  templates: CommunityTemplate[];
  
  metadata: {
    createdAt: string;
    updatedAt: string;
    featured: boolean;
  };
}

// User interactions
export interface UserTemplateInteractions {
  downloaded: string[]; // Template IDs
  saved: string[];
  rated: { templateId: string; rating: number }[];
  reviewed: string[];
  created: string[];
  
  // Preferences for recommendations
  preferences: {
    favoriteDomains: string[];
    favoriteCategories: TemplateCategory[];
    favoriteAuthors: string[];
  };
}

// Template submission
export interface TemplateSubmission {
  name: string;
  description: string;
  longDescription?: string;
  category: TemplateCategory;
  tags: string[];
  domains: string[];
  
  // The template
  template: SmartTemplate;
  
  // Submission info
  submitterNotes?: string;
  
  // Pricing
  pricing: {
    type: 'free' | 'premium';
    price?: number;
  };
}

// Monetization
export interface CreatorEarnings {
  creatorId: string;
  totalEarnings: number;
  pendingPayout: number;
  
  // Breakdown
  byTemplate: {
    templateId: string;
    templateName: string;
    earnings: number;
    downloads: number;
  }[];
  
  // History
  monthlyEarnings: {
    month: string;
    amount: number;
    downloads: number;
  }[];
}

// Leaderboards
export interface CreatorLeaderboard {
  period: 'week' | 'month' | 'year' | 'all-time';
  category: 'downloads' | 'ratings' | 'revenue' | 'new-templates';
  
  entries: {
    rank: number;
    author: CommunityAuthor;
    score: number;
    change: number; // Change in rank from previous period
  }[];
}

// Featured template rotations
export interface FeaturedTemplates {
  hero: CommunityTemplate; // Main featured
  staffPicks: CommunityTemplate[];
  trending: CommunityTemplate[];
  newAndNotable: CommunityTemplate[];
  forYou: CommunityTemplate[]; // Personalized
}

// Search
export interface TemplateSearchRequest {
  query: string;
  filters?: MarketplaceFilters;
  limit: number;
  offset: number;
}

export interface TemplateSearchResponse {
  results: CommunityTemplate[];
  totalCount: number;
  suggestions: string[]; // "Did you mean?"
  relatedQueries: string[];
}
