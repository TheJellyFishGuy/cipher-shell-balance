import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Paperclip, X, Users, Hash } from 'lucide-react';
import { MessageService } from '@/services/MessageService';
import { UserService } from '@/services/UserService';
import { ChatHistoryService, type ChatHistoryEntry } from '@/services/ChatHistoryService';
import { EncryptionService } from '@/services/EncryptionService';
import { CausalityService } from '@/services/CausalityService';
import { useToast } from '@/hooks/use-toast';

interface NeomorphicChatProps {
  targetUsername?: string;
  onExit: () => void;
}

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isFile?: boolean;
  fileName?: string;
}

export const NeomorphicChat: React.FC<NeomorphicChatProps> = ({ targetUsername, onExit }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentChats, setRecentChats] = useState<ChatHistoryEntry[]>([]);
  const [selectedChat, setSelectedChat] = useState<string>(targetUsername || '');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRecentChats();
    if (selectedChat) {
      loadChatHistory();
      ChatHistoryService.markChatAsRead(selectedChat);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadRecentChats = () => {
    const chats = ChatHistoryService.getRecentChats();
    setRecentChats(chats);
  };

  const loadChatHistory = async () => {
    if (!selectedChat) return;
    
    setIsLoading(true);
    try {
      const result = await MessageService.getChatHistory(selectedChat);
      if (result.success) {
        const formattedMessages: Message[] = result.messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.from_user_id === UserService.getCurrentUser()?.id ? 'me' : selectedChat,
          timestamp: msg.created_at,
          isFile: msg.content.includes('[FILE:'),
          fileName: msg.content.includes('[FILE:') ? msg.content.match(/\[FILE: (.+?)\]/)?.[1] : undefined
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
    setIsLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || !selectedChat || isLoading) return;

    // Handle special commands
    if (currentInput.startsWith('$downloadfile ')) {
      const filename = currentInput.replace('$downloadfile ', '').trim();
      await handleDownloadFile(filename);
      return;
    }

    setIsLoading(true);
    try {
      const result = await MessageService.sendMessage(selectedChat, currentInput, 'chat');
      if (result.success) {
        // Add message to local display
        const newMessage: Message = {
          id: Date.now().toString(),
          content: currentInput,
          sender: 'me',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Update chat history
        ChatHistoryService.updateChatHistory(selectedChat, currentInput, true);
        ChatHistoryService.storeMessage(selectedChat, currentInput, true);
        
        setCurrentInput('');
        toast({
          title: "Message Sent",
          description: `Message sent to @${selectedChat}`,
        });
      } else {
        toast({
          title: "Failed to Send",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
    setIsLoading(false);
  };

  const handleDownloadFile = async (filename: string) => {
    if (!selectedChat) return;
    
    setIsLoading(true);
    try {
      const result = await MessageService.findFileInMessages(filename, selectedChat);
      if (result.success && result.content) {
        try {
          let decryptedContent: string;
          let fileExtension: string;
          
          // Determine file type and decrypt accordingly
          if (EncryptionService.isValidBalanceFile(result.content)) {
            decryptedContent = EncryptionService.decrypt(result.content);
            fileExtension = filename.endsWith('.balance') ? filename : `${filename}.balance`;
          } else if (CausalityService.isValidCausalityFile(result.content)) {
            decryptedContent = CausalityService.decrypt(result.content);
            fileExtension = filename.endsWith('.causality') ? filename : `${filename}.causality`;
          } else {
            throw new Error('Unknown file format');
          }
          
          // Create download
          const blob = new Blob([decryptedContent], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileExtension;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toast({
            title: "File Downloaded",
            description: `${fileExtension} has been downloaded successfully.`,
          });
        } catch (decryptError) {
          toast({
            title: "Decryption Failed",
            description: "Failed to decrypt the file. It may be corrupted or use an incompatible format.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "File Not Found",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to download file:', error);
    }
    setIsLoading(false);
    setCurrentInput('');
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedChat) return;

    if (!file.name.endsWith('.balance') && !file.name.endsWith('.causality')) {
      toast({
        title: "Invalid File Type",
        description: "Only .balance and .causality files are supported.",
        variant: "destructive"
      });
      return;
    }

    try {
      const fileContent = await file.text();
      const fileMessage = `[FILE: ${file.name}]\n${fileContent}`;
      
      const result = await MessageService.sendMessage(selectedChat, fileMessage, 'chat');
      if (result.success) {
        const newMessage: Message = {
          id: Date.now().toString(),
          content: fileMessage,
          sender: 'me',
          timestamp: new Date().toISOString(),
          isFile: true,
          fileName: file.name
        };
        setMessages(prev => [...prev, newMessage]);
        
        ChatHistoryService.updateChatHistory(selectedChat, `📎 ${file.name}`, true);
        
        toast({
          title: "File Sent",
          description: `${file.name} sent successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "File Send Failed",
        description: "Failed to send the file.",
        variant: "destructive"
      });
    }
    
    event.target.value = '';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-full flex">
      {/* Sidebar - Recent Chats */}
      <div className="w-72 neomorphic-panel p-4 mr-4 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="neomorphic-button p-2">
            <Users className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Chats</h3>
            <p className="text-xs text-muted-foreground">Recent conversations</p>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {recentChats.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No recent chats</p>
            </div>
          ) : (
            recentChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.username)}
                className={`neomorphic-button p-3 cursor-pointer transition-all ${
                  selectedChat === chat.username ? 'neomorphic-inset' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{chat.username}</span>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {chat.lastMessage}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTime(chat.timestamp)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 neomorphic-panel p-6 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="neomorphic-button p-2">
              <MessageCircle className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {selectedChat ? `Chat with @${selectedChat}` : 'Select a Chat'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Secure messaging • Type $downloadfile [filename] to download files
              </p>
            </div>
          </div>
          <button
            onClick={onExit}
            className="neomorphic-button p-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Welcome to Balance Chat</h3>
              <p className="text-muted-foreground">Select a recent chat or start a new conversation from the terminal</p>
            </div>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="flex-1 neomorphic-inset p-4 mb-4 overflow-y-auto space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse text-muted-foreground">Loading messages...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.sender === 'me'
                          ? 'neomorphic-button text-foreground'
                          : 'neomorphic-inset text-foreground'
                      }`}
                    >
                      {message.isFile ? (
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-accent" />
                          <span className="font-medium text-accent">{message.fileName}</span>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".balance,.causality"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="neomorphic-button p-3 text-muted-foreground hover:text-foreground"
                title="Attach .balance or .causality file"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading || !selectedChat}
                className="neomorphic-input flex-1 text-foreground placeholder:text-muted-foreground"
                placeholder={selectedChat ? "Type your message..." : "Select a chat first"}
              />
              
              <button
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || isLoading || !selectedChat}
                className="neomorphic-button p-3 text-primary hover:text-primary-foreground disabled:text-muted-foreground disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};