import { 
  AcademicDomain, 
  DomainExpert, 
  DOMAIN_EXPERTS, 
  detectDomain 
} from '@/types/domain-experts';
import { UserSettings } from '@/types/settings';
import { PresentationConfig } from '@/types/enhanced';

// Domain-aware analysis configuration
export interface DomainAnalysisConfig {
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  responseFormat: 'json' | 'text';
}

// Get expert configuration for a domain
export function getDomainExpert(domain: AcademicDomain): DomainExpert {
  return DOMAIN_EXPERTS[domain] || DOMAIN_EXPERTS['general'];
}

// Auto-detect domain and get expert
export function detectAndGetExpert(text: string): {
  domain: AcademicDomain;
  expert: DomainExpert;
  confidence: number;
} {
  const domain = detectDomain(text);
  const expert = getDomainExpert(domain);
  
  // Calculate confidence based on keyword matches
  const text_lower = text.toLowerCase();
  let matchCount = 0;
  expert.keywords.forEach(keyword => {
    matchCount += (text_lower.match(new RegExp(keyword, 'g')) || []).length;
  });
  const confidence = Math.min(1, matchCount / 10); // Normalize
  
  return { domain, expert, confidence };
}

// Generate domain-specific system prompt
export function generateDomainPrompt(
  domain: AcademicDomain,
  baseSettings: UserSettings,
  customInstructions?: string
): DomainAnalysisConfig {
  const expert = getDomainExpert(domain);
  
  let systemPrompt = expert.systemPrompt;
  
  // Add custom instructions
  if (customInstructions) {
    systemPrompt += `\n\nAdditional instructions:\n${customInstructions}`;
  }
  
  // Add emphasis areas
  if (expert.emphasisAreas.length > 0) {
    systemPrompt += `\n\nEmphasize these aspects:\n${expert.emphasisAreas.map(e => `- ${e}`).join('\n')}`;
  }
  
  // Add slide structure guidance
  systemPrompt += `\n\nRecommended structure:\n${expert.commonSections.join(' → ')}`;
  
  return {
    systemPrompt,
    model: baseSettings.model || 'gpt-4o',
    temperature: baseSettings.temperature || 0.3,
    maxTokens: baseSettings.maxTokens || 4000,
    responseFormat: 'json'
  };
}

// Apply domain visual style to config
export function applyDomainVisualStyle(
  domain: AcademicDomain,
  baseConfig: PresentationConfig
): PresentationConfig {
  const expert = getDomainExpert(domain);
  const style = expert.visualStyle;
  
  return {
    ...baseConfig,
    colorScheme: `${style.primaryColor},${style.secondaryColor},${style.accentColor}` as PresentationConfig['colorScheme'],
    fontHeading: style.fontHeading,
    fontBody: style.fontBody
  };
}

// Get domain-specific slide templates
export function getDomainSlideTemplates(domain: AcademicDomain) {
  const expert = getDomainExpert(domain);
  return expert.slideTemplates;
}

// Generate Nano Banana prompt for a domain-specific visual
export function generateDomainNanoPrompt(
  domain: AcademicDomain,
  template: string,
  context: Record<string, string>
): string {
  const expert = getDomainExpert(domain);
  const slideTemplate = expert.slideTemplates.find(t => t.id === template);
  
  if (!slideTemplate?.nanoPromptTemplate) {
    // Generic fallback
    return `Professional academic illustration for ${domain} research, clean scientific style, ${expert.visualStyle.primaryColor} and ${expert.visualStyle.secondaryColor} color scheme`;
  }
  
  // Replace placeholders
  let prompt = slideTemplate.nanoPromptTemplate;
  Object.entries(context).forEach(([key, value]) => {
    prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  
  return prompt;
}

// Check for special domain features
export function getEnabledDomainFeatures(domain: AcademicDomain) {
  const expert = getDomainExpert(domain);
  return expert.specialFeatures.filter(f => f.enabled);
}

// Domain-specific content validation
export function validateDomainContent(
  domain: AcademicDomain,
  content: string
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  switch (domain) {
    case 'computer-science':
      // Check for common CS elements
      if (!content.includes('algorithm') && !content.includes('method')) {
        issues.push('Consider explicitly describing your algorithm/method');
      }
      break;
      
    case 'medicine':
      // Check for clinical elements
      if (!content.includes('p-value') && !content.includes('CI')) {
        issues.push('Consider adding statistical significance information');
      }
      if (!content.includes('patient') && !content.includes('participant')) {
        issues.push('Clarify patient/participant population');
      }
      break;
      
    case 'physics':
      // Check for physics elements
      if (!content.includes('equation') && !content.includes('Eq.')) {
        issues.push('Consider including key equations');
      }
      break;
  }
  
  return { valid: issues.length === 0, issues };
}

// Get domain-specific citation guidance
export function getDomainCitationGuidance(domain: AcademicDomain): {
  preferredStyle: string;
  emphasis: string[];
} {
  const guidance: Record<AcademicDomain, { preferredStyle: string; emphasis: string[] }> = {
    'computer-science': {
      preferredStyle: 'ACM or IEEE',
      emphasis: ['Recent work (last 2 years)', 'Key foundational papers', 'ArXiv preprints acceptable']
    },
    'biology': {
      preferredStyle: 'Nature/Science style',
      emphasis: ['Author-date format', 'Include DOIs', 'Highlight key papers']
    },
    'medicine': {
      preferredStyle: 'Vancouver',
      emphasis: ['Numbered citations', 'Include PMCID when available', 'Guideline citations']
    },
    'physics': {
      preferredStyle: 'APS format',
      emphasis: ['Include arXiv IDs', 'Standard abbreviations', 'Co-authors on seminal papers']
    },
    'economics': {
      preferredStyle: 'AEA format',
      emphasis: ['Working papers acceptable', 'Include URLs', 'Policy reports']
    },
    'chemistry': {
      preferredStyle: 'ACS format',
      emphasis: ['Include CAS numbers', 'Patent citations if relevant', 'Standard abbreviations']
    },
    'psychology': {
      preferredStyle: 'APA',
      emphasis: ['DOIs required', 'Retrieval dates for online sources', 'Database information']
    },
    'mathematics': {
      preferredStyle: 'AMS style',
      emphasis: ['MathSciNet MR numbers', 'ArXiv citations', 'Book editions']
    },
    'engineering': {
      preferredStyle: 'IEEE',
      emphasis: ['Standard numbers', 'Patent citations', 'Technical reports']
    },
    'social-sciences': {
      preferredStyle: 'APA or Chicago',
      emphasis: ['DOIs preferred', 'Access dates', 'Multimedia citations']
    },
    'humanities': {
      preferredStyle: 'MLA or Chicago',
      emphasis: ['Original publication dates', 'Translator information', 'Edition details']
    },
    'general': {
      preferredStyle: 'APA',
      emphasis: ['Consistency', 'Complete information', 'DOIs when available']
    }
  };
  
  return guidance[domain] || guidance['general'];
}

// Storage keys
const DOMAIN_STORAGE_KEY = 'academia-preferred-domain';

export function savePreferredDomain(domain: AcademicDomain): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DOMAIN_STORAGE_KEY, domain);
  }
}

export function getPreferredDomain(): AcademicDomain | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(DOMAIN_STORAGE_KEY) as AcademicDomain || null;
  }
  return null;
}
