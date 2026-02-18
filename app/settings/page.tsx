'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProviderCard } from '@/components/settings/provider-card';
import { ServicesConfig } from '@/components/services-config';
import { ServiceIntegrationDemo } from '@/components/visual-preview';
import { AI_PROVIDERS, UserSettings, DEFAULT_SETTINGS } from '@/types/settings';
import { getSettings, saveSettings, clearSettings } from '@/lib/settings';
import { checkProviderStatus } from '@/lib/ai-providers';
import { getServices, saveServices, DEFAULT_SERVICES } from '@/lib/services-config';
import { AIService } from '@/types/services';
import { 
  ArrowLeft, 
  Settings, 
  Save, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Thermometer,
  Maximize2,
  Layers,
  Zap,
  Workflow
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [services, setServices] = useState<AIService[]>(DEFAULT_SERVICES);
  const [hasChanges, setHasChanges] = useState(false);
  const [testStatuses, setTestStatuses] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({});
  const [isClient, setIsClient] = useState(false);

  // Load settings on mount
  useEffect(() => {
    setIsClient(true);
    const loaded = getSettings();
    setSettings(loaded);
    const loadedServices = getServices();
    setServices(loadedServices);
  }, []);

  const updateSettings = (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    setHasChanges(true);
  };

  const updateServices = (newServices: AIService[]) => {
    setServices(newServices);
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSettings(settings);
    saveServices(services);
    setHasChanges(false);
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      clearSettings();
      setSettings(DEFAULT_SETTINGS);
      setServices(DEFAULT_SERVICES);
      setHasChanges(false);
      toast.info('Settings reset to defaults');
    }
  };

  const handleTestProvider = async (providerId: string) => {
    setTestStatuses(prev => ({ ...prev, [providerId]: 'testing' }));
    
    try {
      const status = await checkProviderStatus(settings);
      
      if (status.valid) {
        setTestStatuses(prev => ({ ...prev, [providerId]: 'success' }));
        toast.success(`${AI_PROVIDERS.find(p => p.id === providerId)?.name} is working!`);
      } else {
        setTestStatuses(prev => ({ ...prev, [providerId]: 'error' }));
        toast.error('Connection failed. Check your API key.');
      }
    } catch {
      setTestStatuses(prev => ({ ...prev, [providerId]: 'error' }));
      toast.error('Connection test failed');
    }
  };

  if (!isClient) {
    return null;
  }

  const activeProvider = AI_PROVIDERS.find(p => p.id === settings.provider);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-600" />
                <h1 className="text-xl font-semibold">Settings</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <span className="text-sm text-amber-600 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Unsaved changes
                </span>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Status Banner */}
        {activeProvider && (
          <Card className="p-4 bg-blue-50 border-blue-200 mb-8">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: activeProvider.color }}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-medium text-gray-900">
                  Active Provider: {activeProvider.name}
                </h2>
                <p className="text-sm text-gray-600">
                  Model: {settings.model || 'Not selected'}
                </p>
              </div>
            </div>
          </Card>
        )}

        <Tabs defaultValue="general" className="space-y-8">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="general">
              <Settings className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="services">
              <Layers className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Zap className="w-4 h-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-8">
            {/* AI Provider Selection */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">AI Provider</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Choose which AI service to use for analyzing papers and generating presentations.
                Your API key is stored locally on your device.
              </p>
              
              <div className="grid gap-4">
                {AI_PROVIDERS.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    config={provider}
                    settings={settings}
                    isActive={settings.provider === provider.id}
                    onSelect={() => updateSettings({ 
                      provider: provider.id,
                      model: provider.models[0]
                    })}
                    onUpdateSettings={updateSettings}
                    onTest={() => handleTestProvider(provider.id)}
                    testStatus={testStatuses[provider.id]}
                  />
                ))}
              </div>
            </section>

            <Separator />

            {/* Advanced Settings */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Thermometer className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Advanced Settings</h2>
              </div>

              <Card className="p-6 space-y-6">
                {/* Temperature */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center">
                      <Thermometer className="w-4 h-4 mr-2" />
                      Creativity (Temperature)
                    </Label>
                    <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                      {settings.temperature}
                    </span>
                  </div>
                  <Slider
                    value={[settings.temperature]}
                    onValueChange={(value) => updateSettings({ temperature: value[0] })}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>More Focused (0)</span>
                    <span>More Creative (1)</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Lower values produce more consistent results, higher values produce more varied output.
                  </p>
                </div>

                {/* Max Tokens */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center">
                      <Maximize2 className="w-4 h-4 mr-2" />
                      Max Output Length
                    </Label>
                    <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                      {settings.maxTokens} tokens
                    </span>
                  </div>
                  <Slider
                    value={[settings.maxTokens]}
                    onValueChange={(value) => updateSettings({ maxTokens: value[0] })}
                    min={1000}
                    max={8000}
                    step={500}
                  />
                  <p className="text-sm text-gray-600">
                    Maximum length of AI responses. Higher values allow for more detailed slides.
                  </p>
                </div>

                <Separator />

                {/* Save Locally */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center cursor-pointer">
                      Save Settings Locally
                    </Label>
                    <p className="text-sm text-gray-500">
                      Store your API key and preferences in browser storage
                    </p>
                  </div>
                  <Switch
                    checked={settings.saveLocally}
                    onCheckedChange={(checked) => updateSettings({ saveLocally: checked })}
                  />
                </div>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="services" className="space-y-8">
            <ServicesConfig services={services} onUpdate={updateServices} />
            
            <Separator />
            
            <ServiceIntegrationDemo />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-8">
            {/* Reset */}
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-red-900">Reset Settings</h3>
                  <p className="text-sm text-red-700">
                    Clear all settings and start fresh
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </Card>

            {/* Help */}
            <Card className="bg-blue-50 border-blue-200 p-6">
              <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                <Workflow className="w-5 h-5 mr-2" />
                Understanding the Architecture
              </h3>
              <p className="text-blue-800 mb-4">
                AcademiaSlides uses a multi-service architecture where different AI services 
                handle specific tasks for optimal results:
              </p>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Text Analysis:</span>
                  <span>GPT-4, Claude, or Gemini analyze your paper and extract key concepts</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Visual Generation:</span>
                  <span>Nano Banana creates custom illustrations, diagrams, and slide backgrounds</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Chart Creation:</span>
                  <span>Dedicated chart service generates data visualizations from your results</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Citation Formatting:</span>
                  <span>Specialized service ensures proper academic formatting (APA, MLA, etc.)</span>
                </li>
              </ul>
            </Card>

            {/* Help */}
            <Card className="bg-gray-50 p-6">
              <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>Your API keys are stored locally and never leave your device</li>
                <li>Free tier available with Google Gemini and local Ollama</li>
                <li>Test your connection before using</li>
                <li>Check the provider&apos;s website for pricing details</li>
                <li>Enable only the services you need to save costs</li>
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
