import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Paperclip, Download, X, User } from 'lucide-react';
import { MessageService, Message } from '@/services/MessageService';
import { UserService } from '@/services/UserService';
import { EncryptionService } from '@/services/EncryptionService';

interface ModernChatProps {
  targetUsername: string;
  onExit: () => void;
}

export const ModernChat: React.FC<ModernChatProps> = ({ targetUsername, onExit }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = UserService.getCurrentUser();

  useEffect(() => {
    loadChatHistory();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [targetUsername]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    setIsLoading(true);
    const result = await MessageService.getChatHistory(targetUsername);
    if (result.success) {
      setMessages(result.messages);
    }
    setIsLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.balance')) {
        alert('Only .balance files can be sent');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        const fileMessage = `[FILE: ${file.name}]\n${content}`;
        
        const result = await MessageService.sendMessage(targetUsername, fileMessage, 'chat');
        if (result.success) {
          await loadChatHistory();
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const messageContent = currentInput.trim();
    setCurrentInput('');

    // Handle file download command
    if (messageContent.toLowerCase().startsWith('$downloadfile ')) {
      const filename = messageContent.substring('$downloadfile '.length).trim();
      if (!filename) {
        setMessages(prev => [...prev, createSystemMessage('Usage: $downloadfile filename (without .balance extension)')]);
        return;
      }

      const result = await MessageService.findFileInMessages(filename, targetUsername);
      if (result.success && result.content) {
        try {
          const decryptedContent = EncryptionService.decrypt(result.content);
          const blob = new Blob([decryptedContent], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}.txt`;
          link.click();
          URL.revokeObjectURL(url);

          setMessages(prev => [...prev, createSystemMessage(`Successfully downloaded ${filename}.balance as ${filename}.txt`)]);
        } catch (error) {
          setMessages(prev => [...prev, createSystemMessage(`Error: Failed to decrypt ${filename}.balance - file may be corrupted`)]);
        }
      } else {
        setMessages(prev => [...prev, createSystemMessage(result.message)]);
      }
      return;
    }

    const result = await MessageService.sendMessage(targetUsername, messageContent, 'chat');
    if (result.success) {
      await loadChatHistory();
    }
  };

  const createSystemMessage = (content: string): Message => ({
    id: 'temp-' + Date.now(),
    from_user_id: 'system',
    to_user_id: currentUser?.id || '',
    content,
    message_type: 'chat',
    read_at: null,
    created_at: new Date().toISOString()
  } as Message);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessage = (content: string) => {
    if (content.startsWith('[FILE:')) {
      const lines = content.split('\n');
      const fileHeader = lines[0];
      const fileContent = lines.slice(1).join('\n');
      
      return (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium text-sm mb-1">
            <Paperclip className="w-4 h-4" />
            {fileHeader}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            📄 .balance file - {fileContent.length} bytes
          </div>
        </div>
      );
    }
    
    return <span>{content}</span>;
  };

  return (
    <div className="card-modern h-full flex flex-col animate-fade-in">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Chat with @{targetUsername}</h3>
            <p className="text-xs text-muted-foreground">End-to-end secure messaging</p>
          </div>
        </div>
        <button
          onClick={onExit}
          className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-red-600 dark:text-red-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            Loading chat history...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2" />
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.from_user_id === currentUser?.id;
            const isSystemMessage = message.from_user_id === 'system';
            
            return (
              <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${
                  isSystemMessage 
                    ? 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800' 
                    : isOwnMessage 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                } rounded-lg p-3`}>
                  {!isSystemMessage && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium opacity-70">
                        {isOwnMessage ? 'You' : `@${targetUsername}`}
                      </span>
                      <span className="text-xs opacity-50">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  )}
                  <div className={`text-sm ${isSystemMessage ? 'text-yellow-700 dark:text-yellow-300' : ''}`}>
                    {formatMessage(message.content)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 rounded-lg bg-secondary hover:bg-accent flex items-center justify-center transition-colors"
          title="Send .balance file"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          className="input-modern flex-1"
          placeholder="Type a message, '$downloadfile filename' to download..."
          autoComplete="off"
          spellCheck="false"
        />
        
        <button
          type="submit"
          disabled={!currentInput.trim()}
          className="w-10 h-10 btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".balance"
          onChange={handleFileSelect}
          className="hidden"
        />
      </form>
    </div>
  );
};