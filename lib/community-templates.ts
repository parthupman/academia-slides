// Community Templates Marketplace
// Browse, share, and discover templates

import { 
  CommunityTemplate,
  MarketplaceFilters,
  MarketplaceListing,
  TemplateCollection,
  CreatorLeaderboard,
  TemplateSearchRequest,
  TemplateSearchResponse,
  FeaturedTemplates
} from '@/types/community-templates';
import { SmartTemplate } from '@/types/smart-templates';

// Storage keys
const COMMUNITY_TEMPLATES_KEY = 'academia-community-templates';
const USER_INTERACTIONS_KEY = 'academia-template-interactions';

// ============ Local Storage ============

function getStoredCommunityTemplates(): CommunityTemplate[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(COMMUNITY_TEMPLATES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.error('Failed to load community templates');
  }
  
  return [];
}

function saveCommunityTemplates(templates: CommunityTemplate[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(COMMUNITY_TEMPLATES_KEY, JSON.stringify(templates));
  } catch {
    console.error('Failed to save community templates');
  }
}

// ============ Browse & Search ============

export function browseTemplates(filters: MarketplaceFilters): MarketplaceListing {
  const allTemplates = getStoredCommunityTemplates();
  
  // Apply filters
  let filtered = allTemplates.filter(t => t.status === 'approved' || t.status === 'featured');
  
  if (filters.category) {
    filtered = filtered.filter(t => t.category === filters.category);
  }
  
  if (filters.domain) {
    filtered = filtered.filter(t => t.domains.includes(filters.domain!));
  }
  
  if (filters.rating) {
    filtered = filtered.filter(t => t.stats.rating >= filters.rating!);
  }
  
  if (filters.price === 'free') {
    filtered = filtered.filter(t => t.pricing.type === 'free');
  } else if (filters.price === 'premium') {
    filtered = filtered.filter(t => t.pricing.type === 'premium');
  }
  
  // Sort
  switch (filters.sort) {
    case 'popular':
      filtered.sort((a, b) => b.stats.downloads - a.stats.downloads);
      break;
    case 'newest':
      filtered.sort((a, b) => 
        new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
      );
      break;
    case 'rating':
      filtered.sort((a, b) => b.stats.rating - a.stats.rating);
      break;
    case 'trending':
      filtered.sort((a, b) => b.stats.downloadsThisWeek - a.stats.downloadsThisWeek);
      break;
  }
  
  // Calculate facets
  const categories = Object.entries(
    filtered.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count]) => ({ name, count }));
  
  const domains = Object.entries(
    filtered.flatMap(t => t.domains).reduce((acc, d) => {
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count]) => ({ name, count }));
  
  const tags = Object.entries(
    filtered.flatMap(t => t.tags).reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count]) => ({ name, count }));
  
  const priceRanges = [
    { name: 'Free', count: filtered.filter(t => t.pricing.type === 'free').length },
    { name: 'Premium', count: filtered.filter(t => t.pricing.type === 'premium').length }
  ];
  
  return {
    templates: filtered,
    totalCount: filtered.length,
    filters,
    facets: { categories, domains, tags, priceRanges }
  };
}

export function searchTemplates(request: TemplateSearchRequest): TemplateSearchResponse {
  const { query, filters, limit, offset } = request;
  const allTemplates = getStoredCommunityTemplates();
  
  // Search by query
  const searchLower = query.toLowerCase();
  let results = allTemplates.filter(t => 
    t.name.toLowerCase().includes(searchLower) ||
    t.description.toLowerCase().includes(searchLower) ||
    t.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
    t.domains.some(d => d.toLowerCase().includes(searchLower))
  );
  
  // Apply filters
  if (filters) {
    if (filters.category) {
      results = results.filter(t => t.category === filters.category);
    }
    if (filters.domain) {
      results = results.filter(t => t.domains.includes(filters.domain!));
    }
  }
  
  // Pagination
  const paginated = results.slice(offset, offset + limit);
  
  return {
    results: paginated,
    totalCount: results.length,
    suggestions: [], // Would suggest similar terms
    relatedQueries: [] // Would suggest related searches
  };
}

// ============ Featured Templates ============

export function getFeaturedTemplates(): FeaturedTemplates {
  const all = getStoredCommunityTemplates();
  
  const featured = all.filter(t => t.status === 'featured');
  
  // Hero: Highest rated featured template
  const hero = featured.sort((a, b) => b.stats.rating - a.stats.rating)[0] || all[0];
  
  // Staff picks: Curated by team (marked with special flag in real implementation)
  const staffPicks = featured.slice(0, 4);
  
  // Trending: Most downloads this week
  const trending = [...all]
    .sort((a, b) => b.stats.downloadsThisWeek - a.stats.downloadsThisWeek)
    .slice(0, 6);
  
  // New and notable: Recently added, highly rated
  const newAndNotable = all
    .filter(t => {
      const daysSinceCreated = (Date.now() - new Date(t.metadata.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreated < 30 && t.stats.rating >= 4;
    })
    .sort((a, b) => b.stats.rating - a.stats.rating)
    .slice(0, 6);
  
  // For you: Personalized (would use user preferences)
  const forYou = all
    .filter(t => t.stats.rating >= 4.5)
    .slice(0, 6);
  
  return {
    hero,
    staffPicks,
    trending,
    newAndNotable,
    forYou
  };
}

// ============ Template Details ============

export function getTemplateById(templateId: string): CommunityTemplate | null {
  const templates = getStoredCommunityTemplates();
  return templates.find(t => t.id === templateId) || null;
}

export function downloadTemplate(templateId: string): SmartTemplate | null {
  const template = getTemplateById(templateId);
  if (!template) return null;
  
  // Increment download count
  const templates = getStoredCommunityTemplates();
  const index = templates.findIndex(t => t.id === templateId);
  if (index !== -1) {
    templates[index].stats.downloads++;
    templates[index].stats.downloadsThisWeek++;
    templates[index].stats.downloadsThisMonth++;
    saveCommunityTemplates(templates);
  }
  
  return template.template;
}

export function rateTemplate(
  templateId: string,
  rating: number,
  review?: { title: string; content: string }
): boolean {
  const templates = getStoredCommunityTemplates();
  const index = templates.findIndex(t => t.id === templateId);
  
  if (index === -1) return false;
  
  const template = templates[index];
  
  // Update rating
  const totalRating = template.stats.rating * template.stats.ratingCount + rating;
  template.stats.ratingCount++;
  template.stats.rating = totalRating / template.stats.ratingCount;
  
  // Add review if provided
  if (review) {
    template.reviews.push({
      id: `review-${Date.now()}`,
      author: { id: 'current-user', name: 'You' },
      rating,
      title: review.title,
      content: review.content,
      helpful: 0,
      reported: false,
      usedFor: '',
      domain: '',
      createdAt: new Date().toISOString()
    });
  }
  
  saveCommunityTemplates(templates);
  return true;
}

// ============ Collections ============

export function getCollections(): TemplateCollection[] {
  // Would fetch from server
  return [];
}

export function getCollectionById(collectionId: string): TemplateCollection | null {
  const collections = getCollections();
  return collections.find(c => c.id === collectionId) || null;
}

// ============ Submit Template ============

export function submitTemplate(
  template: SmartTemplate,
  category: string,
  tags: string[],
  domains: string[],
  submitterNotes?: string
): { success: boolean; templateId?: string; error?: string } {
  const templates = getStoredCommunityTemplates();
  
  const newTemplate: CommunityTemplate = {
    id: `community-${Date.now()}`,
    name: template.name,
    description: template.description || '',
    longDescription: submitterNotes,
    template,
    author: {
      id: 'current-user',
      name: 'You',
      username: 'you',
      reputation: {
        score: 100,
        level: 'established',
        badges: []
      },
      stats: {
        templatesCreated: 1,
        totalDownloads: 0,
        totalRatings: 0,
        averageRating: 0,
        followers: 0
      },
      verified: false
    },
    category: category as never,
    tags,
    domains,
    stats: {
      downloads: 0,
      views: 0,
      likes: 0,
      saves: 0,
      rating: 0,
      ratingCount: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      completionRate: 0,
      avgGenerationTime: 0,
      downloadsThisWeek: 0,
      downloadsThisMonth: 0,
      trending: 'stable'
    },
    reviews: [],
    versions: [{
      version: '1.0.0',
      changelog: 'Initial release',
      updatedAt: new Date().toISOString(),
      updatedBy: 'you',
      changes: [{ type: 'added', description: 'Initial template' }],
      downloads: 0,
      rating: 0
    }],
    currentVersion: '1.0.0',
    pricing: {
      type: 'free',
      previewAvailable: true
    },
    status: 'pending',
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
  
  templates.push(newTemplate);
  saveCommunityTemplates(templates);
  
  return { success: true, templateId: newTemplate.id };
}

// ============ Leaderboard ============

export function getCreatorLeaderboard(
  period: 'week' | 'month' | 'year' | 'all-time'
): CreatorLeaderboard {
  // Would aggregate from all templates
  return {
    period,
    category: 'downloads',
    entries: []
  };
}

// ============ User Interactions ============

export function getUserInteractions() {
  if (typeof window === 'undefined') {
    return { downloaded: [], saved: [], rated: [], reviewed: [], created: [], preferences: { favoriteDomains: [], favoriteCategories: [], favoriteAuthors: [] } };
  }
  
  try {
    const stored = localStorage.getItem(USER_INTERACTIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.error('Failed to load user interactions');
  }
  
  return { downloaded: [], saved: [], rated: [], reviewed: [], created: [], preferences: { favoriteDomains: [], favoriteCategories: [], favoriteAuthors: [] } };
}

export function saveTemplateToLibrary(templateId: string): void {
  const interactions = getUserInteractions();
  if (!interactions.saved.includes(templateId)) {
    interactions.saved.push(templateId);
    localStorage.setItem(USER_INTERACTIONS_KEY, JSON.stringify(interactions));
  }
}

export function removeTemplateFromLibrary(templateId: string): void {
  const interactions = getUserInteractions();
  interactions.saved = interactions.saved.filter((id: string) => id !== templateId);
  localStorage.setItem(USER_INTERACTIONS_KEY, JSON.stringify(interactions));
}

export function isTemplateSaved(templateId: string): boolean {
  const interactions = getUserInteractions();
  return interactions.saved.includes(templateId);
}

// ============ Seed Data ============

export function seedCommunityTemplates(): void {
  const existing = getStoredCommunityTemplates();
  if (existing.length > 0) return; // Already seeded
  
  // Would add some sample templates
  saveCommunityTemplates([]);
}
