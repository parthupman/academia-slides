'use client';

import { useState } from 'react';
import { EnhancedSlide } from '@/types/enhanced';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ImageIcon,
  Wand2,
  RefreshCw,
  Download,
  Check,
  AlertCircle,
  Layers
} from 'lucide-react';

interface VisualPreviewProps {
  slide: EnhancedSlide;
  generatedImage?: string;
  isGenerating?: boolean;
  onRegenerate?: () => void;
  onAccept?: () => void;
}

export function VisualPreview({ 
  slide, 
  generatedImage, 
  isGenerating, 
  onRegenerate,
  onAccept 
}: VisualPreviewProps) {
  const [showPrompt, setShowPrompt] = useState(false);

  // Generate prompt based on slide content
  const generatedPrompt = `Professional illustration for academic presentation: ${slide.title}. 
${slide.content.join(', ')}. Flat design style, blue and green color palette, 
clean minimalist, suitable for research paper presentation, no text.`;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Wand2 className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold">AI Visual Generation</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <ImageIcon className="w-3 h-3 mr-1" />
            Nano Banana
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setShowPrompt(true)}>
            View Prompt
          </Button>
        </div>
      </div>

      {/* Generation Status */}
      {isGenerating && (
        <div className="space-y-3 py-8">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Generating visual with Nano Banana...</span>
          </div>
          <Progress value={45} className="w-full" />
          <p className="text-xs text-center text-gray-500">
            This may take 10-30 seconds
          </p>
        </div>
      )}

      {/* Generated Image */}
      {!isGenerating && generatedImage && (
        <div className="space-y-4">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group">
            <Image 
              src={generatedImage} 
              alt={`Generated illustration for: ${slide.title}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <Button size="sm" variant="secondary" onClick={onRegenerate}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Regenerate
              </Button>
              <Button size="sm" variant="secondary" onClick={onAccept}>
                <Check className="w-4 h-4 mr-1" />
                Use This
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Generated illustration for: <strong>{slide.title}</strong>
            </p>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      )}

      {/* No Image State */}
      {!isGenerating && !generatedImage && (
        <div className="py-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-gray-600 mb-4">
            Generate a custom illustration for this slide using Nano Banana
          </p>
          <Button onClick={onRegenerate} className="bg-purple-600 hover:bg-purple-700">
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Visual
          </Button>
        </div>
      )}

      {/* Prompt Dialog */}
      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Generation Prompt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Generated Prompt:</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{generatedPrompt}</p>
            </div>
            <div className="text-sm text-gray-500">
              <p className="flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                This prompt is automatically generated from your slide content and sent to Nano Banana for image generation.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Example showing how text and visual services work together
export function ServiceIntegrationDemo() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Layers className="w-5 h-5 mr-2 text-blue-600" />
        How Services Work Together
      </h3>
      
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-blue-600">1</span>
          </div>
          <div className="flex-1">
            <h4 className="font-medium">Text Analysis (GPT-4 / Claude)</h4>
            <p className="text-sm text-gray-600">
              Analyzes your paper, extracts key concepts, generates slide content
            </p>
            <div className="mt-2 p-3 bg-gray-50 rounded text-sm font-mono text-gray-700">
              &quot;The paper discusses neural networks for climate prediction... 
              [generating slide content about methodology]...&quot;
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="w-0.5 h-6 bg-gray-300" />
        </div>

        {/* Step 2 */}
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-purple-600">2</span>
          </div>
          <div className="flex-1">
            <h4 className="font-medium">Visual Prompt Generation</h4>
            <p className="text-sm text-gray-600">
              Creates optimized prompts for image generation based on slide content
            </p>
            <div className="mt-2 p-3 bg-gray-50 rounded text-sm font-mono text-gray-700">
              &quot;Neural network diagram with Earth and climate data visualization, 
              flat design, blue and green colors, professional...&quot;
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="w-0.5 h-6 bg-gray-300" />
        </div>

        {/* Step 3 */}
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-pink-600">3</span>
          </div>
          <div className="flex-1">
            <h4 className="font-medium">Visual Generation (Nano Banana)</h4>
            <p className="text-sm text-gray-600">
              Generates custom illustrations matching your content
            </p>
            <div className="mt-2 aspect-video bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
              <span className="ml-2 text-gray-500">Generated Illustration</span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="w-0.5 h-6 bg-gray-300" />
        </div>

        {/* Step 4 */}
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-green-600">4</span>
          </div>
          <div className="flex-1">
            <h4 className="font-medium">Combined Presentation</h4>
            <p className="text-sm text-gray-600">
              Text content + AI-generated visuals merged into final slides
            </p>
            <div className="mt-2 p-4 bg-white border rounded-lg">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <h5 className="font-medium mb-2">Neural Network Architecture</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Input: Climate data layers</li>
                    <li>• Hidden: 128 LSTM units</li>
                    <li>• Output: Temperature prediction</li>
                  </ul>
                </div>
                <div className="w-32 h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
