'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  Sliders,
  Palette,
  Layout,
  FileText,
  Clock,
  List,
  ChevronRight
} from 'lucide-react';
import { GenerateOptions, Theme, Template, THEMES } from '@/types';
import { cn } from '@/lib/utils';

interface OptionsPanelProps {
  minSlides: number;
  maxSlides: number;
  recommendedSlides: number;
  onGenerate: (options: GenerateOptions) => void;
  isGenerating: boolean;
}

const DETAIL_LEVELS = [
  {
    value: 'brief',
    label: 'Brief',
    description: 'Key points only (5-10 slides)',
    icon: <Clock className="w-4 h-4" />
  },
  {
    value: 'standard',
    label: 'Standard',
    description: 'Balanced overview (10-20 slides)',
    icon: <List className="w-4 h-4" />
  },
  {
    value: 'detailed',
    label: 'Detailed',
    description: 'Comprehensive coverage (15-30 slides)',
    icon: <FileText className="w-4 h-4" />
  }
] as const;

const FOCUS_AREAS = [
  'Methodology',
  'Results',
  'Discussion',
  'Literature Review',
  'Future Work'
];

export function OptionsPanel({
  minSlides,
  maxSlides,
  recommendedSlides,
  onGenerate,
  isGenerating
}: OptionsPanelProps) {
  const [slideCount, setSlideCount] = useState(recommendedSlides);
  const [theme, setTheme] = useState<Theme>('modern');
  const [detailLevel, setDetailLevel] = useState<'brief' | 'standard' | 'detailed'>('standard');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [includeFigures, setIncludeFigures] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);

  const handleGenerate = () => {
    onGenerate({
      slideCount,
      theme,
      detailLevel,
      focusAreas: selectedFocusAreas,
      includeFigures,
      includeTables
    });
  };

  const toggleFocusArea = (area: string) => {
    setSelectedFocusAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center space-x-2 text-gray-900">
        <Sliders className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Presentation Settings</h2>
      </div>

      <Tabs defaultValue="slides" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="slides">Slides</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        {/* Slides Tab */}
        <TabsContent value="slides" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Number of Slides
              </label>
              <span className="text-2xl font-bold text-blue-600">
                {slideCount}
              </span>
            </div>
            
            <Slider
              value={[slideCount]}
              onValueChange={(value) => setSlideCount(value[0])}
              min={minSlides}
              max={maxSlides}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{minSlides} slides</span>
              <span className="text-blue-600 font-medium">
                Recommended: {recommendedSlides}
              </span>
              <span>{maxSlides} slides</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Detail Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {DETAIL_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => {
                    setDetailLevel(level.value);
                    // Auto-adjust slide count based on detail level
                    if (level.value === 'brief') {
                      setSlideCount(Math.max(minSlides, Math.min(8, maxSlides)));
                    } else if (level.value === 'detailed') {
                      setSlideCount(Math.min(maxSlides, Math.max(20, minSlides)));
                    } else {
                      setSlideCount(recommendedSlides);
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                    detailLevel === level.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className={cn(
                    "mb-2",
                    detailLevel === level.value ? "text-blue-600" : "text-gray-400"
                  )}>
                    {level.icon}
                  </div>
                  <span className={cn(
                    "font-medium text-sm",
                    detailLevel === level.value ? "text-blue-900" : "text-gray-700"
                  )}>
                    {level.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Theme Tab */}
        <TabsContent value="theme" className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <Palette className="w-4 h-4" />
            <span className="text-sm font-medium">Choose a Template</span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {THEMES.map((template: Template) => (
              <button
                key={template.theme}
                onClick={() => setTheme(template.theme)}
                className={cn(
                  "flex items-center p-3 rounded-lg border-2 transition-all text-left",
                  theme === template.theme
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className={cn(
                  "w-16 h-12 rounded border mr-4 flex-shrink-0",
                  template.preview
                )} />
                <div>
                  <h4 className={cn(
                    "font-medium",
                    theme === template.theme ? "text-blue-900" : "text-gray-900"
                  )}>
                    {template.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {template.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-gray-700">
              <Layout className="w-4 h-4" />
              <span className="text-sm font-medium">Focus Areas (Optional)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {FOCUS_AREAS.map((area) => (
                <Badge
                  key={area}
                  variant={selectedFocusAreas.includes(area) ? 'default' : 'outline'}
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedFocusAreas.includes(area)
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'hover:bg-gray-100'
                  )}
                  onClick={() => toggleFocusArea(area)}
                >
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-medium text-gray-700">Options</span>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFigures}
                  onChange={(e) => setIncludeFigures(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  Include figure references
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTables}
                  onChange={(e) => setIncludeTables(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  Include table references
                </span>
              </label>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-4 border-t">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating Presentation...
            </>
          ) : (
            <>
              Generate {slideCount} Slides
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
