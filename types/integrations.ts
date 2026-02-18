// Academic Integrations
// Connect with tools researchers actually use

// Reference Managers
export type ReferenceManager = 'zotero' | 'mendeley' | 'endnote' | 'papers' | 'jabref' | 'citavi';

export interface ReferenceManagerIntegration {
  type: ReferenceManager;
  enabled: boolean;
  config: {
    apiKey?: string;
    userId?: string;
    libraryId?: string;
    syncEnabled: boolean;
  };
}

export interface ImportedReference {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  pdfUrl?: string;
  tags: string[];
  collections: string[];
  importDate: string;
}

// Academic Databases
export type AcademicDatabase = 'arxiv' | 'pubmed' | 'semantic-scholar' | 'ieee' | 'acm' | 'openalex' | 'crossref';

export interface DatabaseIntegration {
  type: AcademicDatabase;
  enabled: boolean;
  rateLimitRemaining?: number;
}

export interface PaperSearchResult {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  year: number;
  venue?: string;
  doi?: string;
  pdfUrl?: string;
  citationCount: number;
  source: AcademicDatabase;
  relevanceScore: number;
}

// Specific integrations

// arXiv
export interface ArxivIntegration extends DatabaseIntegration {
  type: 'arxiv';
  searchCategories: string[]; // cs.AI, cs.LG, etc.
}

export interface ArxivPaper {
  id: string; // arXiv ID
  title: string;
  authors: string[];
  abstract: string;
  categories: string[];
  published: string;
  updated?: string;
  doi?: string;
  journalRef?: string;
  pdfUrl: string;
  primaryCategory: string;
  comment?: string; // Author comments
}

// PubMed
export interface PubMedIntegration extends DatabaseIntegration {
  type: 'pubmed';
  searchFilters: {
    articleTypes: string[];
    publicationDates: { from?: string; to?: string };
    species?: string[];
    languages?: string[];
  };
}

export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: {
    name: string;
    affiliation?: string;
    orcid?: string;
  }[];
  abstract: string;
  journal: string;
  publicationDate: string;
  doi?: string;
  meshTerms: string[];
  keywords: string[];
  grantInfo?: string[];
  fullTextUrl?: string;
}

// Semantic Scholar
export interface SemanticScholarIntegration extends DatabaseIntegration {
  type: 'semantic-scholar';
  includeCitations: boolean;
  includeReferences: boolean;
}

export interface SemanticScholarPaper {
  paperId: string;
  title: string;
  authors: { name: string; authorId?: string }[];
  abstract: string;
  year: number;
  venue?: string;
  citationCount: number;
  referenceCount: number;
  influentialCitationCount: number;
  citations: SemanticScholarCitation[];
  references: SemanticScholarCitation[];
  fieldsOfStudy: string[];
  s2FieldsOfStudy: { category: string; source: string }[];
  publicationTypes?: string[];
  publicationDate?: string;
  journal?: {
    name: string;
    volume?: string;
    pages?: string;
  };
  externalIds: {
    ArXiv?: string;
    DOI?: string;
    PubMed?: string;
    MAG?: string;
  };
  openAccessPdf?: { url: string; status: string };
}

export interface SemanticScholarCitation {
  paperId: string;
  title: string;
  authors: { name: string; authorId?: string }[];
  year: number;
  venue?: string;
  citationCount?: number;
  influentialCitationCount?: number;
  intent?: string[];
  isInfluential: boolean;
}

// Collaboration Tools
export type CollaborationTool = 'notion' | 'google-docs' | 'overleaf' | 'github' | 'dropbox';

export interface CollaborationIntegration {
  type: CollaborationTool;
  enabled: boolean;
  config: {
    accessToken?: string;
    refreshToken?: string;
    workspaceId?: string;
    defaultFolder?: string;
  };
}

// Notion-specific
export interface NotionIntegration extends CollaborationIntegration {
  type: 'notion';
  databases: {
    papers?: string; // Database ID for papers
    presentations?: string; // Database ID for presentations
  };
}

// Overleaf-specific
export interface OverleafIntegration extends CollaborationIntegration {
  type: 'overleaf';
  config: CollaborationIntegration['config'] & {
    templateId?: string;
  };
}

// Export formats by integration
export interface ExportConfig {
  format: 'pptx' | 'pdf' | 'google-slides' | 'keynote' | 'html' | 'markdown' | 'latex' | 'images';
  integration?: CollaborationTool;
  options: {
    quality?: 'draft' | 'standard' | 'high';
    includeSpeakerNotes?: boolean;
    includeAnimations?: boolean;
    aspectRatio?: '16:9' | '4:3';
    theme?: string;
    // Integration-specific
    notionPageId?: string;
    overleafProjectId?: string;
    googleSlidesId?: string;
  };
}

// Citation Network Analysis
export interface CitationNetwork {
  centerPaper: PaperSearchResult;
  citations: {
    paper: PaperSearchResult;
    type: 'direct' | 'influential' | 'background' | 'method' | 'result';
  }[];
  references: {
    paper: PaperSearchResult;
    type: 'background' | 'method' | 'foundation' | 'comparison';
  }[];
  related: PaperSearchResult[];
  
  // Insights
  insights: {
    highlyCitedPapers: PaperSearchResult[];
    recentImportantWork: PaperSearchResult[];
    foundationalPapers: PaperSearchResult[];
    methodologySources: PaperSearchResult[];
  };
}

// Research Context
export interface ResearchContext {
  paper: PaperSearchResult;
  
  // What came before
  priorWork: {
    foundational: PaperSearchResult[];
    recent: PaperSearchResult[];
    methodology: PaperSearchResult[];
  };
  
  // What came after
  followUpWork: {
    directExtensions: PaperSearchResult[];
    applications: PaperSearchResult[];
    citations: number;
  };
  
  // The landscape
  landscape: {
    topResearchers: { name: string; paperCount: number; citationCount: number }[];
    topVenues: { name: string; paperCount: number }[];
    trendOverTime: { year: number; paperCount: number }[];
    relatedTopics: { topic: string; relevance: number }[];
  };
}

// Import workflow
export interface ImportWorkflow {
  id: string;
  name: string;
  source: ReferenceManager | AcademicDatabase | 'upload';
  
  // What to import
  select: {
    allNew?: boolean;
    byTag?: string[];
    byCollection?: string[];
    byDateRange?: { from: string; to: string };
    bySearch?: string;
    specificIds?: string[];
  };
  
  // What to do with imported papers
  actions: {
    analyze?: boolean;
    generateSlides?: boolean;
    addToLibrary?: boolean;
    exportTo?: CollaborationTool[];
  };
  
  // Schedule
  schedule?: {
    frequency: 'manual' | 'daily' | 'weekly';
    lastRun?: string;
    nextRun?: string;
  };
}

// Integration status
export interface IntegrationStatus {
  type: ReferenceManager | AcademicDatabase | CollaborationTool;
  connected: boolean;
  lastSync?: string;
  itemsSynced?: number;
  error?: string;
  rateLimitInfo?: {
    remaining: number;
    resetTime: string;
  };
}

// Unified search across all sources
export interface UnifiedSearchRequest {
  query: string;
  filters: {
    sources: (ReferenceManager | AcademicDatabase)[];
    dateRange?: { from?: string; to?: string };
    authors?: string[];
    venues?: string[];
    hasPdf?: boolean;
    minCitations?: number;
  };
  sort: 'relevance' | 'date' | 'citations';
  limit: number;
}

export interface UnifiedSearchResponse {
  results: PaperSearchResult[];
  totalCount: number;
  facets: {
    bySource: { source: string; count: number }[];
    byYear: { year: number; count: number }[];
    byVenue: { venue: string; count: number }[];
  };
  searchTime: number;
}
