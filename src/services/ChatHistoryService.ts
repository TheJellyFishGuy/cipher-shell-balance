export interface ChatHistoryEntry {
  id: string;
  username: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface StoredMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isOwnMessage: boolean;
}

export class ChatHistoryService {
  private static readonly STORAGE_KEY = 'balance_chat_history';
  private static readonly MESSAGES_KEY = 'balance_stored_messages';

  static getRecentChats(): ChatHistoryEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static updateChatHistory(username: string, message: string, isOwnMessage: boolean): void {
    const chats = this.getRecentChats();
    const existingIndex = chats.findIndex(chat => chat.username.toLowerCase() === username.toLowerCase());
    
    const chatEntry: ChatHistoryEntry = {
      id: existingIndex >= 0 ? chats[existingIndex].id : Date.now().toString(),
      username: username.toLowerCase(),
      lastMessage: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      timestamp: new Date().toISOString(),
      unreadCount: existingIndex >= 0 ? (isOwnMessage ? 0 : chats[existingIndex].unreadCount + 1) : (isOwnMessage ? 0 : 1)
    };

    if (existingIndex >= 0) {
      chats[existingIndex] = chatEntry;
    } else {
      chats.unshift(chatEntry);
    }

    // Keep only last 20 chats
    const recentChats = chats.slice(0, 20);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentChats));
  }

  static markChatAsRead(username: string): void {
    const chats = this.getRecentChats();
    const updatedChats = chats.map(chat => 
      chat.username.toLowerCase() === username.toLowerCase()
        ? { ...chat, unreadCount: 0 }
        : chat
    );
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedChats));
  }

  static clearChatHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.MESSAGES_KEY);
  }

  // Store messages locally for offline access
  static storeMessage(username: string, message: string, isOwnMessage: boolean): void {
    try {
      const stored = localStorage.getItem(this.MESSAGES_KEY);
      const messages: StoredMessage[] = stored ? JSON.parse(stored) : [];
      
      const newMessage: StoredMessage = {
        id: Date.now().toString(),
        username: username.toLowerCase(),
        message,
        timestamp: new Date().toISOString(),
        isOwnMessage
      };

      messages.push(newMessage);

      // Keep only last 1000 messages
      const recentMessages = messages.slice(-1000);
      localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(recentMessages));
    } catch (error) {
      console.error('Failed to store message locally:', error);
    }
  }

  static getStoredMessages(username: string): StoredMessage[] {
    try {
      const stored = localStorage.getItem(this.MESSAGES_KEY);
      if (!stored) return [];
      
      const messages: StoredMessage[] = JSON.parse(stored);
      return messages.filter(msg => msg.username.toLowerCase() === username.toLowerCase());
    } catch {
      return [];
    }
  }
}
