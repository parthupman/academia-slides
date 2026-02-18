import { NextResponse } from 'next/server';

export async function GET() {
  // Check environment
  const checks = {
    openaiKey: process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json({
    status: 'ok',
    message: 'API is working',
    checks
  });
}

export const runtime = 'nodejs';
