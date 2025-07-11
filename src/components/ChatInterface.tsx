
import React, { useState, useEffect, useRef } from 'react';
import { MessageService, Message } from '@/services/MessageService';
import { UserService } from '@/services/UserService';
import { EncryptionService } from '@/services/EncryptionService';

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

    // Check for $downloadfile command
    if (messageContent.toLowerCase().startsWith('$downloadfile ')) {
      const filename = messageContent.substring('$downloadfile '.length).trim();
      if (!filename) {
        // Add a temporary message to show usage
        setMessages(prev => [...prev, {
          id: 'temp-' + Date.now(),
          from_user_id: 'system',
          to_user_id: currentUser?.id || '',
          content: 'Usage: $downloadfile filename (without .balance extension)',
          message_type: 'chat',
          read_at: null,
          created_at: new Date().toISOString()
        } as Message]);
        return;
      }

      // Search for the file and download it
      const result = await MessageService.findFileInMessages(filename, targetUsername);
      if (result.success && result.content) {
        try {
          // Try to decrypt the file content
          const decryptedContent = EncryptionService.decrypt(result.content);
          
          // Create and download the text file
          const blob = new Blob([decryptedContent], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}.txt`;
          link.click();
          URL.revokeObjectURL(url);

          // Add success message
          setMessages(prev => [...prev, {
            id: 'temp-' + Date.now(),
            from_user_id: 'system',
            to_user_id: currentUser?.id || '',
            content: `Successfully downloaded ${filename}.balance as ${filename}.txt`,
            message_type: 'chat',
            read_at: null,
            created_at: new Date().toISOString()
          } as Message]);
        } catch (error) {
          // Add error message
          setMessages(prev => [...prev, {
            id: 'temp-' + Date.now(),
            from_user_id: 'system',
            to_user_id: currentUser?.id || '',
            content: `Error: Failed to decrypt ${filename}.balance - file may be corrupted`,
            message_type: 'chat',
            read_at: null,
            created_at: new Date().toISOString()
          } as Message]);
        }
      } else {
        // Add not found message
        setMessages(prev => [...prev, {
          id: 'temp-' + Date.now(),
          from_user_id: 'system',
          to_user_id: currentUser?.id || '',
          content: result.message,
          message_type: 'chat',
          read_at: null,
          created_at: new Date().toISOString()
        } as Message]);
      }
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
              <span className={
                message.from_user_id === 'system' ? "text-yellow-400 ml-2" :
                message.from_user_id === currentUser?.id ? "text-green-400 ml-2" : "text-purple-400 ml-2"
              }>
                {message.from_user_id === 'system' ? 'System' :
                 message.from_user_id === currentUser?.id ? 'You' : `@${targetUsername}`}:
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
          placeholder="Type your message, '$sendfile' to send a .balance file, or '$downloadfile filename' to download... (ESC to exit)"
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
