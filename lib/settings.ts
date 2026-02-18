import { UserSettings, DEFAULT_SETTINGS, AIProvider, ProviderConfig, AI_PROVIDERS } from '@/types/settings';

const STORAGE_KEY = 'academiaslides_settings';

export function getSettings(): UserSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all fields exist
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('Error reading settings:', error);
  }
  
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export function clearSettings(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing settings:', error);
  }
}

export function getProviderConfig(providerId: AIProvider): ProviderConfig | undefined {
  return AI_PROVIDERS.find(p => p.id === providerId);
}

export function validateApiKey(provider: AIProvider, key: string): boolean {
  const config = getProviderConfig(provider);
  if (!config) return false;
  
  if (!config.requiresKey) return true;
  if (!key || key.trim().length === 0) return false;
  
  return config.keyPattern.test(key.trim());
}

export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '';
  return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4);
}

export function getAvailableModels(provider: AIProvider): string[] {
  const config = getProviderConfig(provider);
  return config?.models || [];
}

export function getDefaultModel(provider: AIProvider): string {
  const models = getAvailableModels(provider);
  return models[0] || '';
}
