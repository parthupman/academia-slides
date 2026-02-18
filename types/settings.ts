export type AIProvider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'local' | 'custom';

export interface ProviderConfig {
  id: AIProvider;
  name: string;
  description: string;
  website: string;
  models: string[];
  requiresKey: boolean;
  keyPlaceholder: string;
  keyPattern: RegExp;
  keyHelpUrl: string;
  color: string;
  icon: string;
}

export const AI_PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4, GPT-3.5 Turbo - Industry leading models',
    website: 'https://openai.com',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4', 'gpt-3.5-turbo'],
    requiresKey: true,
    keyPlaceholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx',
    keyPattern: /^sk-[a-zA-Z0-9]{32,}$/,
    keyHelpUrl: 'https://platform.openai.com/api-keys',
    color: '#10a37f',
    icon: 'OpenAI'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude 3.5 Sonnet, Claude 3 Opus - Excellent for academic content',
    website: 'https://anthropic.com',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
    requiresKey: true,
    keyPlaceholder: 'sk-ant-api03-xxxxxxxx',
    keyPattern: /^sk-ant-api[0-9]+-[a-zA-Z0-9-]+$/,
    keyHelpUrl: 'https://console.anthropic.com/settings/keys',
    color: '#cc785c',
    icon: 'Claude'
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Gemini Pro, Gemini Ultra - Free tier available',
    website: 'https://ai.google.dev',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
    requiresKey: true,
    keyPlaceholder: 'AIzaSyxxxxxxxxxxxxxxxx',
    keyPattern: /^AIzaSy[a-zA-Z0-9_-]{35,}$/,
    keyHelpUrl: 'https://aistudio.google.com/app/apikey',
    color: '#4285f4',
    icon: 'Gemini'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral Large, Mixtral - Open source models',
    website: 'https://mistral.ai',
    models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
    requiresKey: true,
    keyPlaceholder: 'xxxxxxxxxxxxxxxxxxxxxxxx',
    keyPattern: /^[a-zA-Z0-9]{32,}$/,
    keyHelpUrl: 'https://console.mistral.ai/api-keys/',
    color: '#ff7000',
    icon: 'Mistral'
  },
  {
    id: 'local',
    name: 'Local/Ollama',
    description: 'Run models locally - No API key needed!',
    website: 'https://ollama.com',
    models: ['llama3.2', 'mistral', 'phi3', 'gemma2'],
    requiresKey: false,
    keyPlaceholder: 'http://localhost:11434',
    keyPattern: /^https?:\/\/.+/,
    keyHelpUrl: 'https://ollama.com/download',
    color: '#000000',
    icon: 'Local'
  }
];

export interface CustomProvider {
  id: string;
  name: string;
  endpoint: string;
  apiKey: string;
  model: string;
  headers?: Record<string, string>;
}

export interface UserSettings {
  provider: AIProvider;
  apiKey: string;
  model: string;
  customEndpoint?: string;
  maxTokens: number;
  temperature: number;
  saveLocally: boolean;
  // Custom providers storage
  customProviders?: CustomProvider[];
  activeCustomProviderId?: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o-mini',
  maxTokens: 4000,
  temperature: 0.3,
  saveLocally: false,
  customProviders: [],
};

export interface ProviderStatus {
  provider: AIProvider;
  configured: boolean;
  valid: boolean;
  lastChecked: string;
  error?: string;
  customProviderId?: string;
}
