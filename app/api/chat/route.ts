import { NextRequest, NextResponse } from 'next/server';
import { sendMessage } from '@/lib/api';
import { Message } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { messages, apiToken, model } = await request.json();

    if (!apiToken) {
      return NextResponse.json(
        { error: 'API token is required' },
        { status: 401 }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const response = await sendMessage(messages as Message[], apiToken, model || 'grok-4-fast');
    
    return NextResponse.json({ content: response });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get response';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
