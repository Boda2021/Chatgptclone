import { Message } from '@/types';

// Get API base URL - use server-side env var if available, otherwise client-side
const getApiBaseUrl = () => {
  // Server-side (in API routes)
  if (typeof window === 'undefined') {
    return process.env.AI_BUILDER_API_URL || process.env.NEXT_PUBLIC_AI_BUILDER_API_URL || 'https://space.ai-builders.com/backend';
  }
  // Client-side
  return process.env.NEXT_PUBLIC_AI_BUILDER_API_URL || 'https://space.ai-builders.com/backend';
};

const API_BASE_URL = getApiBaseUrl();

export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function sendMessage(
  messages: Message[],
  apiToken: string,
  model: string = 'grok-4-fast'
): Promise<string> {
  // Ensure we have a trailing slash removed and proper path
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const url = `${baseUrl}/v1/chat/completions`;
  
  console.log(`[API] Calling: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(`${errorMessage} (URL: ${url})`);
    }

    const data: ChatCompletionResponse = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }
    
    throw new Error('No response from API');
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const errorMsg = `Network error: Unable to reach API at ${url}. ` +
        `Please verify the API URL is correct. Current URL: ${url}. ` +
        `Check your .env.local file and ensure NEXT_PUBLIC_AI_BUILDER_API_URL is set correctly.`;
      console.error('[API Error]', errorMsg);
      throw new Error(errorMsg);
    }
    console.error('[API Error]', error);
    throw error;
  }
}
