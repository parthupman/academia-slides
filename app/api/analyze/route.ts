import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { PaperAnalysis } from '@/types';
import { UserSettings } from '@/types/settings';
import { analyzeWithOpenAI, analyzeWithAnthropic, analyzeWithGemini, analyzeWithMistral, analyzeWithLocal } from '@/lib/ai-providers';
import { estimateSlides } from '@/lib/ai';

export async function POST(request: NextRequest) {
  console.log('📥 Analyze API called');
  
  try {
    // Get settings from headers
    const provider = request.headers.get('x-provider') as UserSettings['provider'] || 'openai';
    const apiKey = request.headers.get('x-api-key') || '';
    const model = request.headers.get('x-model') || 'gpt-4o-mini';
    
    const settings: UserSettings = {
      provider,
      apiKey,
      model,
      maxTokens: 4000,
      temperature: 0.3,
      saveLocally: false
    };
    
    // Check if API key is configured
    if (provider !== 'local' && !apiKey) {
      console.error('❌ API key not provided');
      return NextResponse.json(
        { error: 'API key not configured. Please go to Settings to configure your AI provider.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    console.log(`📄 File received: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    // Validate file type
    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 20MB' },
        { status: 400 }
      );
    }
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('🔍 Parsing PDF...');
    
    // Parse PDF
    let text: string;
    let numPages: number;
    
    try {
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      text = textResult.text;
      numPages = textResult.total;
      await parser.destroy();
    } catch (pdfError) {
      console.error('❌ PDF parsing error:', pdfError);
      return NextResponse.json(
        { error: 'Failed to parse PDF. Make sure it is a text-based PDF (not scanned images).' },
        { status: 400 }
      );
    }
    
    console.log(`✅ PDF parsed: ${numPages} pages, ${text.length} characters`);
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. The file may be scanned or corrupted.' },
        { status: 400 }
      );
    }
    
    console.log(`🤖 Sending to ${provider} for analysis...`);
    
    // Analyze paper using selected provider
    let analysis: PaperAnalysis;
    try {
      switch (provider) {
        case 'openai':
          analysis = await analyzeWithOpenAI(text, settings);
          break;
        case 'anthropic':
          analysis = await analyzeWithAnthropic(text, settings);
          break;
        case 'google':
          analysis = await analyzeWithGemini(text, settings);
          break;
        case 'mistral':
          analysis = await analyzeWithMistral(text, settings);
          break;
        case 'local':
          analysis = await analyzeWithLocal(text, settings);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (aiError) {
      console.error('❌ AI analysis error:', aiError);
      const errorMsg = aiError instanceof Error ? aiError.message : 'AI analysis failed';
      return NextResponse.json(
        { error: `Analysis failed: ${errorMsg}` },
        { status: 500 }
      );
    }
    
    console.log('✅ Analysis complete:', analysis.title);
    
    // Estimate recommended slide count
    const slideEstimate = estimateSlides(text);
    
    return NextResponse.json({
      success: true,
      analysis,
      slideEstimate,
      wordCount: text.split(/\s+/).length,
      pageCount: numPages
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze paper. Please try again.' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 60;
