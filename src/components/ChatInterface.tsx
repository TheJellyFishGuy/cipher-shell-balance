
import React, { useState, useEffect, useRef } from 'react';
import { MessageService, Message } from '@/services/MessageService';
import { UserService } from '@/services/UserService';

interface ChatInterfaceProps {
  targetUsername: string;
  onExit: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ targetUsername, onExit }) => {
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
      
      // Read file content and send as message
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
    // Reset input
    e.target.value = '';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const messageContent = currentInput.trim();
    setCurrentInput('');

    // Check for $sendfile command
    if (messageContent.toLowerCase() === '$sendfile') {
      fileInputRef.current?.click();
      return;
    }

    const result = await MessageService.sendMessage(targetUsername, messageContent, 'chat');
    if (result.success) {
      // Reload chat history to show the new message
      await loadChatHistory();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onExit();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessage = (content: string) => {
    // Check if it's a file message
    if (content.startsWith('[FILE:')) {
      const lines = content.split('\n');
      const fileHeader = lines[0];
      const fileContent = lines.slice(1).join('\n');
      
      return (
        <div>
          <span className="text-yellow-400">{fileHeader}</span>
          <div className="text-xs text-gray-400 mt-1">
            [.balance file - {fileContent.length} bytes]
          </div>
        </div>
      );
    }
    
    return content;
  };

  return (
    <div className="h-full flex flex-col" onKeyDown={handleKeyPress}>
      <div className="border-b border-white p-2 flex justify-between items-center">
        <h3 className="text-white font-bold">CHAT WITH @{targetUsername.toUpperCase()}</h3>
        <button
          onClick={onExit}
          className="text-white hover:text-red-400 px-2"
        >
          [ESC TO EXIT]
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="text-white">Loading chat history...</div>
        ) : messages.length === 0 ? (
          <div className="text-white opacity-60">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="text-white text-sm">
              <span className="text-blue-400">
                [{formatTime(message.created_at)}]
              </span>
              <span className={message.from_user_id === currentUser?.id ? "text-green-400 ml-2" : "text-purple-400 ml-2"}>
                {message.from_user_id === currentUser?.id ? 'You' : `@${targetUsername}`}:
              </span>
              <span className="ml-2">{formatMessage(message.content)}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-white p-2 flex items-center">
        <span className="text-white mr-2">@{currentUser?.username}:</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          className="bg-transparent text-white outline-none flex-1 font-mono"
          placeholder="Type your message or '$sendfile' to send a .balance file... (ESC to exit)"
          autoComplete="off"
          spellCheck="false"
        />
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
