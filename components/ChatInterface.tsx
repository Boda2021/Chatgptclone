'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  onEditMessage: (messageId: string, newContent: string) => Promise<void>;
  isLoading: boolean;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  onEditMessage,
  isLoading,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageContent = input.trim();
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await onSendMessage(messageContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleStartEdit = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editContent.trim()) return;
    await onEditMessage(editingMessageId, editContent.trim());
    setEditingMessageId(null);
    setEditContent('');
  };

  const adjustEditTextareaHeight = () => {
    if (editTextareaRef.current) {
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (editingMessageId) {
      adjustEditTextareaHeight();
    }
  }, [editContent, editingMessageId]);

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm mt-2">Send a message to begin chatting with Grok-4-fast</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isEditing = editingMessageId === message.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                    {isEditing && message.role === 'user' ? (
                      <div className="w-full bg-gray-800 rounded-lg p-4 border-2 border-blue-500">
                        <textarea
                          ref={editTextareaRef}
                          value={editContent}
                          onChange={(e) => {
                            setEditContent(e.target.value);
                            adjustEditTextareaHeight();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.shiftKey) {
                              // Allow Shift+Enter for new lines
                              return;
                            }
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSaveEdit();
                            }
                            if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2 justify-end">
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            disabled={!editContent.trim() || isLoading}
                            className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Save & Regenerate
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`group relative rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-100'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="prose prose-invert prose-sm max-w-none break-words">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code: ({ node, inline, className, children, ...props }: any) => {
                                  return inline ? (
                                    <code className="bg-gray-700 px-1 py-0.5 rounded text-sm" {...props}>
                                      {children}
                                    </code>
                                  ) : (
                                    <code className="block bg-gray-700 p-3 rounded-lg overflow-x-auto text-sm" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                                pre: ({ children }: any) => {
                                  return <pre className="bg-gray-700 p-3 rounded-lg overflow-x-auto my-2">{children}</pre>;
                                },
                                p: ({ children }: any) => {
                                  return <p className="my-2">{children}</p>;
                                },
                                ul: ({ children }: any) => {
                                  return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>;
                                },
                                ol: ({ children }: any) => {
                                  return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>;
                                },
                                li: ({ children }: any) => {
                                  return <li className="my-1">{children}</li>;
                                },
                                h1: ({ children }: any) => {
                                  return <h1 className="text-2xl font-bold my-3">{children}</h1>;
                                },
                                h2: ({ children }: any) => {
                                  return <h2 className="text-xl font-bold my-2">{children}</h2>;
                                },
                                h3: ({ children }: any) => {
                                  return <h3 className="text-lg font-bold my-2">{children}</h3>;
                                },
                                blockquote: ({ children }: any) => {
                                  return <blockquote className="border-l-4 border-gray-600 pl-4 my-2 italic">{children}</blockquote>;
                                },
                                a: ({ href, children }: any) => {
                                  return <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">{children}</a>;
                                },
                                table: ({ children }: any) => {
                                  return <table className="border-collapse border border-gray-600 my-2 w-full">{children}</table>;
                                },
                                th: ({ children }: any) => {
                                  return <th className="border border-gray-600 px-2 py-1 bg-gray-700">{children}</th>;
                                },
                                td: ({ children }: any) => {
                                  return <td className="border border-gray-600 px-2 py-1">{children}</td>;
                                },
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap break-words">{message.content}</div>
                        )}
                        {message.role === 'user' && !isLoading && (
                          <button
                            onClick={() => handleStartEdit(message)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-700 rounded"
                            aria-label="Edit message"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-48 overflow-y-auto min-h-[52px]"
              rows={2}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
