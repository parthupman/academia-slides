'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProviderConfig, UserSettings } from '@/types/settings';
import { Check, AlertCircle, ExternalLink, Key, Server, Brain, ServerCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateApiKey, getAvailableModels } from '@/lib/settings';

interface ProviderCardProps {
  config: ProviderConfig;
  settings: UserSettings;
  isActive: boolean;
  onSelect: () => void;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onTest: () => void;
  testStatus?: 'idle' | 'testing' | 'success' | 'error';
}

export function ProviderCard({
  config,
  settings,
  isActive,
  onSelect,
  onUpdateSettings,
  onTest,
  testStatus = 'idle'
}: ProviderCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const isConfigured = config.requiresKey 
    ? validateApiKey(config.id, settings.apiKey)
    : true;
  
  const models = getAvailableModels(config.id);
  
  const getIcon = () => {
    switch (config.icon) {
      case 'Local':
        return <Server className="w-5 h-5" />;
      case 'Custom':
        return <ServerCog className="w-5 h-5" />;
      case 'Claude':
      case 'Gemini':
      case 'Mistral':
        return <Brain className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  return (
    <>
      <Card
        className={cn(
          "relative p-5 cursor-pointer transition-all hover:shadow-md",
          isActive && "ring-2 ring-blue-500 border-blue-500",
          !isActive && "border-gray-200 hover:border-gray-300"
        )}
        onClick={onSelect}
      >
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isConfigured ? (
            <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
              <Check className="w-3 h-3 mr-1" />
              Ready
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              <AlertCircle className="w-3 h-3 mr-1" />
              Setup Required
            </Badge>
          )}
        </div>

        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ backgroundColor: config.color }}
          >
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{config.name}</h3>
              {config.id === 'local' && (
                <Badge variant="outline" className="text-xs">Free</Badge>
              )}
              {config.id === 'custom' && (
                <Badge variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-200">OpenAI-Compatible</Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{config.description}</p>
            
            {/* Models */}
            <div className="flex flex-wrap gap-1 mt-2">
              {config.models.slice(0, 3).map((model) => (
                <span key={model} className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {model}
                </span>
              ))}
              {config.models.length > 3 && (
                <span className="text-xs text-gray-400">+{config.models.length - 3} more</span>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Section - Only show when active */}
        {isActive && (
          <div className="mt-5 pt-5 border-t space-y-4">
            {/* API Key Input */}
            {config.requiresKey && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center">
                    <Key className="w-4 h-4 mr-1.5" />
                    API Key
                  </Label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHelp(true);
                      }}
                      className="text-xs text-blue-600 hover:underline flex items-center"
                    >
                      Get API Key
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    value={settings.apiKey}
                    onChange={(e) => onUpdateSettings({ apiKey: e.target.value })}
                    placeholder={config.keyPlaceholder}
                    className={cn(
                      "pr-20",
                      settings.apiKey && !validateApiKey(config.id, settings.apiKey) && "border-red-300 focus-visible:ring-red-200"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowKey(!showKey);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                {settings.apiKey && !validateApiKey(config.id, settings.apiKey) && (
                  <p className="text-xs text-red-500">
                    Invalid API key format. Expected: {config.keyPlaceholder.slice(0, 15)}...
                  </p>
                )}
              </div>
            )}

            {/* Custom Endpoint for Local */}
            {config.id === 'local' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ollama Endpoint</Label>
                <Input
                  type="text"
                  value={settings.customEndpoint || 'http://localhost:11434'}
                  onChange={(e) => onUpdateSettings({ customEndpoint: e.target.value })}
                  placeholder="http://localhost:11434"
                  onClick={(e) => e.stopPropagation()}
                />
                <p className="text-xs text-gray-500">
                  Make sure Ollama is running: <code className="bg-gray-100 px-1 py-0.5 rounded">ollama serve</code>
                </p>
              </div>
            )}

            {/* Custom Provider Info */}
            {config.id === 'custom' && (
              <div className="space-y-3">
                <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg">
                  <p className="text-sm text-violet-800">
                    <strong>Custom providers are configured in the &quot;Custom&quot; tab.</strong>
                  </p>
                  <p className="text-xs text-violet-600 mt-1">
                    Add NVIDIA NIM, Azure OpenAI, Groq, or any OpenAI-compatible endpoint.
                  </p>
                </div>
                {settings.activeCustomProviderId ? (
                  <div className="text-sm">
                    <span className="text-gray-500">Active:</span>{' '}
                    <span className="font-medium">
                      {settings.customProviders?.find(p => p.id === settings.activeCustomProviderId)?.name || 'Unknown'}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-amber-600">
                    No custom provider configured. Go to the Custom tab to add one.
                  </p>
                )}
              </div>
            )}

            {/* Model Selection - hide for custom as it's set per-provider */}
            {config.id !== 'custom' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Model</Label>
                <Select
                  value={settings.model}
                  onValueChange={(value) => onUpdateSettings({ model: value })}
                >
                  <SelectTrigger onClick={(e) => e.stopPropagation()}>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Test Button */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onTest();
                }}
                disabled={!isConfigured || testStatus === 'testing'}
                variant="outline"
                size="sm"
                className={cn(
                  testStatus === 'success' && "border-green-500 text-green-600",
                  testStatus === 'error' && "border-red-500 text-red-600"
                )}
              >
                {testStatus === 'testing' && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                )}
                {testStatus === 'success' && <Check className="w-4 h-4 mr-2" />}
                {testStatus === 'error' && <AlertCircle className="w-4 h-4 mr-2" />}
                {testStatus === 'testing' ? 'Testing...' : 
                 testStatus === 'success' ? 'Connected!' : 
                 testStatus === 'error' ? 'Failed' : 'Test Connection'}
              </Button>
              
              {testStatus === 'success' && (
                <span className="text-sm text-green-600">
                  API is working correctly
                </span>
              )}
              {testStatus === 'error' && (
                <span className="text-sm text-red-600">
                  Check your API key
                </span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How to get {config.name} API Key</DialogTitle>
            <DialogDescription>
              Follow these steps to get your API key
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <ol className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0">1</span>
                <span>Go to <a href={config.keyHelpUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{config.keyHelpUrl}</a></span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0">2</span>
                <span>Create an account or sign in</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0">3</span>
                <span>Navigate to API Keys section</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0">4</span>
                <span>Create a new API key</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0">5</span>
                <span>Copy and paste it here</span>
              </li>
            </ol>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              <strong>Note:</strong> Your API key is stored locally on your device and is never sent to our servers.
            </div>
            <Button onClick={() => setShowHelp(false)} className="w-full">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
