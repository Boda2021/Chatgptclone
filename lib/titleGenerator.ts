export async function generateConversationTitle(
  firstMessage: string,
  apiToken: string
): Promise<string> {
  try {
    const response = await fetch('/api/generate-title', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstMessage,
        apiToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate title');
    }

    const data = await response.json();
    return data.title || firstMessage.slice(0, 50).trim() || 'New Chat';
  } catch (error) {
    console.error('Error generating title:', error);
    // Fallback to a simple title
    return firstMessage.slice(0, 50).trim() || 'New Chat';
  }
}
