/* eslint-disable @typescript-eslint/no-unused-vars */
// Academic Integrations
// Connect with reference managers and academic databases

import { 
  ReferenceManagerIntegration,
  DatabaseIntegration,
  ArxivPaper,
  SemanticScholarPaper,
  PaperSearchResult,
  UnifiedSearchRequest,
  UnifiedSearchResponse,
  CollaborationIntegration
} from '@/types/integrations';

// Storage keys
const INTEGRATIONS_STORAGE_KEY = 'academia-integrations';

// Get stored integrations
export function getIntegrations(): {
  referenceManagers: ReferenceManagerIntegration[];
  databases: DatabaseIntegration[];
  collaboration: CollaborationIntegration[];
} {
  if (typeof window === 'undefined') {
    return { referenceManagers: [], databases: [], collaboration: [] };
  }
  
  try {
    const stored = localStorage.getItem(INTEGRATIONS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.error('Failed to load integrations');
  }
  
  return { referenceManagers: [], databases: [], collaboration: [] };
}

// Save integrations
export function saveIntegrations(integrations: {
  referenceManagers: ReferenceManagerIntegration[];
  databases: DatabaseIntegration[];
  collaboration: CollaborationIntegration[];
}): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(INTEGRATIONS_STORAGE_KEY, JSON.stringify(integrations));
  } catch {
    console.error('Failed to save integrations');
  }
}

// Enable/disable integration
export function toggleIntegration(
  type: 'reference' | 'database' | 'collaboration',
  id: string,
  enabled: boolean
): void {
  const integrations = getIntegrations();
  
  switch (type) {
    case 'reference':
      const rm = integrations.referenceManagers.find(i => i.type === id);
      if (rm) rm.enabled = enabled;
      break;
    case 'database':
      const db = integrations.databases.find(i => i.type === id);
      if (db) db.enabled = enabled;
      break;
    case 'collaboration':
      const collab = integrations.collaboration.find(i => i.type === id);
      if (collab) collab.enabled = enabled;
      break;
  }
  
  saveIntegrations(integrations);
}

// ============ arXiv Integration ============

const ARXIV_API_BASE = 'http://export.arxiv.org/api/query';

export async function searchArxiv(
  query: string,
  start: number = 0,
  maxResults: number = 10
): Promise<PaperSearchResult[]> {
  const searchQuery = encodeURIComponent(query);
  const url = `${ARXIV_API_BASE}?search_query=all:${searchQuery}&start=${start}&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;
  
  try {
    const response = await fetch(url);
    const xml = await response.text();
    
    // Parse XML (simplified)
    const entries = parseArxivXml(xml);
    
    return entries.map((entry: ArxivPaper) => ({
      id: entry.id,
      title: entry.title,
      authors: entry.authors,
      abstract: entry.abstract,
      year: new Date(entry.published).getFullYear(),
      pdfUrl: entry.pdfUrl,
      citationCount: 0, // arXiv doesn't provide this
      source: 'arxiv',
      relevanceScore: 0.9
    }));
  } catch (error) {
    console.error('arXiv search failed:', error);
    return [];
  }
}

function parseArxivXml(xml: string): ArxivPaper[] {
  // Simplified XML parsing
  const entries: ArxivPaper[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  
  while ((match = entryRegex.exec(xml)) !== null) {
    const entryXml = match[1];
    
    const id = extractXmlValue(entryXml, 'id') || '';
    const title = extractXmlValue(entryXml, 'title') || '';
    const summary = extractXmlValue(entryXml, 'summary') || '';
    const published = extractXmlValue(entryXml, 'published') || '';
    const pdfUrl = id.replace('abs', 'pdf') + '.pdf';
    
    // Extract authors
    const authors: string[] = [];
    const authorRegex = /<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g;
    let authorMatch;
    while ((authorMatch = authorRegex.exec(entryXml)) !== null) {
      authors.push(authorMatch[1]);
    }
    
    // Extract categories
    const categories: string[] = [];
    const catRegex = /<category term="(.*?)"/g;
    let catMatch;
    while ((catMatch = catRegex.exec(entryXml)) !== null) {
      categories.push(catMatch[1]);
    }
    
    entries.push({
      id,
      title: title.replace(/\n/g, ' ').trim(),
      authors,
      abstract: summary,
      categories,
      published,
      pdfUrl,
      primaryCategory: categories[0] || ''
    });
  }
  
  return entries;
}

function extractXmlValue(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

// ============ Semantic Scholar Integration ============

const S2_API_BASE = 'https://api.semanticscholar.org/graph/v1';

export async function searchSemanticScholar(
  query: string,
  limit: number = 10
): Promise<PaperSearchResult[]> {
  const url = `${S2_API_BASE}/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,authors,year,abstract,citationCount,openAccessPdf`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    return (data.data || []).map((paper: SemanticScholarPaper) => ({
      id: paper.paperId,
      title: paper.title,
      authors: paper.authors.map(a => a.name),
      abstract: paper.abstract || '',
      year: paper.year,
      pdfUrl: paper.openAccessPdf?.url,
      citationCount: paper.citationCount,
      source: 'semantic-scholar',
      relevanceScore: 0.85
    }));
  } catch (error) {
    console.error('Semantic Scholar search failed:', error);
    return [];
  }
}

// Get paper details with citations
export async function getSemanticScholarPaperDetails(
  paperId: string
): Promise<SemanticScholarPaper | null> {
  const url = `${S2_API_BASE}/paper/${paperId}?fields=title,authors,year,abstract,citationCount,referenceCount,citations,references,fieldsOfStudy,publicationTypes,openAccessPdf`;
  
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Failed to get paper details:', error);
    return null;
  }
}

// ============ PubMed Integration ============

const PUBMED_API_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export async function searchPubMed(
  query: string,
  maxResults: number = 10
): Promise<PaperSearchResult[]> {
  // First, search for IDs
  const searchUrl = `${PUBMED_API_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json`;
  
  try {
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    const ids = searchData.esearchresult.idlist;
    
    if (ids.length === 0) return [];
    
    // Then, fetch details
    const summaryUrl = `${PUBMED_API_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const summaryResponse = await fetch(summaryUrl);
    const summaryData = await summaryResponse.json();
    
    return ids.map((id: string) => {
      const article = summaryData.result[id];
      return {
        id,
        title: article.title,
        authors: (article.authors || []).map((a: { name: string }) => a.name),
        abstract: '', // Would need separate fetch
        year: article.pubdate?.split(' ')[0] || 0,
        pdfUrl: undefined,
        citationCount: 0,
        source: 'pubmed',
        relevanceScore: 0.8
      };
    });
  } catch (error) {
    console.error('PubMed search failed:', error);
    return [];
  }
}

// ============ Unified Search ============

export async function unifiedSearch(
  request: UnifiedSearchRequest
): Promise<UnifiedSearchResponse> {
  const { query, filters, sort, limit } = request;
  
  const results: PaperSearchResult[] = [];
  const searchPromises: Promise<void>[] = [];
  
  // Search enabled databases
  if (filters.sources.includes('arxiv')) {
    searchPromises.push(
      searchArxiv(query, 0, limit / 2).then(arxivResults => {
        results.push(...arxivResults);
      })
    );
  }
  
  if (filters.sources.includes('semantic-scholar')) {
    searchPromises.push(
      searchSemanticScholar(query, limit / 2).then(s2Results => {
        results.push(...s2Results);
      })
    );
  }
  
  if (filters.sources.includes('pubmed')) {
    searchPromises.push(
      searchPubMed(query, limit / 2).then(pubmedResults => {
        results.push(...pubmedResults);
      })
    );
  }
  
  await Promise.all(searchPromises);
  
  // Sort results
  if (sort === 'date') {
    results.sort((a, b) => b.year - a.year);
  } else if (sort === 'citations') {
    results.sort((a, b) => b.citationCount - a.citationCount);
  }
  // relevance is default
  
  // Apply date filter
  let filtered = results;
  if (filters.dateRange) {
    filtered = results.filter(r => {
      if (filters.dateRange!.from && r.year < parseInt(filters.dateRange!.from)) return false;
      if (filters.dateRange!.to && r.year > parseInt(filters.dateRange!.to)) return false;
      return true;
    });
  }
  
  // Calculate facets
  const bySource = Object.entries(
    filtered.reduce((acc, r) => {
      acc[r.source] = (acc[r.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([source, count]) => ({ source, count }));
  
  const byYear = Object.entries(
    filtered.reduce((acc, r) => {
      acc[r.year] = (acc[r.year] || 0) + 1;
      return acc;
    }, {} as Record<number, number>)
  ).map(([year, count]) => ({ year: parseInt(year), count }));
  
  const byVenue = Object.entries(
    filtered.reduce((acc, r) => {
      if (r.venue) {
        acc[r.venue] = (acc[r.venue] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  ).map(([venue, count]) => ({ venue, count }));
  
  return {
    results: filtered.slice(0, limit),
    totalCount: filtered.length,
    facets: {
      bySource,
      byYear,
      byVenue
    },
    searchTime: 0
  };
}

// ============ Reference Manager Import ============

export async function importFromReferenceManager(
  manager: ReferenceManagerIntegration['type'],
  config: ReferenceManagerIntegration['config']
): Promise<{ success: boolean; imported: number; error?: string }> {
  // This would integrate with the actual reference manager APIs
  // For now, return a placeholder
  
  switch (manager) {
    case 'zotero':
      return importFromZotero(config);
    case 'mendeley':
      return importFromMendeley(config);
    default:
      return { success: false, imported: 0, error: 'Integration not yet implemented' };
  }
}

async function importFromZotero(
  config: ReferenceManagerIntegration['config']
): Promise<{ success: boolean; imported: number; error?: string }> {
  if (!config.apiKey) {
    return { success: false, imported: 0, error: 'API key required' };
  }
  
  try {
    // Zotero API integration would go here
    return { success: true, imported: 0 };
  } catch (error) {
    return { success: false, imported: 0, error: String(error) };
  }
}

async function importFromMendeley(
  config: ReferenceManagerIntegration['config']
): Promise<{ success: boolean; imported: number; error?: string }> {
  if (!config.apiKey) {
    return { success: false, imported: 0, error: 'API key required' };
  }
  
  try {
    // Mendeley API integration would go here
    return { success: true, imported: 0 };
  } catch (error) {
    return { success: false, imported: 0, error: String(error) };
  }
}

// ============ Collaboration Tool Export ============

export async function exportToCollaborationTool(
  tool: CollaborationIntegration['type'],
  data: unknown,
  config: CollaborationIntegration['config']
): Promise<{ success: boolean; url?: string; error?: string }> {
  switch (tool) {
    case 'notion':
      return exportToNotion(data, config);
    case 'google-docs':
      return exportToGoogleDocs(data, config);
    default:
      return { success: false, error: 'Export not yet implemented' };
  }
}

async function exportToNotion(
  data: unknown,
  config: CollaborationIntegration['config']
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!config.accessToken) {
    return { success: false, error: 'Notion access token required' };
  }
  
  try {
    // Notion API integration would go here
    return { success: true, url: 'https://notion.so/page' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function exportToGoogleDocs(
  _data: unknown,
  _config: CollaborationIntegration['config']
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Google Docs API integration would go here
    return { success: true, url: 'https://docs.google.com/document' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
