import { UserSettings, ProviderStatus } from '@/types/settings';
import { PaperAnalysis, Slide, GenerateOptions } from '@/types';

// Provider-specific implementations
export async function analyzeWithOpenAI(
  text: string,
  settings: UserSettings
): Promise<PaperAnalysis> {
  const { default: OpenAI } = await import('openai');
  
  // Determine endpoint and model for custom providers
  let endpoint = settings.customEndpoint;
  let model = settings.model;
  
  // If using a custom provider, get its config
  if (settings.provider === 'custom' && settings.activeCustomProviderId) {
    const customProvider = settings.customProviders?.find(
      p => p.id === settings.activeCustomProviderId
    );
    if (customProvider) {
      endpoint = customProvider.endpoint;
      model = customProvider.model;
    }
  }
  
  const openai = new OpenAI({
    apiKey: settings.apiKey,
    baseURL: endpoint || undefined,
  });

  const truncatedText = text.slice(0, 15000);
  
  const prompt = `You are an expert academic research assistant. Analyze the following research paper text and extract structured information.

Return a JSON object with this exact structure:
{
  "title": "Paper title",
  "authors": ["Author 1", "Author 2"],
  "abstract": "Complete abstract text",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "figures": 5,
  "tables": 3,
  "references": 25,
  "sections": [
    {
      "heading": "Introduction",
      "content": "Brief summary of this section's key points",
      "importance": "high",
      "subsections": []
    }
  ]
}

Sections should include: Introduction, Literature Review, Methodology, Results, Discussion, Conclusion (or whatever sections actually exist).
Mark importance based on: "high" for core contributions/methodology/results, "medium" for background/discussion, "low" for supplementary info.

Paper text:
${truncatedText}`;

  const response = await openai.chat.completions.create({
    model: model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert academic paper analyzer. Always return valid JSON.' },
      { role: 'user', content: prompt }
    ],
    temperature: settings.temperature || 0.3,
    max_tokens: settings.maxTokens || 4000,
  });

  const content = response.choices[0]?.message?.content || '{}';
  return parseJSONResponse<PaperAnalysis>(content);
}

export async function analyzeWithAnthropic(
  text: string,
  settings: UserSettings
): Promise<PaperAnalysis> {
  const truncatedText = text.slice(0, 15000);
  
  const prompt = `You are an expert academic research assistant. Analyze the following research paper text and extract structured information.

Return a JSON object with this exact structure:
{
  "title": "Paper title",
  "authors": ["Author 1", "Author 2"],
  "abstract": "Complete abstract text",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "figures": 5,
  "tables": 3,
  "references": 25,
  "sections": [
    {
      "heading": "Introduction",
      "content": "Brief summary of key points",
      "importance": "high"
    }
  ]
}

Paper text:
${truncatedText}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: settings.model || 'claude-3-5-sonnet-20241022',
      max_tokens: settings.maxTokens || 4000,
      temperature: settings.temperature || 0.3,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Anthropic API error');
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || '{}';
  return parseJSONResponse<PaperAnalysis>(content);
}

export async function analyzeWithGemini(
  text: string,
  settings: UserSettings
): Promise<PaperAnalysis> {
  const truncatedText = text.slice(0, 15000);
  
  const prompt = `Analyze this research paper and return JSON with: title, authors (array), abstract, keywords (array), figures (number), tables (number), references (number), and sections (array with heading, content, importance).

Paper text:
${truncatedText}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${settings.model || 'gemini-1.5-pro'}:generateContent?key=${settings.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: settings.temperature || 0.3,
          maxOutputTokens: settings.maxTokens || 4000,
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API error');
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return parseJSONResponse<PaperAnalysis>(content);
}

export async function analyzeWithMistral(
  text: string,
  settings: UserSettings
): Promise<PaperAnalysis> {
  const truncatedText = text.slice(0, 15000);
  
  const prompt = `Analyze this research paper and return JSON with: title, authors, abstract, keywords, figures, tables, references, and sections.

Paper text:
${truncatedText}`;

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model || 'mistral-large-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: settings.temperature || 0.3,
      max_tokens: settings.maxTokens || 4000,
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Mistral API error');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  return parseJSONResponse<PaperAnalysis>(content);
}

export async function analyzeWithLocal(
  text: string,
  settings: UserSettings
): Promise<PaperAnalysis> {
  const truncatedText = text.slice(0, 15000);
  const endpoint = settings.customEndpoint || 'http://localhost:11434';
  
  const prompt = `Analyze this research paper and return JSON with: title, authors, abstract, keywords, figures, tables, references, and sections.

Paper text:
${truncatedText}`;

  const response = await fetch(`${endpoint}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: settings.model || 'llama3.2',
      prompt: prompt,
      stream: false,
      format: 'json'
    })
  });

  if (!response.ok) {
    throw new Error('Local model error. Make sure Ollama is running.');
  }

  const data = await response.json();
  const content = data.response || '{}';
  return parseJSONResponse(content);
}

// Generic slide generation (works with all providers)
export async function generateSlidesWithProvider(
  analysis: PaperAnalysis,
  options: GenerateOptions,
  settings: UserSettings
): Promise<Slide[]> {
  const { slideCount, detailLevel, focusAreas } = options;
  
  const prompt = `Create a professional academic presentation outline.

Paper Title: ${analysis.title}
Abstract: ${analysis.abstract}
Sections: ${analysis.sections.map(s => s.heading).join(', ')}

Generate ${slideCount} slides. Return JSON array with: id, title, content (array), layout (title/content/split/quote/references), notes.

Detail Level: ${detailLevel}
${focusAreas.length > 0 ? `Focus Areas: ${focusAreas.join(', ')}` : ''}`;

  let content: string;

  switch (settings.provider) {
    case 'openai':
    case 'custom':
      content = await callOpenAI(prompt, settings);
      break;
    case 'anthropic':
      content = await callAnthropic(prompt, settings);
      break;
    case 'google':
      content = await callGemini(prompt, settings);
      break;
    case 'mistral':
      content = await callMistral(prompt, settings);
      break;
    case 'local':
      content = await callLocal(prompt, settings);
      break;
    default:
      throw new Error('Unknown provider');
  }

  const slides = parseJSONResponse(content) as Slide[];
  return slides.map((slide, index) => ({ ...slide, id: index + 1 }));
}

// Helper functions for each provider
async function callOpenAI(prompt: string, settings: UserSettings): Promise<string> {
  const { default: OpenAI } = await import('openai');
  
  // Determine endpoint and model for custom providers
  let endpoint = settings.customEndpoint;
  let model = settings.model;
  let apiKey = settings.apiKey;
  
  // If using a custom provider, get its config
  if (settings.provider === 'custom' && settings.activeCustomProviderId) {
    const customProvider = settings.customProviders?.find(
      p => p.id === settings.activeCustomProviderId
    );
    if (customProvider) {
      endpoint = customProvider.endpoint;
      model = customProvider.model;
      apiKey = customProvider.apiKey;
    }
  }
  
  const openai = new OpenAI({ 
    apiKey: apiKey,
    baseURL: endpoint || undefined,
  });
  
  const response = await openai.chat.completions.create({
    model: model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert academic presentation designer. Always return valid JSON.' },
      { role: 'user', content: prompt }
    ],
    temperature: settings.temperature || 0.4,
    max_tokens: settings.maxTokens || 4000,
  });
  
  return response.choices[0]?.message?.content || '[]';
}

async function callAnthropic(prompt: string, settings: UserSettings): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: settings.model || 'claude-3-5-sonnet-20241022',
      max_tokens: settings.maxTokens || 4000,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  const data = await response.json();
  return data.content?.[0]?.text || '[]';
}

async function callGemini(prompt: string, settings: UserSettings): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${settings.model || 'gemini-1.5-pro'}:generateContent?key=${settings.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      })
    }
  );
  
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
}

async function callMistral(prompt: string, settings: UserSettings): Promise<string> {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model || 'mistral-large-latest',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: settings.maxTokens || 4000,
    })
  });
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '[]';
}

async function callLocal(prompt: string, settings: UserSettings): Promise<string> {
  const endpoint = settings.customEndpoint || 'http://localhost:11434';
  
  const response = await fetch(`${endpoint}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: settings.model || 'llama3.2',
      prompt: prompt,
      stream: false,
      format: 'json'
    })
  });
  
  const data = await response.json();
  return data.response || '[]';
}

// Helper to extract JSON from response
function parseJSONResponse<T>(content: string): T {
  const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in response');
  }
  return JSON.parse(jsonMatch[0]) as T;
}

// Check if provider is working
export async function checkProviderStatus(settings: UserSettings): Promise<ProviderStatus> {
  try {
    let valid = false;
    
    switch (settings.provider) {
      case 'openai':
        valid = await checkOpenAI(settings);
        break;
      case 'custom':
        valid = await checkCustomProvider(settings);
        break;
      case 'anthropic':
        valid = await checkAnthropic(settings);
        break;
      case 'google':
        valid = await checkGemini(settings);
        break;
      case 'mistral':
        valid = await checkMistral(settings);
        break;
      case 'local':
        valid = await checkLocal(settings);
        break;
    }
    
    return {
      provider: settings.provider,
      configured: !!settings.apiKey || settings.provider === 'local' || settings.provider === 'custom',
      valid,
      lastChecked: new Date().toISOString(),
      customProviderId: settings.activeCustomProviderId
    };
  } catch (error) {
    return {
      provider: settings.provider,
      configured: !!settings.apiKey || settings.provider === 'local' || settings.provider === 'custom',
      valid: false,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      customProviderId: settings.activeCustomProviderId
    };
  }
}

async function checkCustomProvider(settings: UserSettings): Promise<boolean> {
  const customProvider = settings.customProviders?.find(
    p => p.id === settings.activeCustomProviderId
  );
  
  if (!customProvider) return false;
  
  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: customProvider.apiKey,
      baseURL: customProvider.endpoint,
    });
    
    // Try to list models - lightweight check
    const models = await openai.models.list();
    return models.data.length > 0;
  } catch {
    // Fallback: try a simple completion
    try {
      const response = await fetch(`${customProvider.endpoint}/models`, {
        headers: { 'Authorization': `Bearer ${customProvider.apiKey}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

async function checkOpenAI(settings: UserSettings): Promise<boolean> {
  const { default: OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey: settings.apiKey });
  const models = await openai.models.list();
  return models.data.length > 0;
}

async function checkAnthropic(settings: UserSettings): Promise<boolean> {
  const response = await fetch('https://api.anthropic.com/v1/models', {
    headers: { 'x-api-key': settings.apiKey, 'anthropic-version': '2023-06-01' }
  });
  return response.ok;
}

async function checkGemini(settings: UserSettings): Promise<boolean> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${settings.apiKey}`
  );
  return response.ok;
}

async function checkMistral(settings: UserSettings): Promise<boolean> {
  const response = await fetch('https://api.mistral.ai/v1/models', {
    headers: { 'Authorization': `Bearer ${settings.apiKey}` }
  });
  return response.ok;
}

async function checkLocal(settings: UserSettings): Promise<boolean> {
  const endpoint = settings.customEndpoint || 'http://localhost:11434';
  const response = await fetch(`${endpoint}/api/tags`);
  return response.ok;
}
