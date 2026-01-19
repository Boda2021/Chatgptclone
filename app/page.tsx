'use client';

import { useState, useEffect } from 'react';
import { Conversation, Message } from '@/types';
import {
  getConversations,
  saveConversations,
  createConversation,
  updateConversation,
  deleteConversation as deleteConv,
} from '@/lib/storage';
import ConversationSidebar from '@/components/ConversationSidebar';
import ChatInterface from '@/components/ChatInterface';

const AVAILABLE_MODELS = [
  { value: 'grok-4-fast', label: 'Grok-4-Fast', description: 'Fast Grok model' },
  { value: 'supermind-agent-v1', label: 'Supermind Agent', description: 'Multi-tool agent with web search' },
  { value: 'deepseek', label: 'DeepSeek', description: 'Fast and cost-effective' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: 'Google Gemini model' },
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', description: 'Fast Gemini reasoning' },
  { value: 'gpt-5', label: 'GPT-5', description: 'OpenAI-compatible' },
];

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiToken, setApiToken] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('grok-4-fast');

  // Load conversations and API token from localStorage on mount
  useEffect(() => {
    const loadedConversations = getConversations();
    setConversations(loadedConversations);
    
    // Load API token from localStorage or environment variable
    const envToken = process.env.NEXT_PUBLIC_AI_BUILDER_TOKEN || '';
    const storedToken = localStorage.getItem('ai_builder_token') || '';
    const token = storedToken || envToken;
    
    if (token) {
      setApiToken(token);
      // Save to localStorage if it came from env
      if (!storedToken && envToken) {
        localStorage.setItem('ai_builder_token', envToken);
      }
    }
    
    // Load selected model from localStorage
    const storedModel = localStorage.getItem('selected_model') || 'grok-4-fast';
    setSelectedModel(storedModel);
    
    // Select the first conversation if available
    if (loadedConversations.length > 0 && !currentConversationId) {
      setCurrentConversationId(loadedConversations[0].id);
    }
  }, []);

  // Save conversations whenever they change
  useEffect(() => {
    if (conversations.length > 0 || currentConversationId === null) {
      saveConversations(conversations);
    }
  }, [conversations]);

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );

  const handleNewConversation = () => {
    const newConv = createConversation();
    setConversations([newConv, ...conversations]);
    setCurrentConversationId(newConv.id);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const handleDeleteConversation = (id: string) => {
    const updated = deleteConv(conversations, id);
    setConversations(updated);
    
    if (currentConversationId === id) {
      if (updated.length > 0) {
        setCurrentConversationId(updated[0].id);
      } else {
        setCurrentConversationId(null);
      }
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!apiToken) {
      alert('Please set your AI Builder API token in the settings');
      return;
    }

    if (!currentConversationId || !currentConversation) return;

    // Find the message index
    const messageIndex = currentConversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Prepare updated messages (remove all after the edited message)
    const updatedMessages = [
      ...currentConversation.messages.slice(0, messageIndex),
      {
        ...currentConversation.messages[messageIndex],
        content: newContent,
      },
    ];

    // Update the conversation immediately
    setConversations((prev) =>
      updateConversation(prev, currentConversationId!, (conv) => ({
        ...conv,
        messages: updatedMessages,
        updatedAt: Date.now(),
      }))
    );

    // Regenerate response from the edited point
    setIsLoading(true);

    try {
      // Always inject fresh system message with current date/time
      const getCurrentDateTime = () => {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        };
        return now.toLocaleString('en-US', options);
      };
      
      // Filter out any old system messages and inject fresh one
      const messagesWithoutSystem = updatedMessages.filter(m => m.role !== 'system');
      const currentSystemMessage: Message = {
        id: 'system-not-chat',
        role: 'system',
        content: `Not Chat. Current date and time: ${getCurrentDateTime()}`,
        timestamp: Date.now(),
      };
      const messagesToSend = [currentSystemMessage, ...messagesWithoutSystem];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesToSend,
          apiToken,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
      };

      // Add the regenerated assistant message
      setConversations((prev) =>
        updateConversation(prev, currentConversationId!, (conv) => ({
          ...conv,
          messages: [...conv.messages, assistantMessage],
          updatedAt: Date.now(),
        }))
      );
    } catch (error) {
      console.error('Error regenerating message:', error);
      alert(error instanceof Error ? error.message : 'Failed to regenerate response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!apiToken) {
      alert('Please set your AI Builder API token in the settings');
      return;
    }

    let convId = currentConversationId;
    const isNewConversation = !convId || (currentConversation?.messages.length === 0);
    
    // Create new conversation if none exists
    if (!convId) {
      const newConv = createConversation();
      setConversations([newConv, ...conversations]);
      convId = newConv.id;
      setCurrentConversationId(convId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Get existing messages, ensuring system message with current date/time is first
    const getCurrentDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      };
      return now.toLocaleString('en-US', options);
    };
    
    const existingMessages = currentConversation?.messages || [];
    // Always inject fresh system message with current date/time when sending
    const currentSystemMessage: Message = {
      id: 'system-not-chat',
      role: 'system',
      content: `Not Chat. Current date and time: ${getCurrentDateTime()}`,
      timestamp: Date.now(),
    };
    
    // Filter out old system messages and add fresh one
    const messagesWithoutSystem = existingMessages.filter(m => m.role !== 'system');
    const messagesToSend = [currentSystemMessage, ...messagesWithoutSystem, userMessage];

    // Add user message immediately (store without system message, we'll inject it when sending)
    setConversations((prev) =>
      updateConversation(prev, convId!, (conv) => {
        // Don't store system message in conversation, we inject it dynamically
        const messagesWithoutSystem = conv.messages.filter(m => m.role !== 'system');
        const updatedMessages = [...messagesWithoutSystem, userMessage];
        
        return {
          ...conv,
          messages: updatedMessages,
          updatedAt: Date.now(),
          // Keep existing title if not a new conversation
          title: conv.messages.length === 0 ? content.slice(0, 50) : conv.title,
        };
      })
    );

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesToSend,
          apiToken,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
      };

      // Add assistant message
      setConversations((prev) =>
        updateConversation(prev, convId!, (conv) => ({
          ...conv,
          messages: [...conv.messages, assistantMessage],
          updatedAt: Date.now(),
        }))
      );

      // Generate title for new conversations after first response (async, don't block)
      if (isNewConversation) {
        import('@/lib/titleGenerator').then(({ generateConversationTitle }) => {
          generateConversationTitle(content, apiToken).then((generatedTitle) => {
            setConversations((prev) =>
              updateConversation(prev, convId!, (conv) => ({
                ...conv,
                title: generatedTitle,
              }))
            );
          }).catch((error) => {
            console.error('Failed to generate title:', error);
          });
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <ConversationSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-4">
          <h1 className="text-xl font-semibold text-white">ChatGPT Clone</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Model:</span>
              <select
                value={selectedModel}
                onChange={(e) => {
                  const model = e.target.value;
                  setSelectedModel(model);
                  localStorage.setItem('selected_model', model);
                }}
                className="px-3 py-1 bg-gray-800 text-white text-sm rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {AVAILABLE_MODELS.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">API Token:</span>
              <input
                type="password"
                value={apiToken}
                onChange={(e) => {
                  const token = e.target.value;
                  setApiToken(token);
                  localStorage.setItem('ai_builder_token', token);
                }}
                placeholder="Enter token"
                className="px-3 py-1 bg-gray-800 text-white text-sm rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          {currentConversation ? (
            <ChatInterface
              messages={currentConversation.messages}
              onSendMessage={handleSendMessage}
              onEditMessage={handleEditMessage}
              isLoading={isLoading}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No conversation selected</p>
                <button
                  onClick={handleNewConversation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
