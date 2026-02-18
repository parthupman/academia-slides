'use client';

import { useState } from 'react';
import { CustomProvider, UserSettings } from '@/types/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  Globe,
  Key,
  Cpu,
  Server,
  TestTube
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomProviderManagerProps {
  settings: UserSettings;
  onUpdate: (settings: UserSettings) => void;
}

const PRESET_PROVIDERS = [
  {
    name: 'NVIDIA NIM',
    endpoint: 'https://integrate.api.nvidia.com/v1',
    model: 'nvidia/llama-3.1-nemotron-70b-instruct',
    description: 'NVIDIA NIM microservices for LLMs'
  },
  {
    name: 'Azure OpenAI',
    endpoint: 'https://{your-resource}.openai.azure.com/openai/deployments/{deployment}',
    model: 'gpt-4',
    description: 'Microsoft Azure OpenAI Service'
  },
  {
    name: 'Together AI',
    endpoint: 'https://api.together.xyz/v1',
    model: 'meta-llama/Llama-3.2-70B-Instruct-Turbo',
    description: 'Together AI inference platform'
  },
  {
    name: 'Fireworks AI',
    endpoint: 'https://api.fireworks.ai/inference/v1',
    model: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
    description: 'Fireworks AI fast inference'
  },
  {
    name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1',
    model: 'llama-3.1-70b-versatile',
    description: 'Groq ultra-fast inference'
  },
  {
    name: 'Perplexity',
    endpoint: 'https://api.perplexity.ai',
    model: 'llama-3.1-sonar-large-128k-online',
    description: 'Perplexity API with search'
  },
  {
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1',
    model: 'anthropic/claude-3.5-sonnet',
    description: 'OpenRouter unified API'
  },
  {
    name: 'DeepInfra',
    endpoint: 'https://api.deepinfra.com/v1/openai',
    model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
    description: 'DeepInfra inference API'
  }
];

export function CustomProviderManager({ settings, onUpdate }: CustomProviderManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [formData, setFormData] = useState<Partial<CustomProvider>>({
    name: '',
    endpoint: '',
    apiKey: '',
    model: '',
  });

  const customProviders = settings.customProviders || [];

  const handleAdd = () => {
    if (!formData.name || !formData.endpoint || !formData.model) return;
    
    const newProvider: CustomProvider = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      endpoint: formData.endpoint,
      apiKey: formData.apiKey || '',
      model: formData.model,
    };

    onUpdate({
      ...settings,
      customProviders: [...customProviders, newProvider],
      // If this is the first custom provider, activate it
      ...(customProviders.length === 0 ? {
        provider: 'custom' as const,
        activeCustomProviderId: newProvider.id
      } : {})
    });

    setFormData({ name: '', endpoint: '', apiKey: '', model: '' });
    setIsAdding(false);
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name || !formData.endpoint || !formData.model) return;
    
    onUpdate({
      ...settings,
      customProviders: customProviders.map(p =>
        p.id === editingId
          ? { ...p, ...formData as CustomProvider }
          : p
      )
    });

    setEditingId(null);
    setFormData({ name: '', endpoint: '', apiKey: '', model: '' });
  };

  const handleDelete = (id: string) => {
    const newProviders = customProviders.filter(p => p.id !== id);
    onUpdate({
      ...settings,
      customProviders: newProviders,
      // If we deleted the active provider, switch to openai
      ...(settings.activeCustomProviderId === id ? {
        provider: 'openai' as const,
        activeCustomProviderId: undefined
      } : {})
    });
  };

  const handleActivate = (provider: CustomProvider) => {
    onUpdate({
      ...settings,
      provider: 'custom',
      activeCustomProviderId: provider.id,
      // Also update the main API key and endpoint for compatibility
      apiKey: provider.apiKey,
      customEndpoint: provider.endpoint,
      model: provider.model
    });
  };

  const testProvider = async (provider: CustomProvider) => {
    setTestingId(provider.id);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/test-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: provider.endpoint,
          apiKey: provider.apiKey,
          model: provider.model
        })
      });

      const result = await response.json();
      setTestResult({
        success: result.success,
        message: result.message || (result.success ? 'Connection successful!' : 'Connection failed')
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Test failed'
      });
    } finally {
      setTestingId(null);
    }
  };

  const applyPreset = (preset: typeof PRESET_PROVIDERS[0]) => {
    setFormData({
      ...formData,
      name: preset.name,
      endpoint: preset.endpoint,
      model: preset.model
    });
  };

  const startEdit = (provider: CustomProvider) => {
    setEditingId(provider.id);
    setFormData({
      name: provider.name,
      endpoint: provider.endpoint,
      apiKey: provider.apiKey,
      model: provider.model
    });
  };

  const isActive = (provider: CustomProvider) => 
    settings.provider === 'custom' && settings.activeCustomProviderId === provider.id;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <Server className="w-5 h-5 mr-2 text-violet-500" />
            Custom OpenAI-Compatible Providers
          </h3>
          <p className="text-sm text-gray-500">
            Add providers like NVIDIA, Azure, Groq, or any OpenAI-compatible endpoint
          </p>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-1" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Custom Provider</DialogTitle>
              <DialogDescription>
                Configure an OpenAI-compatible API endpoint
              </DialogDescription>
            </DialogHeader>
            
            {/* Preset Quick Select */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 uppercase">Quick Select Preset</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {PRESET_PROVIDERS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="text-left p-2 rounded border hover:bg-gray-50 transition-colors text-sm"
                  >
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-gray-500 truncate">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., NVIDIA NIM"
                />
              </div>
              <div>
                <Label>Endpoint URL</Label>
                <Input
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  placeholder="https://api.example.com/v1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be OpenAI-compatible (supports /chat/completions)
                </p>
              </div>
              <div>
                <Label>Model Name</Label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g., meta-llama/Llama-3.2-70B"
                />
              </div>
              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="sk-..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAdd}
                disabled={!formData.name || !formData.endpoint || !formData.model}
                className="bg-violet-600 hover:bg-violet-700"
              >
                Add Provider
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Provider List */}
      {customProviders.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <Server className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No custom providers configured</p>
          <p className="text-sm text-gray-400 mt-1">
            Add providers like NVIDIA NIM, Groq, or Azure OpenAI
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {customProviders.map((provider) => (
            <Card
              key={provider.id}
              className={cn(
                "p-4 transition-all",
                isActive(provider) 
                  ? "border-violet-500 bg-violet-50" 
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold">{provider.name}</h4>
                    {isActive(provider) && (
                      <Badge className="bg-violet-100 text-violet-700">
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Globe className="w-3 h-3 mr-1" />
                      {provider.endpoint}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Cpu className="w-3 h-3 mr-1" />
                      {provider.model}
                    </span>
                    <span className="flex items-center">
                      <Key className="w-3 h-3 mr-1" />
                      {provider.apiKey ? '••••••••' : 'No key'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {!isActive(provider) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleActivate(provider)}
                    >
                      Activate
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => testProvider(provider)}
                    disabled={testingId === provider.id}
                    title="Test connection"
                  >
                    <TestTube className={cn(
                      "w-4 h-4",
                      testingId === provider.id && "animate-pulse"
                    )} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEdit(provider)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(provider.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Test Result */}
              {testResult && testingId === null && (
                <div className={cn(
                  "mt-3 p-2 rounded text-sm",
                  testResult.success 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                )}>
                  {testResult.message}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Provider</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Endpoint URL</Label>
              <Input
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
              />
            </div>
            <div>
              <Label>Model Name</Label>
              <Input
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div>
              <Label>API Key</Label>
              <Input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={!formData.name || !formData.endpoint || !formData.model}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
