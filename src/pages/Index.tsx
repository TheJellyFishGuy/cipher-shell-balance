import React, { useState, useRef, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Terminal } from '@/components/Terminal';
import { BalanceLogo } from '@/components/BalanceLogo';
import { ChatInterface } from '@/components/ChatInterface';
import { EncryptionService } from '@/services/EncryptionService';
import { UserService } from '@/services/UserService';
import { MessageService } from '@/services/MessageService';

const Index = () => {
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'Welcome to BALANCE - Secure Terminal Network',
    'Type "help" for available commands',
    ''
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingAction, setPendingAction] = useState<'encrypt' | 'decrypt' | null>(null);
  const [chatMode, setChatMode] = useState<{ active: boolean; username: string }>({ active: false, username: '' });
  const [registrationMode, setRegistrationMode] = useState<{ active: boolean; step: 'username' | 'password'; username?: string }>({ active: false, step: 'username' });

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = UserService.getCurrentUser();
    if (currentUser) {
      addFormattedToHistory(`Welcome back, ${currentUser.username}! You are logged in.`);
    }
  }, []);

  const addToHistory = (message: string) => {
    setTerminalHistory(prev => [...prev, message]);
  };

  const formatMessage = (message: string) => {
    // Color code file extensions and commands
    let formatted = message
      .replace(/\.txt/g, '<span class="text-blue-400">.txt</span>')
      .replace(/\.balance/g, '<span class="text-purple-400">.balance</span>')
      .replace(/\b(encrypt|decrypt|help|clear|logo|chat|mail|registeruser|login|logout)\b/g, '<span class="text-purple-300">$1</span>')
      .replace(/Error:/g, '<span class="text-red-400">Error:</span>')
      .replace(/Successfully/g, '<span class="text-green-400">Successfully</span>')
      .replace(/@(\w+)/g, '<span class="text-cyan-400">@$1</span>');
    
    return formatted;
  };

  const addFormattedToHistory = (message: string) => {
    setTerminalHistory(prev => [...prev, formatMessage(message)]);
  };

  const processCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim();
    const args = command.trim().split(' ');
    
    console.log('Processing command:', cmd); // Debug log
    
    addToHistory(`> ${command}`);
    
    // Handle registration mode
    if (registrationMode.active) {
      if (registrationMode.step === 'username') {
        setRegistrationMode({ active: true, step: 'password', username: command.trim() });
        addFormattedToHistory('Enter password:');
        return;
      } else if (registrationMode.step === 'password') {
        setIsProcessing(true);
        const result = await UserService.registerUser(registrationMode.username!, command.trim());
        setRegistrationMode({ active: false, step: 'username' });
        addFormattedToHistory(result.message);
        setIsProcessing(false);
        addToHistory('');
        return;
      }
    }

    switch (cmd) {
      case 'help':
        addFormattedToHistory('Available commands:');
        addFormattedToHistory('  help        - Show this help message');
        addFormattedToHistory('  encrypt     - Encrypt a text file to .balance format');
        addFormattedToHistory('  decrypt     - Decrypt a .balance file');
        addFormattedToHistory('  registeruser - Register a new user account');
        addFormattedToHistory('  login <username> <password> - Login to your account');
        addFormattedToHistory('  logout      - Logout from your account');
        addFormattedToHistory('  chat <username> - Start chat with a user');
        addFormattedToHistory('  mail        - Check your unread messages');
        addFormattedToHistory('  clear       - Clear terminal history');
        addFormattedToHistory('  logo        - Display BALANCE logo');
        addFormattedToHistory('');
        addFormattedToHistory('Chat commands (only available in chat mode):');
        addFormattedToHistory('  $sendfile   - Send a .balance file to the person you\'re chatting with');
        addFormattedToHistory('  $downloadfile <filename> - Download a .balance file as text (without .balance extension)');
        break;
      
      case 'clear':
        setTerminalHistory([
          'Welcome to BALANCE - Secure Terminal Network',
          'Type "help" for available commands',
          ''
        ]);
        return;
      
      case 'logo':
        addToHistory('');
        addToHistory('BALANCE ASCII Logo:');
        break;
      
      case 'registeruser':
        console.log('Registeruser command detected'); // Debug log
        if (UserService.getCurrentUser()) {
          addFormattedToHistory('You are already logged in. Use "logout" first.');
        } else {
          setRegistrationMode({ active: true, step: 'username' });
          addFormattedToHistory('Enter username:');
        }
        break;
      
      case 'logout':
        if (UserService.getCurrentUser()) {
          UserService.logout();
          addFormattedToHistory('Logged out successfully.');
        } else {
          addFormattedToHistory('You are not logged in.');
        }
        break;
      
      case 'mail':
        if (!UserService.getCurrentUser()) {
          addFormattedToHistory('Error: You must be logged in to check mail.');
        } else {
          setIsProcessing(true);
          const result = await MessageService.getUnreadMessages();
          if (result.success) {
            if (result.count === 0) {
              addFormattedToHistory('No unread messages.');
            } else {
              addFormattedToHistory(`You have ${result.count} unread message(s):`);
              for (const message of result.messages) {
                const senderInfo = await UserService.findUserByUsername(''); // We'll need to get sender info
                const timestamp = new Date(message.created_at).toLocaleString();
                addFormattedToHistory(`[${timestamp}] From unknown: ${message.content}`);
                await MessageService.markMessageAsRead(message.id);
              }
            }
          } else {
            addFormattedToHistory('Error: Failed to fetch messages.');
          }
          setIsProcessing(false);
        }
        break;
      
      case 'encrypt':
        addFormattedToHistory('Ready to encrypt. Please select a .txt file using the file upload area.');
        setPendingAction('encrypt');
        break;
      
      case 'decrypt':
        addFormattedToHistory('Ready to decrypt. Please select a .balance file using the file upload area.');
        setPendingAction('decrypt');
        break;
      
      default:
        // Check if command starts with "login"
        if (args[0] && args[0].toLowerCase() === 'login') {
          if (args.length !== 3) {
            addFormattedToHistory('Usage: login <username> <password>');
          } else {
            setIsProcessing(true);
            const result = await UserService.loginUser(args[1], args[2]);
            addFormattedToHistory(result.message);
            setIsProcessing(false);
          }
        }
        // Check if command starts with "chat"
        else if (args[0] && args[0].toLowerCase() === 'chat') {
          if (!UserService.getCurrentUser()) {
            addFormattedToHistory('Error: You must be logged in to chat.');
          } else {
            const username = args[1];
            if (!username) {
              addFormattedToHistory('Usage: chat <username>');
            } else {
              setIsProcessing(true);
              const targetUser = await UserService.findUserByUsername(username);
              if (targetUser) {
                setChatMode({ active: true, username: username.toLowerCase() });
                addFormattedToHistory(`Starting chat with @${username}...`);
              } else {
                addFormattedToHistory(`Error: User ${username} not found.`);
              }
              setIsProcessing(false);
            }
          }
        }
        else {
          console.log('Unknown command:', command); // Debug log
          addFormattedToHistory(`Unknown command: ${command}`);
          addFormattedToHistory('Type "help" for available commands');
        }
    }
    
    addToHistory('');
  };

  const handleFileProcess = async (file: File, action: 'encrypt' | 'decrypt') => {
    setIsProcessing(true);
    setPendingAction(null);
    addFormattedToHistory(`> Processing file: "${file.name}"`);
    
    try {
      if (action === 'encrypt') {
        if (!file.name.endsWith('.txt')) {
          addFormattedToHistory('Error: Only .txt files can be encrypted');
          return;
        }
        
        const content = await file.text();
        const encrypted = EncryptionService.encrypt(content);
        const blob = new Blob([encrypted], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name.replace('.txt', '.balance');
        link.click();
        
        addFormattedToHistory(`Successfully encrypted "${file.name}" to "${file.name.replace('.txt', '.balance')}"`);
        addFormattedToHistory('File downloaded to your default download location.');
        
      } else {
        if (!file.name.endsWith('.balance')) {
          addFormattedToHistory('Error: Only .balance files can be decrypted');
          return;
        }
        
        const content = await file.text();
        const decrypted = EncryptionService.decrypt(content);
        const blob = new Blob([decrypted], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name.replace('.balance', '.txt');
        link.click();
        
        addFormattedToHistory(`Successfully decrypted "${file.name}" to "${file.name.replace('.balance', '.txt')}"`);
        addFormattedToHistory('File downloaded to your default download location.');
      }
    } catch (error) {
      addFormattedToHistory(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsProcessing(false);
      addToHistory('');
    }
  };

  const handleExitChat = () => {
    setChatMode({ active: false, username: '' });
    addFormattedToHistory('Chat session ended.');
    addToHistory('');
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen">
          {/* Logo Section */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="border border-white rounded-none p-4 mb-4 bg-black">
              <BalanceLogo />
            </div>
            
            {/* File Operations */}
            <div className="border border-white rounded-none p-4 bg-black flex-1">
              <FileUpload 
                onFileProcess={handleFileProcess}
                isProcessing={isProcessing}
              />
            </div>
          </div>
          
          {/* Terminal/Chat Section */}
          <div className="lg:col-span-2">
            {chatMode.active ? (
              <div className="border border-white rounded-none h-full bg-black">
                <ChatInterface
                  targetUsername={chatMode.username}
                  onExit={handleExitChat}
                />
              </div>
            ) : (
              <Terminal
                history={terminalHistory}
                currentInput={currentInput}
                onInputChange={setCurrentInput}
                onCommand={processCommand}
                isProcessing={isProcessing}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
