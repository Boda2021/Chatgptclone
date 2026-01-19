import { Conversation } from '@/types';

const STORAGE_KEY = 'chatgpt-clone-conversations';

export const getConversations = (): Conversation[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
};

export const saveConversations = (conversations: Conversation[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Error saving conversations:', error);
  }
};

export const createConversation = (title: string = 'New Chat'): Conversation => {
  return {
    id: Date.now().toString(),
    title,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const updateConversation = (
  conversations: Conversation[],
  conversationId: string,
  updater: (conv: Conversation) => Conversation
): Conversation[] => {
  return conversations.map(conv =>
    conv.id === conversationId ? updater(conv) : conv
  );
};

export const deleteConversation = (
  conversations: Conversation[],
  conversationId: string
): Conversation[] => {
  return conversations.filter(conv => conv.id !== conversationId);
};
