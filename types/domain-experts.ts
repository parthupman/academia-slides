// Domain-Specific Expert Modes
// Each domain has specialized prompts, templates, and visual styles

export type AcademicDomain = 
  | 'computer-science'
  | 'biology'
  | 'physics'
  | 'chemistry'
  | 'medicine'
  | 'economics'
  | 'psychology'
  | 'engineering'
  | 'mathematics'
  | 'social-sciences'
  | 'humanities'
  | 'general';

export interface DomainExpert {
  id: AcademicDomain;
  name: string;
  description: string;
  systemPrompt: string;
  slideTemplates: DomainSlideTemplate[];
  visualStyle: DomainVisualStyle;
  keywords: string[]; // Keywords to auto-detect this domain
  emphasisAreas: string[]; // What to focus on in slides
  commonSections: string[]; // Typical paper structure
  specialFeatures: DomainFeature[];
}

export interface DomainSlideTemplate {
  id: string;
  name: string;
  layout: 'title' | 'content' | 'two-column' | 'figure' | 'diagram' | 'chart' | 'equation' | 'comparison' | 'timeline' | 'table';
  whenToUse: string;
  requiredElements?: string[];
  nanoPromptTemplate?: string; // Template for Nano Banana prompts
}

export interface DomainVisualStyle {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  iconSet: 'tech' | 'bio' | 'science' | 'medical' | 'business' | 'general';
  chartStyle: 'modern' | 'minimal' | 'colorful' | 'professional';
}

export interface DomainFeature {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

// Domain Detection Patterns
export interface DomainPattern {
  domain: AcademicDomain;
  keywords: string[];
  weight: number;
}

// Complete domain expert configurations
export const DOMAIN_EXPERTS: Record<AcademicDomain, DomainExpert> = {
  'computer-science': {
    id: 'computer-science',
    name: 'Computer Science',
    description: 'Optimized for algorithms, systems, AI/ML papers',
    systemPrompt: `You are an expert Computer Science professor presenting research at a top-tier conference (NeurIPS, ICML, SIGCOMM, etc.). 

Focus on:
- Algorithm complexity with Big O notation
- System architecture and design decisions
- Empirical evaluation with benchmarks
- Ablation studies and sensitivity analysis
- Reproducibility details

Use precise technical language. Include pseudocode when relevant. Emphasize computational efficiency and scalability.`,
    keywords: ['algorithm', 'neural network', 'deep learning', 'system', 'distributed', 'optimization', 'model', 'dataset', 'benchmark'],
    emphasisAreas: ['Complexity Analysis', 'Implementation Details', 'Experimental Setup', 'Ablation Studies', 'Reproducibility'],
    commonSections: ['Introduction', 'Related Work', 'Method', 'Experiments', 'Results', 'Ablation Study', 'Conclusion'],
    slideTemplates: [
      {
        id: 'cs-problem-formulation',
        name: 'Problem Formulation',
        layout: 'two-column',
        whenToUse: 'Early in presentation to define the problem',
        requiredElements: ['Formal problem definition', 'Input/Output specification'],
        nanoPromptTemplate: 'Minimalist illustration of {problem} concept in computer science, abstract geometric shapes, blue and purple tones, flat design'
      },
      {
        id: 'cs-architecture',
        name: 'System Architecture',
        layout: 'diagram',
        whenToUse: 'For systems papers showing overall design',
        nanoPromptTemplate: 'Clean system architecture diagram style illustration showing {component} flow, technical blueprint aesthetic, blue gradients'
      },
      {
        id: 'cs-algorithm',
        name: 'Algorithm Overview',
        layout: 'content',
        whenToUse: 'When presenting a novel algorithm',
        requiredElements: ['High-level intuition', 'Key steps', 'Complexity analysis']
      },
      {
        id: 'cs-results-table',
        name: 'Results Comparison',
        layout: 'chart',
        whenToUse: 'SOTA comparison tables',
        requiredElements: ['Baseline methods', 'Metrics', 'Bold best results']
      },
      {
        id: 'cs-ablation',
        name: 'Ablation Study',
        layout: 'chart',
        whenToUse: 'Show component importance',
        requiredElements: ['Full model score', 'Component removal impact']
      }
    ],
    visualStyle: {
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      accentColor: '#06b6d4',
      fontHeading: 'Inter',
      fontBody: 'Inter',
      iconSet: 'tech',
      chartStyle: 'modern'
    },
    specialFeatures: [
      { id: 'pseudocode', name: 'Auto Pseudocode Generation', enabled: true, description: 'Generates LaTeX pseudocode for algorithms' },
      { id: 'complexity-table', name: 'Complexity Comparison Tables', enabled: true, description: 'Auto-formats Big O comparisons' },
      { id: 'ablation-charts', name: 'Ablation Study Visualizations', enabled: true, description: 'Specialized charts for ablation studies' }
    ]
  },

  'biology': {
    id: 'biology',
    name: 'Biology & Life Sciences',
    description: 'Optimized for molecular biology, genetics, physiology papers',
    systemPrompt: `You are a Biology researcher presenting at a journal club or conference. 

Focus on:
- Experimental methods and protocols
- Statistical significance (p-values, confidence intervals)
- Biological mechanisms and pathways
- Sample sizes and power analysis
- Clinical relevance and implications

Use precise biological terminology. Include methodological details. Emphasize statistical rigor.`,
    keywords: ['gene', 'protein', 'cell', 'tissue', 'organism', 'pathway', 'expression', 'assay', 'clinical', 'patient'],
    emphasisAreas: ['Methodology', 'Statistical Significance', 'Biological Mechanism', 'Clinical Relevance', 'Sample Size'],
    commonSections: ['Abstract', 'Introduction', 'Methods', 'Results', 'Discussion', 'Conclusion'],
    slideTemplates: [
      {
        id: 'bio-methods',
        name: 'Experimental Setup',
        layout: 'diagram',
        whenToUse: 'Detail experimental protocol',
        nanoPromptTemplate: 'Scientific laboratory illustration showing {method} procedure, clean medical illustration style, green and blue tones, microscope aesthetic'
      },
      {
        id: 'bio-pathway',
        name: 'Biological Pathway',
        layout: 'diagram',
        whenToUse: 'Show molecular pathways',
        nanoPromptTemplate: 'Molecular pathway diagram illustration, {pathway} visualization, cell biology style, soft greens and blues, scientific illustration'
      },
      {
        id: 'bio-statistics',
        name: 'Statistical Results',
        layout: 'chart',
        whenToUse: 'Present statistical findings',
        requiredElements: ['P-values', 'Confidence intervals', 'Effect sizes']
      },
      {
        id: 'bio-mechanism',
        name: 'Proposed Mechanism',
        layout: 'figure',
        whenToUse: 'Hypothesized biological mechanism',
        nanoPromptTemplate: 'Cellular mechanism illustration, {process} visualization, detailed biological drawing style, soft colors'
      }
    ],
    visualStyle: {
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      accentColor: '#0ea5e9',
      fontHeading: 'Inter',
      fontBody: 'Inter',
      iconSet: 'bio',
      chartStyle: 'professional'
    },
    specialFeatures: [
      { id: 'statistical-annotations', name: 'Auto Statistical Annotations', enabled: true, description: 'Adds p-values and significance stars' },
      { id: 'pathway-diagrams', name: 'Pathway Diagram Generation', enabled: true, description: 'Creates biological pathway diagrams' },
      { id: 'methods-checklist', name: 'Methods Compliance Check', enabled: true, description: 'Checks ARRIVE/CONSORT guidelines' }
    ]
  },

  'physics': {
    id: 'physics',
    name: 'Physics & Astronomy',
    description: 'Optimized for theoretical and experimental physics papers',
    systemPrompt: `You are a Physics researcher presenting at APS or similar conference.

Focus on:
- Mathematical derivations with proper LaTeX formatting
- Experimental apparatus and error analysis
- Theoretical frameworks and assumptions
- Uncertainty quantification
- Physical intuition and interpretations

Present equations clearly. Explain the physics behind the math. Include error bars and systematic uncertainties.`,
    keywords: ['quantum', 'field', 'particle', 'theory', 'experiment', 'measurement', 'spectrum', 'dynamics', 'thermodynamics'],
    emphasisAreas: ['Theoretical Framework', 'Mathematical Derivation', 'Experimental Setup', 'Error Analysis', 'Physical Interpretation'],
    commonSections: ['Introduction', 'Theory', 'Experiment', 'Results', 'Discussion', 'Conclusion'],
    slideTemplates: [
      {
        id: 'phy-theory',
        name: 'Theoretical Framework',
        layout: 'equation',
        whenToUse: 'Present theoretical model',
        requiredElements: ['Key equations', 'Assumptions', 'Variables defined']
      },
      {
        id: 'phy-experiment',
        name: 'Experimental Setup',
        layout: 'figure',
        whenToUse: 'Show apparatus',
        nanoPromptTemplate: 'Physics laboratory apparatus illustration, {apparatus} setup, technical schematic style, precise lines, blue and white'
      },
      {
        id: 'phy-derivation',
        name: 'Key Derivation',
        layout: 'content',
        whenToUse: 'Walk through important derivation',
        requiredElements: ['Starting equation', 'Key steps', 'Final result']
      },
      {
        id: 'phy-results',
        name: 'Results with Error Bars',
        layout: 'chart',
        whenToUse: 'Experimental results',
        requiredElements: ['Error bars', 'Systematic errors', 'Statistical errors']
      }
    ],
    visualStyle: {
      primaryColor: '#3b82f6',
      secondaryColor: '#0369a1',
      accentColor: '#6366f1',
      fontHeading: 'Latin Modern Roman',
      fontBody: 'Latin Modern Roman',
      iconSet: 'science',
      chartStyle: 'minimal'
    },
    specialFeatures: [
      { id: 'latex-equations', name: 'LaTeX Equation Rendering', enabled: true, description: 'Beautiful equation formatting' },
      { id: 'error-propagation', name: 'Error Propagation Visuals', enabled: true, description: 'Shows error contributions' },
      { id: 'unit-checking', name: 'Dimensional Analysis', enabled: true, description: 'Validates unit consistency' }
    ]
  },

  'medicine': {
    id: 'medicine',
    name: 'Medicine & Health Sciences',
    description: 'Optimized for clinical research and medical studies',
    systemPrompt: `You are a medical researcher presenting clinical findings.

Focus on:
- Patient cohort characteristics
- Clinical endpoints and outcomes
- Safety and adverse events
- Statistical methodology (ITT, per-protocol)
- Clinical significance and guidelines impact

Follow CONSORT guidelines. Report confidence intervals. Emphasize clinical relevance over statistical significance.`,
    keywords: ['clinical', 'patient', 'treatment', 'trial', 'efficacy', 'safety', 'cohort', 'endpoint', 'disease'],
    emphasisAreas: ['Patient Population', 'Primary Endpoints', 'Safety Profile', 'Clinical Significance', 'Limitations'],
    commonSections: ['Background', 'Methods', 'Results', 'Discussion', 'Conclusion'],
    slideTemplates: [
      {
        id: 'med-consort',
        name: 'CONSORT Diagram',
        layout: 'diagram',
        whenToUse: 'Show patient flow',
        requiredElements: ['Screened', 'Randomized', 'Completed', 'Analyzed']
      },
      {
        id: 'med-baseline',
        name: 'Baseline Characteristics',
        layout: 'table',
        whenToUse: 'Table 1 - patient demographics'
      },
      {
        id: 'med-efficacy',
        name: 'Efficacy Results',
        layout: 'chart',
        whenToUse: 'Primary and secondary endpoints',
        requiredElements: ['Effect size', '95% CI', 'P-value']
      },
      {
        id: 'med-safety',
        name: 'Safety Summary',
        layout: 'table',
        whenToUse: 'Adverse events',
        requiredElements: ['AE type', 'Frequency', 'Severity']
      }
    ],
    visualStyle: {
      primaryColor: '#ef4444',
      secondaryColor: '#dc2626',
      accentColor: '#f59e0b',
      fontHeading: 'Inter',
      fontBody: 'Inter',
      iconSet: 'medical',
      chartStyle: 'professional'
    },
    specialFeatures: [
      { id: 'consort-check', name: 'CONSORT Compliance', enabled: true, description: 'Validates CONSORT requirements' },
      { id: 'forest-plots', name: 'Forest Plot Generation', enabled: true, description: 'Creates subgroup analysis plots' },
      { id: 'risk-calculator', name: 'Risk Calculator Slides', enabled: true, description: 'Interactive risk score tools' }
    ]
  },

  'economics': {
    id: 'economics',
    name: 'Economics & Finance',
    description: 'Optimized for economic theory and empirical research',
    systemPrompt: `You are an Economist presenting research at a seminar or conference.

Focus on:
- Identification strategy and causal inference
- Robustness checks and alternative specifications
- Economic mechanisms and channels
- Policy implications
- External validity

Clearly state assumptions. Show robustness. Discuss policy relevance.`,
    keywords: ['policy', 'market', 'economic', 'regression', 'causal', 'instrumental', 'treatment', 'effect'],
    emphasisAreas: ['Identification Strategy', 'Robustness', 'Economic Mechanism', 'Policy Implications', 'External Validity'],
    commonSections: ['Introduction', 'Literature Review', 'Empirical Strategy', 'Data', 'Results', 'Conclusion'],
    slideTemplates: [
      {
        id: 'econ-identification',
        name: 'Identification Strategy',
        layout: 'diagram',
        whenToUse: 'Explain causal identification',
        nanoPromptTemplate: 'Economic causal diagram illustration, {strategy} visualization, flow chart style, professional business colors'
      },
      {
        id: 'econ-regression',
        name: 'Regression Results',
        layout: 'table',
        whenToUse: 'Present regression tables',
        requiredElements: ['Coefficients', 'Standard errors', 'Significance stars', 'R-squared']
      },
      {
        id: 'econ-robustness',
        name: 'Robustness Checks',
        layout: 'chart',
        whenToUse: 'Show result stability'
      }
    ],
    visualStyle: {
      primaryColor: '#f59e0b',
      secondaryColor: '#d97706',
      accentColor: '#10b981',
      fontHeading: 'Georgia',
      fontBody: 'Georgia',
      iconSet: 'business',
      chartStyle: 'professional'
    },
    specialFeatures: [
      { id: 'regression-tables', name: 'Auto Regression Tables', enabled: true, description: 'Formats regression output' },
      { id: 'robustness-viz', name: 'Robustness Visualizations', enabled: true, description: 'Shows specification curves' }
    ]
  },

  'chemistry': {
    id: 'chemistry',
    name: 'Chemistry & Materials',
    description: 'Optimized for chemical and materials science research',
    systemPrompt: 'You are a Chemistry researcher presenting novel compounds or materials.',
    keywords: ['molecule', 'compound', 'reaction', 'synthesis', 'catalyst', 'spectroscopy', 'crystal'],
    emphasisAreas: ['Synthetic Route', 'Characterization', 'Yield', 'Mechanism'],
    commonSections: ['Introduction', 'Results', 'Discussion', 'Experimental', 'Conclusion'],
    slideTemplates: [
      {
        id: 'chem-synthesis',
        name: 'Synthetic Route',
        layout: 'diagram',
        whenToUse: 'Show reaction pathway',
        nanoPromptTemplate: 'Chemical synthesis pathway illustration, molecular structures, clean scientific style, blue and white'
      },
      {
        id: 'chem-spectrum',
        name: 'Spectroscopic Data',
        layout: 'figure',
        whenToUse: 'NMR, IR, MS data'
      }
    ],
    visualStyle: {
      primaryColor: '#06b6d4',
      secondaryColor: '#0891b2',
      accentColor: '#6366f1',
      fontHeading: 'Inter',
      fontBody: 'Inter',
      iconSet: 'science',
      chartStyle: 'modern'
    },
    specialFeatures: [
      { id: 'chemical-structures', name: 'Chemical Structure Rendering', enabled: true, description: 'SMILES to structure diagrams' }
    ]
  },

  'psychology': {
    id: 'psychology',
    name: 'Psychology & Neuroscience',
    description: 'Optimized for behavioral and cognitive research',
    systemPrompt: 'You are a Psychology researcher presenting behavioral or neuroimaging findings.',
    keywords: ['cognitive', 'behavioral', 'brain', 'neural', 'stimulus', 'participant', 'task'],
    emphasisAreas: ['Task Design', 'Behavioral Results', 'Neural Correlates', 'Individual Differences'],
    commonSections: ['Introduction', 'Methods', 'Results', 'Discussion'],
    slideTemplates: [
      {
        id: 'psych-task',
        name: 'Experimental Task',
        layout: 'diagram',
        whenToUse: 'Detail experimental procedure',
        nanoPromptTemplate: 'Psychology experiment illustration, {task} task visualization, brain and behavior concept, soft colors'
      },
      {
        id: 'psych-brain',
        name: 'Neuroimaging Results',
        layout: 'figure',
        whenToUse: 'fMRI or EEG results'
      }
    ],
    visualStyle: {
      primaryColor: '#ec4899',
      secondaryColor: '#db2777',
      accentColor: '#8b5cf6',
      fontHeading: 'Inter',
      fontBody: 'Inter',
      iconSet: 'bio',
      chartStyle: 'modern'
    },
    specialFeatures: [
      { id: 'brain-maps', name: 'Brain Visualization', enabled: true, description: 'fMRI activation overlays' }
    ]
  },

  'engineering': {
    id: 'engineering',
    name: 'Engineering',
    description: 'Optimized for engineering design and optimization papers',
    systemPrompt: 'You are an Engineer presenting design or optimization research.',
    keywords: ['design', 'optimization', 'performance', 'efficiency', 'prototype', 'simulation', 'model'],
    emphasisAreas: ['Design Requirements', 'Performance Metrics', 'Trade-offs', 'Validation'],
    commonSections: ['Introduction', 'Design', 'Implementation', 'Testing', 'Conclusion'],
    slideTemplates: [
      {
        id: 'eng-design',
        name: 'Design Overview',
        layout: 'diagram',
        whenToUse: 'Present system design',
        nanoPromptTemplate: 'Engineering design diagram, technical blueprint style, precise mechanical drawing aesthetic'
      },
      {
        id: 'eng-performance',
        name: 'Performance Results',
        layout: 'chart',
        whenToUse: 'Show benchmark results'
      }
    ],
    visualStyle: {
      primaryColor: '#f97316',
      secondaryColor: '#ea580c',
      accentColor: '#eab308',
      fontHeading: 'Roboto',
      fontBody: 'Roboto',
      iconSet: 'tech',
      chartStyle: 'professional'
    },
    specialFeatures: [
      { id: 'cad-integration', name: 'CAD Export', enabled: true, description: 'Export to CAD formats' }
    ]
  },

  'mathematics': {
    id: 'mathematics',
    name: 'Mathematics',
    description: 'Optimized for pure and applied mathematics papers',
    systemPrompt: 'You are a Mathematician presenting proofs or theoretical results.',
    keywords: ['theorem', 'proof', 'lemma', 'convergence', 'optimization', 'matrix', 'vector'],
    emphasisAreas: ['Theorem Statement', 'Proof Outline', 'Key Lemmas', 'Applications'],
    commonSections: ['Introduction', 'Preliminaries', 'Main Results', 'Proofs', 'Applications'],
    slideTemplates: [
      {
        id: 'math-theorem',
        name: 'Theorem Presentation',
        layout: 'content',
        whenToUse: 'Present main theorem',
        requiredElements: ['Theorem statement', 'Key conditions', 'Significance']
      },
      {
        id: 'math-proof',
        name: 'Proof Sketch',
        layout: 'content',
        whenToUse: 'Outline proof approach'
      }
    ],
    visualStyle: {
      primaryColor: '#7c3aed',
      secondaryColor: '#6d28d9',
      accentColor: '#a855f7',
      fontHeading: 'Latin Modern Roman',
      fontBody: 'Latin Modern Roman',
      iconSet: 'general',
      chartStyle: 'minimal'
    },
    specialFeatures: [
      { id: 'theorem-numbering', name: 'Auto Theorem Numbering', enabled: true, description: 'Consistent theorem numbering' }
    ]
  },

  'social-sciences': {
    id: 'social-sciences',
    name: 'Social Sciences',
    description: 'Optimized for sociology, anthropology, political science',
    systemPrompt: 'You are a Social Scientist presenting qualitative or quantitative findings.',
    keywords: ['qualitative', 'interview', 'survey', 'ethnography', 'policy', 'social'],
    emphasisAreas: ['Context', 'Methodology', 'Findings', 'Implications'],
    commonSections: ['Introduction', 'Literature', 'Methods', 'Findings', 'Discussion'],
    slideTemplates: [
      {
        id: 'soc-context',
        name: 'Research Context',
        layout: 'content',
        whenToUse: 'Set the scene'
      },
      {
        id: 'soc-findings',
        name: 'Key Findings',
        layout: 'two-column',
        whenToUse: 'Present main results'
      }
    ],
    visualStyle: {
      primaryColor: '#14b8a6',
      secondaryColor: '#0d9488',
      accentColor: '#f59e0b',
      fontHeading: 'Merriweather',
      fontBody: 'Merriweather',
      iconSet: 'general',
      chartStyle: 'professional'
    },
    specialFeatures: []
  },

  'humanities': {
    id: 'humanities',
    name: 'Humanities',
    description: 'Optimized for literature, history, philosophy',
    systemPrompt: 'You are a Humanities scholar presenting textual or historical analysis.',
    keywords: ['text', 'analysis', 'interpretation', 'historical', 'philosophical', 'argument'],
    emphasisAreas: ['Argument', 'Evidence', 'Interpretation', 'Significance'],
    commonSections: ['Introduction', 'Background', 'Analysis', 'Discussion', 'Conclusion'],
    slideTemplates: [
      {
        id: 'hum-argument',
        name: 'Argument Overview',
        layout: 'content',
        whenToUse: 'Present core argument'
      },
      {
        id: 'hum-evidence',
        name: 'Evidence Presentation',
        layout: 'two-column',
        whenToUse: 'Show supporting evidence'
      }
    ],
    visualStyle: {
      primaryColor: '#78716c',
      secondaryColor: '#57534e',
      accentColor: '#b45309',
      fontHeading: 'Libre Baskerville',
      fontBody: 'Libre Baskerville',
      iconSet: 'general',
      chartStyle: 'minimal'
    },
    specialFeatures: []
  },

  'general': {
    id: 'general',
    name: 'General Academic',
    description: 'General-purpose academic presentation',
    systemPrompt: 'You are an academic researcher presenting interdisciplinary research.',
    keywords: [],
    emphasisAreas: ['Problem', 'Method', 'Results', 'Conclusion'],
    commonSections: ['Introduction', 'Methods', 'Results', 'Discussion', 'Conclusion'],
    slideTemplates: [
      {
        id: 'gen-standard',
        name: 'Standard Content',
        layout: 'content',
        whenToUse: 'General academic presentations'
      }
    ],
    visualStyle: {
      primaryColor: '#3b82f6',
      secondaryColor: '#6366f1',
      accentColor: '#8b5cf6',
      fontHeading: 'Inter',
      fontBody: 'Inter',
      iconSet: 'general',
      chartStyle: 'modern'
    },
    specialFeatures: []
  }
};

// Domain detection patterns
export const DOMAIN_PATTERNS: DomainPattern[] = [
  { domain: 'computer-science', keywords: ['algorithm', 'neural', 'network', 'learning', 'model', 'dataset', 'code', 'software', 'system'], weight: 1 },
  { domain: 'biology', keywords: ['gene', 'protein', 'cell', 'tissue', 'organism', 'pathway', 'expression', 'assay'], weight: 1 },
  { domain: 'physics', keywords: ['quantum', 'field', 'particle', 'theory', 'experiment', 'spectrum', 'dynamics'], weight: 1 },
  { domain: 'medicine', keywords: ['clinical', 'patient', 'treatment', 'trial', 'disease', 'symptom', 'diagnosis'], weight: 1 },
  { domain: 'chemistry', keywords: ['molecule', 'compound', 'reaction', 'synthesis', 'catalyst', 'spectroscopy'], weight: 1 },
  { domain: 'economics', keywords: ['policy', 'market', 'economic', 'regression', 'causal', 'treatment effect'], weight: 1 },
  { domain: 'psychology', keywords: ['cognitive', 'behavioral', 'brain', 'neural', 'stimulus', 'participant'], weight: 1 },
  { domain: 'mathematics', keywords: ['theorem', 'proof', 'lemma', 'convergence', 'optimization', 'matrix'], weight: 1 },
];

// Detect domain from paper text
export function detectDomain(text: string): AcademicDomain {
  const text_lower = text.toLowerCase();
  const scores: Record<AcademicDomain, number> = {
    'computer-science': 0, 'biology': 0, 'physics': 0, 'chemistry': 0,
    'medicine': 0, 'economics': 0, 'psychology': 0, 'engineering': 0,
    'mathematics': 0, 'social-sciences': 0, 'humanities': 0, 'general': 0
  };

  // Count keyword matches
  DOMAIN_PATTERNS.forEach(pattern => {
    pattern.keywords.forEach(keyword => {
      const matches = (text_lower.match(new RegExp(keyword, 'g')) || []).length;
      scores[pattern.domain] += matches * pattern.weight;
    });
  });

  // Find domain with highest score
  let bestDomain: AcademicDomain = 'general';
  let bestScore = 0;

  (Object.keys(scores) as AcademicDomain[]).forEach(domain => {
    if (scores[domain] > bestScore) {
      bestScore = scores[domain];
      bestDomain = domain;
    }
  });

  // Require minimum confidence
  return bestScore >= 3 ? bestDomain : 'general';
}
