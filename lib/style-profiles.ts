import { 
  StyleProfile, 
  DEFAULT_STYLE_PROFILE, 
  STYLE_PROFILE_STORAGE_KEY,
  DEFAULT_STYLE_PROFILE_KEY,
  STYLE_PROFILE_PRESETS 
} from '@/types/style-profile';

// Get all profiles
export function getStyleProfiles(): StyleProfile[] {
  if (typeof window === 'undefined') return [DEFAULT_STYLE_PROFILE];
  
  try {
    const stored = localStorage.getItem(STYLE_PROFILE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.error('Failed to load style profiles');
  }
  
  return [DEFAULT_STYLE_PROFILE];
}

// Save profiles
export function saveStyleProfiles(profiles: StyleProfile[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STYLE_PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    console.error('Failed to save style profiles');
  }
}

// Get default profile
export function getDefaultProfile(): StyleProfile {
  const profiles = getStyleProfiles();
  const defaultId = typeof window !== 'undefined' 
    ? localStorage.getItem(DEFAULT_STYLE_PROFILE_KEY)
    : null;
  
  if (defaultId) {
    const found = profiles.find(p => p.id === defaultId);
    if (found) return found;
  }
  
  return profiles.find(p => p.isDefault) || DEFAULT_STYLE_PROFILE;
}

// Set default profile
export function setDefaultProfile(profileId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEFAULT_STYLE_PROFILE_KEY, profileId);
}

// Create new profile
export function createProfile(
  name: string,
  baseProfile?: StyleProfile,
  userId: string = 'user'
): StyleProfile {
  const now = new Date().toISOString();
  
  return {
    id: `profile-${Date.now()}`,
    name,
    userId,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
    content: baseProfile?.content || DEFAULT_STYLE_PROFILE.content,
    visual: baseProfile?.visual || DEFAULT_STYLE_PROFILE.visual,
    structure: baseProfile?.structure || DEFAULT_STYLE_PROFILE.structure,
    domainOverrides: baseProfile?.domainOverrides
  };
}

// Update profile
export function updateProfile(
  profileId: string,
  updates: Partial<StyleProfile>
): StyleProfile | null {
  const profiles = getStyleProfiles();
  const index = profiles.findIndex(p => p.id === profileId);
  
  if (index === -1) return null;
  
  profiles[index] = {
    ...profiles[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveStyleProfiles(profiles);
  return profiles[index];
}

// Delete profile
export function deleteProfile(profileId: string): boolean {
  const profiles = getStyleProfiles();
  const filtered = profiles.filter(p => p.id !== profileId);
  
  if (filtered.length === profiles.length) return false;
  
  saveStyleProfiles(filtered);
  return true;
}

// Apply preset
export function applyPreset(presetKey: string): StyleProfile {
  const preset = STYLE_PROFILE_PRESETS[presetKey];
  if (!preset) return DEFAULT_STYLE_PROFILE;
  
  const now = new Date().toISOString();
  return {
    ...DEFAULT_STYLE_PROFILE,
    id: `preset-${presetKey}-${Date.now()}`,
    name: preset.name || 'Untitled',
    description: preset.description,
    content: { ...DEFAULT_STYLE_PROFILE.content, ...preset.content },
    visual: { ...DEFAULT_STYLE_PROFILE.visual, ...preset.visual },
    structure: { ...DEFAULT_STYLE_PROFILE.structure, ...preset.structure },
    createdAt: now,
    updatedAt: now
  } as StyleProfile;
}

// Export profile for sharing
export function exportProfile(profileId: string): string | null {
  const profiles = getStyleProfiles();
  const profile = profiles.find(p => p.id === profileId);
  
  if (!profile) return null;
  
  // Remove sensitive info
  const exportable = {
    name: profile.name,
    description: profile.description,
    content: profile.content,
    visual: profile.visual,
    structure: profile.structure
  };
  
  return JSON.stringify(exportable, null, 2);
}

// Import profile
export function importProfile(jsonString: string, userId: string = 'user'): StyleProfile | null {
  try {
    const imported = JSON.parse(jsonString);
    
    return createProfile(
      imported.name || 'Imported Profile',
      {
        ...DEFAULT_STYLE_PROFILE,
        content: imported.content,
        visual: imported.visual,
        structure: imported.structure
      },
      userId
    );
  } catch {
    return null;
  }
}

// Get color palette suggestions based on institution
export function getInstitutionColors(institution: string): { primary: string; secondary: string } | null {
  const institutions: Record<string, { primary: string; secondary: string }> = {
    'MIT': { primary: '#8B0000', secondary: '#A31F34' },
    'Stanford': { primary: '#8C1515', secondary: '#B83A4B' },
    'Harvard': { primary: '#A51C30', secondary: '#8B0000' },
    'Berkeley': { primary: '#003262', secondary: '#FDB515' },
    'CMU': { primary: '#C41230', secondary: '#000000' },
    'Google': { primary: '#4285F4', secondary: '#34A853' },
    'OpenAI': { primary: '#10A37F', secondary: '#202123' },
    'Microsoft': { primary: '#00A4EF', secondary: '#FFB900' }
  };
  
  const key = Object.keys(institutions).find(k => 
    institution.toLowerCase().includes(k.toLowerCase())
  );
  
  return key ? institutions[key] : null;
}

// Generate CSS variables from profile
export function generateProfileCSS(profile: StyleProfile): string {
  const { colors, typography, visualElements } = profile.visual;
  
  return `
:root {
  --profile-primary: ${colors.primary};
  --profile-secondary: ${colors.secondary};
  --profile-accent: ${colors.accent};
  --profile-background: ${colors.background};
  --profile-text: ${colors.text};
  --profile-text-muted: ${colors.textMuted};
  
  --profile-font-heading: ${typography.headingFont}, sans-serif;
  --profile-font-body: ${typography.bodyFont}, sans-serif;
  
  --profile-border-radius: ${visualElements.borderRadius === 'none' ? '0' : 
    visualElements.borderRadius === 'small' ? '4px' :
    visualElements.borderRadius === 'medium' ? '8px' :
    visualElements.borderRadius === 'large' ? '16px' : '9999px'};
  
  --profile-spacing: ${profile.visual.spacing === 'compact' ? '0.75rem' :
    profile.visual.spacing === 'normal' ? '1rem' : '1.5rem'};
}
  `.trim();
}

// Apply profile to presentation config
export function applyProfileToConfig(profile: StyleProfile, baseConfig: unknown): unknown {
  return {
    ...(baseConfig as Record<string, unknown>),
    // Content preferences
    detailLevel: profile.content.detailLevel,
    citationStyle: profile.content.citationStyle,
    
    // Visual preferences
    colorScheme: profile.visual.colors.preset || 'custom',
    fontFamily: profile.visual.typography.bodyFont,
    
    // Structure preferences
    slideCount: profile.structure.targetSlideCount,
    generateSpeakerNotes: profile.structure.includeSpeakerNotes
  };
}

// Validate profile
export function validateProfile(profile: Partial<StyleProfile>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!profile.name) errors.push('Name is required');
  if (!profile.content?.tone) errors.push('Content tone is required');
  if (!profile.visual?.colors?.primary) errors.push('Primary color is required');
  if (!profile.visual?.typography?.headingFont) errors.push('Heading font is required');
  
  return { valid: errors.length === 0, errors };
}

// Duplicate profile
export function duplicateProfile(profileId: string, newName?: string): StyleProfile | null {
  const profiles = getStyleProfiles();
  const profile = profiles.find(p => p.id === profileId);
  
  if (!profile) return null;
  
  const now = new Date().toISOString();
  const duplicated: StyleProfile = {
    ...profile,
    id: `profile-${Date.now()}`,
    name: newName || `${profile.name} (Copy)`,
    isDefault: false,
    createdAt: now,
    updatedAt: now
  };
  
  profiles.push(duplicated);
  saveStyleProfiles(profiles);
  
  return duplicated;
}
