'use client';

import { useState } from 'react';
import { PresentationConfig, CITATION_STYLES, TemplatePreset } from '@/types/enhanced';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Wand2,
  Palette,
  Type,
  Layout,
  Users,
  GraduationCap,
  FileText,
  Quote,
  BookOpen,
  Sparkles,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PresentationConfigProps {
  config: PresentationConfig;
  onChange: (config: PresentationConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const TEMPLATES: TemplatePreset[] = [
  {
    id: 'academic',
    name: 'Academic Conference',
    description: 'Traditional academic style with formal layout',
    thumbnail: '🎓',
    category: 'academic',
    config: { theme: 'academic', detailLevel: 'detailed' }
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Clean, distraction-free design',
    thumbnail: '⚪',
    category: 'minimal',
    config: { theme: 'minimal', detailLevel: 'standard' }
  },
  {
    id: 'modern',
    name: 'Modern Tech',
    description: 'Contemporary with gradients and modern typography',
    thumbnail: '✨',
    category: 'creative',
    config: { theme: 'modern', detailLevel: 'standard' }
  },
  {
    id: 'business',
    name: 'Business Professional',
    description: 'Corporate style for industry presentations',
    thumbnail: '💼',
    category: 'business',
    config: { theme: 'modern', detailLevel: 'brief' }
  },
  {
    id: 'teaching',
    name: 'Teaching/Lecture',
    description: 'Educational style with clear explanations',
    thumbnail: '📚',
    category: 'academic',
    config: { theme: 'vibrant', detailLevel: 'comprehensive' }
  },
];

const COLOR_SCHEMES = [
  { id: 'auto', name: 'Auto (from paper)', color: 'bg-gradient-to-r from-blue-500 to-purple-500' },
  { id: 'blue', name: 'Academic Blue', color: 'bg-blue-600' },
  { id: 'green', name: 'Nature Green', color: 'bg-green-600' },
  { id: 'purple', name: 'Creative Purple', color: 'bg-purple-600' },
  { id: 'orange', name: 'Energy Orange', color: 'bg-orange-600' },
  { id: 'red', name: 'Bold Red', color: 'bg-red-600' },
  { id: 'monochrome', name: 'Monochrome', color: 'bg-gray-800' },
];

const FONTS = [
  { id: 'inter', name: 'Inter (Modern)', family: 'Inter' },
  { id: 'georgia', name: 'Georgia (Classic)', family: 'Georgia' },
  { id: 'merriweather', name: 'Merriweather (Academic)', family: 'Merriweather' },
  { id: 'roboto', name: 'Roboto (Clean)', family: 'Roboto' },
  { id: 'arial', name: 'Arial (Standard)', family: 'Arial' },
];

export function PresentationConfigPanel({ 
  config, 
  onChange, 
  onGenerate, 
  isGenerating 
}: PresentationConfigProps) {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const applyTemplate = (template: TemplatePreset) => {
    setActiveTemplate(template.id);
    onChange({ ...config, ...template.config });
  };

  const updateSection = (section: keyof PresentationConfig['sections'], value: boolean) => {
    onChange({
      ...config,
      sections: { ...config.sections, [section]: value }
    });
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <section>
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Quick Start Templates</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => applyTemplate(template)}
              className={cn(
                "p-4 rounded-lg border-2 text-left transition-all hover:shadow-md",
                activeTemplate === template.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="text-3xl mb-2">{template.thumbnail}</div>
              <h3 className="font-medium text-sm">{template.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{template.description}</p>
              {activeTemplate === template.id && (
                <Badge className="mt-2 bg-blue-100 text-blue-700">
                  <Check className="w-3 h-3 mr-1" />
                  Selected
                </Badge>
              )}
            </button>
          ))}
        </div>
      </section>

      <Separator />

      {/* Main Configuration */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Content Settings */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Content</h2>
          </div>

          <Card className="p-4 space-y-4">
            {/* Slide Count */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Number of Slides</Label>
                <span className="text-lg font-bold text-blue-600">{config.slideCount}</span>
              </div>
              <Slider
                value={[config.slideCount]}
                onValueChange={(value) => onChange({ ...config, slideCount: value[0] })}
                min={5}
                max={50}
                step={1}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Quick (5)</span>
                <span>Standard (15)</span>
                <span>Comprehensive (50)</span>
              </div>
            </div>

            {/* Detail Level */}
            <div className="space-y-2">
              <Label>Detail Level</Label>
              <div className="grid grid-cols-4 gap-2">
                {(['brief', 'standard', 'detailed', 'comprehensive'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => onChange({ ...config, detailLevel: level })}
                    className={cn(
                      "px-3 py-2 rounded text-sm font-medium capitalize transition-all",
                      config.detailLevel === level
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Users className="w-4 h-4 mr-1.5" />
                Target Audience
              </Label>
              <Select
                value={config.targetAudience}
                onValueChange={(value) => 
                  onChange({ ...config, targetAudience: value as 'experts' | 'general' | 'students' | 'mixed' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="experts">Domain Experts</SelectItem>
                  <SelectItem value="general">General Audience</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="mixed">Mixed Audience</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </section>

        {/* Design Settings */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Design</h2>
          </div>

          <Card className="p-4 space-y-4">
            {/* Color Scheme */}
            <div className="space-y-2">
              <Label>Color Scheme</Label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_SCHEMES.map((scheme) => (
                  <button
                    key={scheme.id}
                    onClick={() => onChange({ ...config, colorScheme: scheme.id as PresentationConfig['colorScheme'] })}
                    className={cn(
                      "flex flex-col items-center p-2 rounded border-2 transition-all",
                      config.colorScheme === scheme.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-full mb-1", scheme.color)} />
                    <span className="text-xs text-center">{scheme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fonts */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Heading Font</Label>
                  <Select
                    value={config.fontHeading}
                    onValueChange={(value) => onChange({ ...config, fontHeading: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONTS.map((font) => (
                        <SelectItem key={font.id} value={font.family}>
                          {font.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Body Font</Label>
                  <Select
                    value={config.fontBody}
                    onValueChange={(value) => onChange({ ...config, fontBody: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONTS.map((font) => (
                        <SelectItem key={font.id} value={font.family}>
                          {font.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* Sections Toggle */}
      <section>
        <div className="flex items-center space-x-2 mb-4">
          <Layout className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Presentation Structure</h2>
        </div>
        <Card className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(config.sections).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <Label className="capitalize cursor-pointer" htmlFor={key}>
                  {key.replace(/-/g, ' ')}
                </Label>
                <Switch
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => updateSection(key as keyof PresentationConfig['sections'], checked)}
                />
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* AI Features */}
      <section>
        <div className="flex items-center space-x-2 mb-4">
          <Wand2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">AI Features</h2>
        </div>
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center">
                  <Quote className="w-4 h-4 mr-1.5" />
                  Generate Speaker Notes
                </Label>
                <p className="text-sm text-gray-500">AI creates notes for each slide</p>
              </div>
              <Switch
                checked={config.generateSpeakerNotes}
                onCheckedChange={(checked) => 
                  onChange({ ...config, generateSpeakerNotes: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1.5" />
                  Generate Full Script
                </Label>
                <p className="text-sm text-gray-500">Complete presenter script</p>
              </div>
              <Switch
                checked={config.generateScript}
                onCheckedChange={(checked) => 
                  onChange({ ...config, generateScript: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center">
                  <Type className="w-4 h-4 mr-1.5" />
                  Simplify Language
                </Label>
                <p className="text-sm text-gray-500">Make content more accessible</p>
              </div>
              <Switch
                checked={config.simplifyLanguage}
                onCheckedChange={(checked) => 
                  onChange({ ...config, simplifyLanguage: checked })
                }
              />
            </div>
          </div>
        </Card>
      </section>

      {/* Citation Settings */}
      {config.includeCitations && (
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Citation Settings</h2>
          </div>
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Include Citations</Label>
                  <p className="text-sm text-gray-500">Extract and format citations</p>
                </div>
                <Switch
                  checked={config.includeCitations}
                  onCheckedChange={(checked) => 
                    onChange({ ...config, includeCitations: checked })
                  }
                />
              </div>

              {config.includeCitations && (
                <div className="space-y-2">
                  <Label>Citation Style</Label>
                  <Select
                    value={config.citationStyle}
                    onValueChange={(value) => 
                      onChange({ ...config, citationStyle: value as 'apa' | 'mla' | 'chicago' | 'ieee' | 'harvard' | 'vancouver' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CITATION_STYLES.map((style) => (
                        <SelectItem key={style.id} value={style.id}>
                          {style.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </Card>
        </section>
      )}

      {/* Generate Button */}
      <div className="pt-6 border-t">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
              Generating Presentation...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Generate {config.slideCount} Slides
            </>
          )}
        </Button>
        <p className="text-center text-sm text-gray-500 mt-2">
          This will create a {config.detailLevel} presentation with {config.slideCount} slides
        </p>
      </div>
    </div>
  );
}
