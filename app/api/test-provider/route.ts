import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { endpoint, apiKey, model } = await request.json();

    if (!endpoint || !apiKey || !model) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: endpoint, apiKey, model' },
        { status: 400 }
      );
    }

    // Try to list models first (lightweight check)
    try {
      const modelsResponse = await fetch(`${endpoint}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        const availableModels = modelsData.data || modelsData.models || [];
        const modelExists = availableModels.some((m: { id?: string; model?: string }) => 
          m.id === model || m.model === model
        );

        return NextResponse.json({
          success: true,
          message: modelExists 
            ? `Connection successful! Model "${model}" is available.`
            : `Connection successful! ${availableModels.length} models available. Note: "${model}" was not found in the list.`,
          modelsAvailable: availableModels.length,
          modelFound: modelExists
        });
      }
    } catch {
      // List models failed, try a minimal completion as fallback
    }

    // Fallback: Try a minimal chat completion
    try {
      const completionResponse = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
      });

      if (completionResponse.ok) {
        return NextResponse.json({
          success: true,
          message: 'Connection successful! API is responding to chat completions.',
        });
      } else {
        const errorData = await completionResponse.json().catch(() => ({}));
        return NextResponse.json({
          success: false,
          message: `API error: ${errorData.error?.message || completionResponse.statusText || 'Unknown error'}`,
        }, { status: 502 });
      }
    } catch (err) {
      return NextResponse.json({
        success: false,
        message: `Connection failed: ${err instanceof Error ? err.message : 'Network error'}`,
      }, { status: 502 });
    }
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
