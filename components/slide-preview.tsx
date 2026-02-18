'use client';

import { useState } from 'react';
import { Slide, Theme } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Presentation,
  X,
  FileText,
  Quote,
  ImageIcon,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlidePreviewProps {
  slides: Slide[];
  theme: Theme;
  title: string;
  onDownload: () => void;
  onClose: () => void;
}

const THEME_STYLES: Record<Theme, { bg: string; text: string; accent: string; card: string }> = {
  minimal: {
    bg: 'bg-white',
    text: 'text-gray-900',
    accent: 'text-blue-600',
    card: 'bg-gray-50'
  },
  modern: {
    bg: 'bg-slate-50',
    text: 'text-slate-900',
    accent: 'text-indigo-600',
    card: 'bg-white'
  },
  academic: {
    bg: 'bg-stone-50',
    text: 'text-stone-900',
    accent: 'text-sky-700',
    card: 'bg-white'
  },
  dark: {
    bg: 'bg-slate-900',
    text: 'text-slate-100',
    accent: 'text-sky-400',
    card: 'bg-slate-800'
  },
  vibrant: {
    bg: 'bg-orange-50',
    text: 'text-orange-950',
    accent: 'text-orange-600',
    card: 'bg-white'
  }
};

export function SlidePreview({
  slides,
  theme,
  
  onDownload,
  onClose
}: SlidePreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const styles = THEME_STYLES[theme];

  const goToNext = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const currentSlideData = slides[currentSlide];

  const getLayoutIcon = (layout: string) => {
    switch (layout) {
      case 'title':
        return <Presentation className="w-4 h-4" />;
      case 'quote':
        return <Quote className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'references':
        return <FileText className="w-4 h-4" />;
      default:
        return <List className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Preview Presentation</h2>
            <Badge variant="secondary">
              {slides.length} slides
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={onDownload} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Download PPTX
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Slide Thumbnails Sidebar */}
          <div className="w-64 border-r bg-gray-50 overflow-y-auto p-4 space-y-2 hidden lg:block">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              All Slides
            </p>
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all text-sm",
                  currentSlide === index
                    ? "bg-blue-100 border-blue-300 border"
                    : "bg-white border border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 font-mono">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 truncate font-medium">
                    {slide.title}
                  </span>
                  <span className="text-gray-400">
                    {getLayoutIcon(slide.layout)}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Slide Preview */}
          <div className="flex-1 flex flex-col bg-gray-100">
            {/* Slide Display */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div
                className={cn(
                  "w-full max-w-4xl aspect-video rounded-lg shadow-2xl p-8 overflow-hidden",
                  styles.bg
                )}
              >
                {/* Slide Content */}
                <div className="h-full flex flex-col">
                  {/* Title */}
                  {currentSlideData.layout === 'title' ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <div className={cn("w-20 h-1 mb-6 rounded", styles.accent.replace('text-', 'bg-'))} />
                      <h1 className={cn("text-4xl font-bold mb-4", styles.text)}>
                        {currentSlideData.title}
                      </h1>
                      {currentSlideData.content[0] && (
                        <p className={cn("text-xl", styles.accent)}>
                          {currentSlideData.content[0]}
                        </p>
                      )}
                      {currentSlideData.content[1] && (
                        <p className={cn("text-lg mt-4 opacity-75", styles.text)}>
                          {currentSlideData.content[1]}
                        </p>
                      )}
                    </div>
                  ) : currentSlideData.layout === 'quote' ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <span className={cn("text-6xl font-serif mb-4", styles.accent)}>&ldquo;</span>
                      <p className={cn("text-2xl italic text-center max-w-3xl", styles.text)}>
                        {currentSlideData.content[0] || currentSlideData.title}
                      </p>
                      {currentSlideData.content[1] && (
                        <p className={cn("mt-4 text-lg", styles.accent)}>
                          — {currentSlideData.content[1]}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <h2 className={cn("text-2xl font-bold", styles.text)}>
                          {currentSlideData.title}
                        </h2>
                        <div className={cn("w-16 h-1 mt-2 rounded", styles.accent.replace('text-', 'bg-'))} />
                      </div>
                      <div className="flex-1">
                        <ul className="space-y-3">
                          {currentSlideData.content.map((point, index) => (
                            <li
                              key={index}
                              className={cn(
                                "flex items-start",
                                styles.text
                              )}
                            >
                              <span className={cn("mr-3 mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0", styles.accent.replace('text-', 'bg-'))} />
                              <span className="text-lg leading-relaxed">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Bar */}
            <div className="bg-white border-t p-4">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <Button
                  variant="outline"
                  onClick={goToPrev}
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Slide {currentSlide + 1} of {slides.length}
                  </span>
                  <div className="flex space-x-1">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          currentSlide === index
                            ? "bg-blue-600 w-4"
                            : "bg-gray-300 hover:bg-gray-400"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={goToNext}
                  disabled={currentSlide === slides.length - 1}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
