import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { firstMessage, apiToken } = await request.json();

    if (!apiToken) {
      return NextResponse.json(
        { error: 'API token is required' },
        { status: 401 }
      );
    }

    if (!firstMessage) {
      return NextResponse.json(
        { error: 'First message is required' },
        { status: 400 }
      );
    }

    const API_BASE_URL = process.env.AI_BUILDER_API_URL || process.env.NEXT_PUBLIC_AI_BUILDER_API_URL || 'https://space.ai-builders.com/backend';
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const url = `${baseUrl}/v1/chat/completions`;

    const titlePrompt = `Not Chat. Generate a concise, descriptive title (maximum 5 words) for a conversation that starts with: "${firstMessage.slice(0, 200)}". Return only the title, nothing else.`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        model: 'grok-4-fast',
        messages: [
          {
            role: 'system',
            content: 'Not Chat',
          },
          {
            role: 'user',
            content: titlePrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate title');
    }

    const data = await response.json();
    const title = data.choices?.[0]?.message?.content?.trim() || firstMessage.slice(0, 50);
    
    // Clean up the title - remove quotes, limit length
    const cleanedTitle = title.replace(/^["']|["']$/g, '').slice(0, 60);
    
    return NextResponse.json({ title: cleanedTitle });
  } catch (error) {
    console.error('Title generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate title' },
      { status: 500 }
    );
  }
}
