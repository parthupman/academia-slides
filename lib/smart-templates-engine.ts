/* eslint-disable @typescript-eslint/no-unused-vars */
import { 
  SmartTemplate, 
  TemplateRecommendation,
  BUILT_IN_TEMPLATES,
  UserTemplateLibrary
} from '@/types/smart-templates';
import { PaperMetadata } from '@/types/enhanced';

// Get all available templates
export function getAllTemplates(): SmartTemplate[] {
  // Start with built-in templates
  const templates = [...BUILT_IN_TEMPLATES];
  
  // Add user's saved templates from localStorage
  const userLibrary = getUserTemplateLibrary();
  templates.push(...userLibrary.saved);
  
  return templates;
}

// Get user's template library
export function getUserTemplateLibrary(): UserTemplateLibrary {
  if (typeof window === 'undefined') {
    return { saved: [], recent: [], favorites: [], created: [] };
  }
  
  try {
    const stored = localStorage.getItem('academia-template-library');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.error('Failed to load template library');
  }
  
  return { saved: [], recent: [], favorites: [], created: [] };
}

// Save template library
export function saveTemplateLibrary(library: UserTemplateLibrary): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('academia-template-library', JSON.stringify(library));
  } catch {
    console.error('Failed to save template library');
  }
}

// Save template to library
export function saveTemplate(template: SmartTemplate): void {
  const library = getUserTemplateLibrary();
  
  // Check if already saved
  const exists = library.saved.find(t => t.id === template.id);
  if (!exists) {
    library.saved.push(template);
    saveTemplateLibrary(library);
  }
}

// Add to favorites
export function addToFavorites(templateId: string): void {
  const library = getUserTemplateLibrary();
  if (!library.favorites.includes(templateId)) {
    library.favorites.push(templateId);
    saveTemplateLibrary(library);
  }
}

// Add to recent
export function addToRecent(templateId: string): void {
  const library = getUserTemplateLibrary();
  
  // Remove if exists, then add to front
  library.recent = library.recent.filter(id => id !== templateId);
  library.recent.unshift(templateId);
  
  // Keep only last 10
  library.recent = library.recent.slice(0, 10);
  
  saveTemplateLibrary(library);
}

// Recommend best template for paper
export function recommendTemplate(
  metadata: PaperMetadata,
  paperText: string
): TemplateRecommendation {
  const templates = getAllTemplates();
  const scored = templates.map(template => ({
    template,
    score: calculateMatchScore(template, metadata, paperText)
  }));
  
  // Sort by score
  scored.sort((a, b) => b.score.confidence - a.score.confidence);
  
  const best = scored[0];
  const alternatives = scored.slice(1, 4);
  
  return {
    template: best.template,
    confidence: best.score.confidence,
    reason: best.score.reason,
    matchDetails: best.score.details,
    alternatives: alternatives.map(alt => ({
      template: alt.template,
      confidence: alt.score.confidence
    }))
  };
}

// Calculate how well a template matches
function calculateMatchScore(
  template: SmartTemplate,
  metadata: PaperMetadata,
  paperText: string
): {
  confidence: number;
  reason: string;
  details: { keywordMatch: number; structureMatch: number; domainMatch: number };
} {
  let score = 0;
  
  // Keyword matching
  const text_lower = paperText.toLowerCase();
  let keywordMatches = 0;
  template.matching.keywords.forEach(keyword => {
    if (text_lower.includes(keyword.toLowerCase())) {
      keywordMatches++;
    }
  });
  const keywordScore = (keywordMatches / template.matching.keywords.length) * 40;
  score += keywordScore;
  
  // Structure matching
  let structureScore = 0;
  if (template.matching.hasFigures !== undefined) {
    const hasFigures = metadata.figures.length > 0;
    if (template.matching.hasFigures === hasFigures) {
      structureScore += 20;
    }
  }
  if (template.matching.hasTables !== undefined) {
    const hasTables = metadata.tables.length > 0;
    if (template.matching.hasTables === hasTables) {
      structureScore += 20;
    }
  }
  score += structureScore;
  
  // Domain matching
  let domainScore = 0;
  if (template.recommendedDomains.includes('general')) {
    domainScore = 20;
  } else {
    // Check if any keyword matches a domain
    const domainMatches = template.recommendedDomains.filter(domain => {
      return text_lower.includes(domain.toLowerCase());
    }).length;
    domainScore = (domainMatches / template.recommendedDomains.length) * 20;
  }
  score += domainScore;
  
  // Length considerations
  if (template.matching.wordCount) {
    const wordCount = metadata.wordCount;
    if (template.matching.wordCount.min && wordCount < template.matching.wordCount.min) {
      score -= 10;
    }
    if (template.matching.wordCount.max && wordCount > template.matching.wordCount.max) {
      score -= 10;
    }
  }
  
  // Generate reason
  let reason: string;
  if (keywordScore > 30) {
    reason = `Strong keyword match with ${keywordMatches} relevant terms`;
  } else if (domainScore > 15) {
    reason = `Recommended for ${template.recommendedDomains[0]} research`;
  } else if (structureScore > 30) {
    reason = `Matches paper structure with figures and tables`;
  } else {
    reason = 'Good general-purpose match';
  }
  
  const confidence = Math.min(100, Math.max(0, score)) / 100;
  
  return {
    confidence,
    reason,
    details: {
      keywordMatch: keywordScore / 40,
      structureMatch: structureScore / 40,
      domainMatch: domainScore / 20
    }
  };
}

// Apply template to generate slide structure
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function applyTemplate(
  template: SmartTemplate,
  _metadata: PaperMetadata
): { slides: unknown[]; timing: unknown } {
  const slides = template.structure.slides.map((slide, index) => ({
    id: index + 1,
    type: slide.type,
    layout: slide.layout.type,
    title: slide.purpose,
    content: [],
    speakerNotes: slide.speakerNotes,
    duration: slide.suggestedDuration,
    optional: slide.optional
  }));
  
  return {
    slides,
    timing: template.structure.suggestedTiming
  };
}

// Get Nano Banana prompt for a template slide
export function getSlideVisualPrompt(
  template: SmartTemplate,
  slideId: string,
  context: Record<string, string>
): string | null {
  const slide = template.structure.slides.find(s => s.id === slideId);
  
  if (!slide?.visual?.nanoPromptTemplate) {
    return null;
  }
  
  let prompt = slide.visual.nanoPromptTemplate;
  
  // Replace placeholders
  Object.entries(context).forEach(([key, value]) => {
    prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  
  return prompt;
}

// Create custom template
export function createCustomTemplate(
  name: string,
  baseTemplate?: SmartTemplate,
  userId: string = 'user'
): SmartTemplate {
  const now = new Date().toISOString();
  
  return {
    id: `custom-${Date.now()}`,
    name,
    description: 'Custom template',
    matching: baseTemplate?.matching || {
      keywords: [],
      minConfidence: 0.5
    },
    structure: baseTemplate?.structure || {
      slides: [],
      flowDescription: 'Custom flow',
      suggestedTiming: { totalMinutes: 15, perSlide: [] }
    },
    recommendedDomains: baseTemplate?.recommendedDomains || ['general'],
    stats: {
      timesUsed: 0,
      averageRating: 0,
      completionRate: 0,
      avgGenerationTime: 0,
      qualityScores: {
        completeness: 0,
        clarity: 0,
        visualAppeal: 0
      }
    },
    author: {
      name: userId,
      verified: false
    },
    metadata: {
      created: now,
      updated: now,
      version: '1.0',
      downloads: 0,
      rating: 0,
      ratingCount: 0
    }
  };
}

// Export template for sharing
export function exportTemplate(template: SmartTemplate): string {
  const exportable = {
    name: template.name,
    description: template.description,
    matching: template.matching,
    structure: template.structure,
    recommendedDomains: template.recommendedDomains
  };
  
  return JSON.stringify(exportable, null, 2);
}

// Import template
export function importTemplate(jsonString: string, userId: string = 'user'): SmartTemplate | null {
  try {
    const imported = JSON.parse(jsonString);
    return createCustomTemplate(
      imported.name || 'Imported Template',
      imported as SmartTemplate,
      userId
    );
  } catch {
    return null;
  }
}

// Get templates by domain
export function getTemplatesByDomain(domain: string): SmartTemplate[] {
  return getAllTemplates().filter(t => 
    t.recommendedDomains.includes(domain) || 
    t.recommendedDomains.includes('general')
  );
}

// Get trending templates
export function getTrendingTemplates(limit: number = 5): SmartTemplate[] {
  return getAllTemplates()
    .filter(t => t.stats.timesUsed > 10)
    .sort((a, b) => b.stats.averageRating - a.stats.averageRating)
    .slice(0, limit);
}
