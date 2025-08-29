import React, { useState, useRef, useEffect } from 'react';
import { ModernHeader } from '@/components/ModernHeader';
import { ModernFileUpload } from '@/components/ModernFileUpload';
import { ModernTerminal } from '@/components/ModernTerminal';
import { ModernChat } from '@/components/ModernChat';
import { ModernSidebar } from '@/components/ModernSidebar';
import { EncryptionService } from '@/services/EncryptionService';
import { UserService } from '@/services/UserService';
import { MessageService } from '@/services/MessageService';
import { useToast } from '@/hooks/use-toast';

const ModernIndex = () => {
  const { toast } = useToast();
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    '🎉 Welcome to Balance - Your Secure File Management Platform',
    'Type "help" to see available commands',
    ''
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingAction, setPendingAction] = useState<'encrypt' | 'decrypt' | null>(null);
  const [chatMode, setChatMode] = useState<{ active: boolean; username: string }>({ active: false, username: '' });
  const [registrationMode, setRegistrationMode] = useState<{ active: boolean; step: 'username' | 'password'; username?: string }>({ active: false, step: 'username' });

  useEffect(() => {
    const currentUser = UserService.getCurrentUser();
    if (currentUser) {
      addFormattedToHistory(`✅ Welcome back, ${currentUser.username}! You are logged in.`);
    }
  }, []);

  const addToHistory = (message: string) => {
    setTerminalHistory(prev => [...prev, message]);
  };

  const formatMessage = (message: string) => {
    return message
      .replace(/\.txt/g, '<span class="text-blue-500 font-medium">.txt</span>')
      .replace(/\.balance/g, '<span class="text-purple-500 font-medium">.balance</span>')
      .replace(/\b(encrypt|decrypt|help|clear|logo|chat|mail|registeruser|login|logout)\b/g, '<span class="text-indigo-600 font-semibold">$1</span>')
      .replace(/Error:/g, '<span class="text-red-500 font-semibold">❌ Error:</span>')
      .replace(/Successfully/g, '<span class="text-emerald-500 font-semibold">✅ Successfully</span>')
      .replace(/@(\w+)/g, '<span class="text-cyan-500 font-medium">@$1</span>');
  };

  const addFormattedToHistory = (message: string) => {
    setTerminalHistory(prev => [...prev, formatMessage(message)]);
  };

  const processCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim();
    const args = command.trim().split(' ');
    
    addToHistory(`> ${command}`);
    
    // Handle registration mode
    if (registrationMode.active) {
      if (registrationMode.step === 'username') {
        setRegistrationMode({ active: true, step: 'password', username: command.trim() });
        addFormattedToHistory('🔐 Enter password:');
        return;
      } else if (registrationMode.step === 'password') {
        setIsProcessing(true);
        const result = await UserService.registerUser(registrationMode.username!, command.trim());
        setRegistrationMode({ active: false, step: 'username' });
        addFormattedToHistory(result.message);
        
        if (result.success) {
          toast({
            title: "Registration Successful",
            description: `Welcome to Balance, ${registrationMode.username}!`,
          });
        }
        
        setIsProcessing(false);
        addToHistory('');
        return;
      }
    }

    switch (cmd) {
      case 'help':
        addFormattedToHistory('📋 Available Commands:');
        addFormattedToHistory('');
        addFormattedToHistory('🔐 File Operations:');
        addFormattedToHistory('  encrypt     - Encrypt a text file to .balance format');
        addFormattedToHistory('  decrypt     - Decrypt a .balance file');
        addFormattedToHistory('');
        addFormattedToHistory('👤 User Management:');
        addFormattedToHistory('  registeruser - Register a new user account');
        addFormattedToHistory('  login <username> <password> - Login to your account');
        addFormattedToHistory('  logout      - Logout from your account');
        addFormattedToHistory('');
        addFormattedToHistory('💬 Communication:');
        addFormattedToHistory('  chat <username> - Start chat with a user');
        addFormattedToHistory('  mail        - Check your unread messages');
        addFormattedToHistory('');
        addFormattedToHistory('🛠️ Utilities:');
        addFormattedToHistory('  clear       - Clear terminal history');
        addFormattedToHistory('  help        - Show this help message');
        break;
      
      case 'clear':
        setTerminalHistory([
          '🎉 Welcome to Balance - Your Secure File Management Platform',
          'Type "help" to see available commands',
          ''
        ]);
        return;
      
      case 'registeruser':
        if (UserService.getCurrentUser()) {
          addFormattedToHistory('⚠️ You are already logged in. Use "logout" first.');
        } else {
          setRegistrationMode({ active: true, step: 'username' });
          addFormattedToHistory('👤 Enter username:');
        }
        break;
      
      case 'logout':
        if (UserService.getCurrentUser()) {
          UserService.logout();
          addFormattedToHistory('👋 Logged out successfully.');
          toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
          });
        } else {
          addFormattedToHistory('⚠️ You are not logged in.');
        }
        break;
      
      case 'mail':
        if (!UserService.getCurrentUser()) {
          addFormattedToHistory('❌ Error: You must be logged in to check mail.');
        } else {
          setIsProcessing(true);
          const result = await MessageService.getUnreadMessages();
          if (result.success) {
            if (result.count === 0) {
              addFormattedToHistory('📭 No unread messages.');
            } else {
              addFormattedToHistory(`📬 You have ${result.count} unread message(s):`);
              for (const message of result.messages) {
                const timestamp = new Date(message.created_at).toLocaleString();
                addFormattedToHistory(`[${timestamp}] From: ${message.content}`);
                await MessageService.markMessageAsRead(message.id);
              }
            }
          } else {
            addFormattedToHistory('❌ Error: Failed to fetch messages.');
          }
          setIsProcessing(false);
        }
        break;
      
      case 'encrypt':
        addFormattedToHistory('🔐 Ready to encrypt. Please select a .txt file using the file upload area.');
        setPendingAction('encrypt');
        break;
      
      case 'decrypt':
        addFormattedToHistory('🔓 Ready to decrypt. Please select a .balance file using the file upload area.');
        setPendingAction('decrypt');
        break;
      
      default:
        if (args[0] && args[0].toLowerCase() === 'login') {
          if (args.length !== 3) {
            addFormattedToHistory('💡 Usage: login <username> <password>');
          } else {
            setIsProcessing(true);
            const result = await UserService.loginUser(args[1], args[2]);
            addFormattedToHistory(result.message);
            
            if (result.success) {
              toast({
                title: "Login Successful",
                description: `Welcome back, ${args[1]}!`,
              });
            }
            
            setIsProcessing(false);
          }
        }
        else if (args[0] && args[0].toLowerCase() === 'chat') {
          if (!UserService.getCurrentUser()) {
            addFormattedToHistory('❌ Error: You must be logged in to chat.');
          } else {
            const username = args[1];
            if (!username) {
              addFormattedToHistory('💡 Usage: chat <username>');
            } else {
              setIsProcessing(true);
              const targetUser = await UserService.findUserByUsername(username);
              if (targetUser) {
                setChatMode({ active: true, username: username.toLowerCase() });
                addFormattedToHistory(`💬 Starting chat with @${username}...`);
              } else {
                addFormattedToHistory(`❌ Error: User ${username} not found.`);
              }
              setIsProcessing(false);
            }
          }
        }
        else {
          addFormattedToHistory(`❌ Unknown command: ${command}`);
          addFormattedToHistory('💡 Type "help" for available commands');
        }
    }
    
    addToHistory('');
  };

  const handleFileProcess = async (file: File, action: 'encrypt' | 'decrypt') => {
    setIsProcessing(true);
    setPendingAction(null);
    addFormattedToHistory(`🔄 Processing file: "${file.name}"`);
    
    try {
      if (action === 'encrypt') {
        if (!file.name.endsWith('.txt')) {
          addFormattedToHistory('❌ Error: Only .txt files can be encrypted');
          toast({
            title: "Invalid File Type",
            description: "Only .txt files can be encrypted",
            variant: "destructive"
          });
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
        
        addFormattedToHistory(`✅ Successfully encrypted "${file.name}" to "${file.name.replace('.txt', '.balance')}"`);
        addFormattedToHistory('📥 File downloaded to your default download location.');
        
        toast({
          title: "File Encrypted",
          description: `${file.name} has been successfully encrypted`,
        });
        
      } else {
        if (!file.name.endsWith('.balance')) {
          addFormattedToHistory('❌ Error: Only .balance files can be decrypted');
          toast({
            title: "Invalid File Type",
            description: "Only .balance files can be decrypted",
            variant: "destructive"
          });
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
        
        addFormattedToHistory(`✅ Successfully decrypted "${file.name}" to "${file.name.replace('.balance', '.txt')}"`);
        addFormattedToHistory('📥 File downloaded to your default download location.');
        
        toast({
          title: "File Decrypted",
          description: `${file.name} has been successfully decrypted`,
        });
      }
    } catch (error) {
      addFormattedToHistory(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      addToHistory('');
    }
  };

  const handleExitChat = () => {
    setChatMode({ active: false, username: '' });
    addFormattedToHistory('💬 Chat session ended.');
    addToHistory('');
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <ModernHeader />
      
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <ModernSidebar onCommand={processCommand} />
          </div>
          
          {/* File Upload */}
          <div className="lg:col-span-3">
            <ModernFileUpload 
              onFileProcess={handleFileProcess}
              isProcessing={isProcessing}
            />
          </div>
          
          {/* Terminal/Chat Section */}
          <div className="lg:col-span-6">
            {chatMode.active ? (
              <ModernChat
                targetUsername={chatMode.username}
                onExit={handleExitChat}
              />
            ) : (
              <ModernTerminal
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

export default ModernIndex;