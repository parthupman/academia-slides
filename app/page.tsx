'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileUpload } from '@/components/file-upload';
import { AnalysisResult } from '@/components/analysis-result';
import { OptionsPanel } from '@/components/options-panel';
import { SlidePreview } from '@/components/slide-preview';
import { Button } from '@/components/ui/button';

import {
  Upload,
  Sparkles,
  Presentation,
  FileCheck,
  Download,
  RefreshCcw,
  GraduationCap,
  Settings,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { PaperAnalysis, GenerateOptions, Slide, Theme } from '@/types';
import { UserSettings, AI_PROVIDERS } from '@/types/settings';
import { getSettings } from '@/lib/settings';


export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<{
    status: 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';
    progress: number;
    error?: string;
  }>({ status: 'idle', progress: 0 });
  
  const [analysis, setAnalysis] = useState<PaperAnalysis | null>(null);
  const [slideEstimate, setSlideEstimate] = useState({
    min: 5,
    max: 30,
    recommended: 15
  });
  const [wordCount, setWordCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  
  const [generatedSlides, setGeneratedSlides] = useState<Slide[] | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme>('modern');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);

  // Load user settings on mount
  useEffect(() => {
    const settings = getSettings();
    setUserSettings(settings);
    // Check if API key is configured
    const hasKey = !!settings.apiKey || settings.provider === 'local';
    setApiConfigured(hasKey);
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setUploadState({ status: 'uploading', progress: 0 });
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadState(prev => ({
        ...prev,
        progress: Math.min(prev.progress + 10, 90)
      }));
    }, 200);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Get current settings
      const settings = getSettings();
      
      setUploadState(prev => ({ ...prev, status: 'analyzing', progress: 90 }));
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
        headers: {
          'x-provider': settings.provider,
          'x-api-key': settings.apiKey,
          'x-model': settings.model,
        }
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }
      
      const data = await response.json();
      
      setAnalysis(data.analysis);
      setSlideEstimate(data.slideEstimate);
      setWordCount(data.wordCount);
      setPageCount(data.pageCount);
      setUploadState({ status: 'complete', progress: 100 });
    } catch (error) {
      clearInterval(progressInterval);
      setUploadState({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleClear = () => {
    setFile(null);
    setAnalysis(null);
    setGeneratedSlides(null);
    setUploadState({ status: 'idle', progress: 0 });
  };

  const handleGenerate = async (options: GenerateOptions) => {
    if (!analysis) return;
    
    setIsGenerating(true);
    setSelectedTheme(options.theme);
    
    // Get current settings
    const settings = getSettings();
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-provider': settings.provider,
          'x-api-key': settings.apiKey,
          'x-model': settings.model,
        },
        body: JSON.stringify({ analysis, options })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }
      
      // Download the generated file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${analysis.title.replace(/[^a-z0-9]/gi, '_')}.pptx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // For preview, we would ideally parse the generated slides
      // For now, we'll create a simple representation
      setGeneratedSlides([
        {
          id: 1,
          title: analysis.title,
          content: [analysis.authors?.[0] || 'Authors', 'Academic Presentation'],
          layout: 'title'
        },
        ...analysis.sections.map((section, index) => ({
          id: index + 2,
          title: section.heading,
          content: [section.content.slice(0, 200) + '...'],
          layout: 'content' as const
        }))
      ]);
      
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate presentation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    // Already downloaded during generation
    alert('Presentation downloaded!');
  };

  // Step indicator
  const getCurrentStep = () => {
    if (uploadState.status === 'idle') return 1;
    if (uploadState.status === 'uploading' || uploadState.status === 'analyzing') return 2;
    if (uploadState.status === 'complete' && !generatedSlides) return 3;
    if (generatedSlides) return 4;
    return 1;
  };

  const currentStep = getCurrentStep();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex justify-end mb-4">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold">AcademiaSlides</h1>
            </div>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Transform your research papers into stunning academic presentations with AI
            </p>
          </div>
        </div>
      </div>

      {/* API Configuration Banner */}
      {apiConfigured === false && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">API Key Not Configured</p>
                  <p className="text-sm text-amber-700">
                    Please configure your AI provider in settings to start analyzing papers.
                  </p>
                </div>
              </div>
              <Link href="/settings">
                <Button className="bg-amber-600 hover:bg-amber-700">
                  Configure Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {apiConfigured === true && userSettings && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800">
                  Using <strong>{AI_PROVIDERS.find(p => p.id === userSettings.provider)?.name}</strong> with model <strong>{userSettings.model}</strong>
                </p>
              </div>
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-800 hover:bg-green-100">
                  Change
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-2 sm:space-x-8">
            <StepIndicator
              label="Upload"
              icon={<Upload className="w-4 h-4" />}
              isActive={currentStep === 1}
              isComplete={currentStep > 1}
            />
            <div className="w-8 sm:w-16 h-0.5 bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: currentStep > 1 ? '100%' : '0%' }}
              />
            </div>
            <StepIndicator
              label="Analyze"
              icon={<Sparkles className="w-4 h-4" />}
              isActive={currentStep === 2}
              isComplete={currentStep > 2}
            />
            <div className="w-8 sm:w-16 h-0.5 bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: currentStep > 2 ? '100%' : '0%' }}
              />
            </div>
            <StepIndicator
              label="Customize"
              icon={<FileCheck className="w-4 h-4" />}
              isActive={currentStep === 3}
              isComplete={currentStep > 3}
            />
            <div className="w-8 sm:w-16 h-0.5 bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: currentStep > 3 ? '100%' : '0%' }}
              />
            </div>
            <StepIndicator
              label="Download"
              icon={<Presentation className="w-4 h-4" />}
              isActive={currentStep === 4}
              isComplete={false}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Analysis */}
          <div className="space-y-6">
            {/* Upload Section */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-blue-600" />
                1. Upload Research Paper
              </h2>
              <FileUpload
                onFileSelect={handleFileSelect}
                onClear={handleClear}
                isUploading={uploadState.status === 'uploading'}
                uploadProgress={uploadState.progress}
                fileName={file?.name}
              />
              {uploadState.error && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 px-4 py-2 rounded">
                  {uploadState.error}
                </p>
              )}
            </section>

            {/* Analysis Results */}
            {analysis && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                  2. AI Analysis Results
                </h2>
                <AnalysisResult
                  analysis={analysis}
                  wordCount={wordCount}
                  pageCount={pageCount}
                />
              </section>
            )}
          </div>

          {/* Right Column - Options */}
          <div>
            {analysis ? (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileCheck className="w-5 h-5 mr-2 text-blue-600" />
                  3. Customize Presentation
                </h2>
                <OptionsPanel
                  minSlides={slideEstimate.min}
                  maxSlides={slideEstimate.max}
                  recommendedSlides={slideEstimate.recommended}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                />
              </section>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileCheck className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to Customize
                  </h3>
                  <p className="text-gray-500 max-w-xs">
                    Upload a research paper to see AI analysis and customize your presentation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {generatedSlides && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Presentation Ready!
            </h3>
            <p className="text-gray-600 mb-4">
              Your academic presentation has been generated and downloaded.
            </p>
            <div className="flex justify-center space-x-3">
              <Button
                onClick={handleClear}
                variant="outline"
                className="flex items-center"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Start New
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
            <p>Powered by OpenAI GPT-4o</p>
            <p>AcademiaSlides - Academic Presentation Generator</p>
          </div>
        </div>
      </footer>

      {/* Preview Modal */}
      {showPreview && generatedSlides && analysis && (
        <SlidePreview
          slides={generatedSlides}
          theme={selectedTheme}
          title={analysis.title}
          onDownload={handleDownload}
          onClose={() => setShowPreview(false)}
        />
      )}
    </main>
  );
}

function StepIndicator({
  label,
  icon,
  isActive,
  isComplete
}: {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isComplete: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
          isComplete
            ? 'bg-blue-600 text-white'
            : isActive
            ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
            : 'bg-gray-100 text-gray-400'
        }`}
      >
        {isComplete ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          icon
        )}
      </div>
      <span
        className={`text-xs font-medium ${
          isActive || isComplete ? 'text-blue-600' : 'text-gray-400'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
