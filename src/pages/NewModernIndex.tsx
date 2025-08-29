import React, { useState, useRef, useEffect } from 'react';
import { Terminal, MessageCircle, Image, FileText, Monitor, Calculator, Clock } from 'lucide-react';
import { WindowManager } from '@/components/WindowManager';
import { WorkspaceManager } from '@/components/WorkspaceManager';
import { WindowTray } from '@/components/WindowTray';
import { ModernTerminal } from '@/components/ModernTerminal';
import { ModernChat } from '@/components/ModernChat';
import { ImageViewer } from '@/components/ImageViewer';
import { SystemMonitor } from '@/components/SystemMonitor';
import { EncryptionService } from '@/services/EncryptionService';
import { UserService } from '@/services/UserService';
import { MessageService } from '@/services/MessageService';
import { useToast } from '@/hooks/use-toast';
import balanceLogo from '/lovable-uploads/1c0e90a5-1bd2-4ced-ab27-2c6d470a6d6d.png';

interface Workspace {
  id: string;
  name: string;
  color: string;
}

interface Window {
  id: string;
  title: string;
  content: React.ReactNode;
}

const NewModernIndex = () => {
  const { toast } = useToast();
  
  // Workspace management
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: 'main', name: 'Main Workspace', color: '#3b82f6' },
  ]);
  const [activeWorkspace, setActiveWorkspace] = useState('main');
  
  // Window management
  const [windows, setWindows] = useState<Window[]>([]);
  const [chatMode, setChatMode] = useState<{ active: boolean; username: string }>({ active: false, username: '' });
  
  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    '🎉 Welcome to Balance - Your Secure File Management Platform',
    'Type "help" to see available commands',
    ''
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<{ active: boolean; step: 'username' | 'password'; username?: string }>({ active: false, step: 'username' });

  useEffect(() => {
    const currentUser = UserService.getCurrentUser();
    if (currentUser) {
      addFormattedToHistory(`✅ Welcome back, ${currentUser.username}! You are logged in.`);
    }
  }, []);

  // Helper functions for terminal
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

  // Window management functions
  const openWindow = (id: string, title: string, content: React.ReactNode) => {
    setWindows(prev => {
      const exists = prev.find(w => w.id === id);
      if (exists) {
        return prev.map(w => w.id === id ? { ...w, content } : w);
      }
      return [...prev, { id, title, content }];
    });
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  // Workspace management functions
  const addWorkspace = () => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    const newWorkspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name: `Workspace ${workspaces.length + 1}`,
      color: colors[workspaces.length % colors.length],
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
    setActiveWorkspace(newWorkspace.id);
  };

  const deleteWorkspace = (id: string) => {
    if (workspaces.length > 1) {
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      if (activeWorkspace === id) {
        setActiveWorkspace(workspaces[0].id);
      }
    }
  };

  const renameWorkspace = (id: string, name: string) => {
    setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, name } : w));
  };

  // Terminal command processing
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
        addFormattedToHistory('  viewimage   - Open image viewer for balance files');
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
        addFormattedToHistory('🛠️ System Tools:');
        addFormattedToHistory('  monitor     - Open system monitor');
        addFormattedToHistory('  calc        - Open calculator');
        addFormattedToHistory('  clear       - Clear terminal history');
        break;

      case 'clear':
        setTerminalHistory([
          '🎉 Welcome to Balance - Your Secure File Management Platform',
          'Type "help" to see available commands',
          ''
        ]);
        return;

      case 'monitor':
        openWindow('monitor', 'System Monitor', <SystemMonitor />);
        addFormattedToHistory('🖥️ System Monitor opened');
        break;

      case 'calc':
        openWindow('calculator', 'Calculator', (
          <div className="p-4">
            <div className="text-center">
              <Calculator className="w-12 h-12 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Calculator functionality would be implemented here</p>
            </div>
          </div>
        ));
        addFormattedToHistory('🧮 Calculator opened');
        break;

      case 'viewimage':
        // Simulate opening a balance image file
        openWindow('image-viewer', 'Balance Image Viewer', (
          <ImageViewer
            imageSrc={balanceLogo}
            title="Balance Logo"
            onClose={() => closeWindow('image-viewer')}
          />
        ));
        addFormattedToHistory('🖼️ Image viewer opened');
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
                openWindow('chat', `Chat with @${username}`, (
                  <ModernChat
                    targetUsername={username.toLowerCase()}
                    onExit={() => closeWindow('chat')}
                  />
                ));
                addFormattedToHistory(`💬 Chat with @${username} opened in window`);
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

  // Tray management
  const trayItems = [
    {
      id: 'terminal',
      name: 'Terminal',
      icon: Terminal,
      isActive: windows.some(w => w.id === 'terminal'),
    },
    {
      id: 'chat',
      name: 'Chat',
      icon: MessageCircle,
      isActive: windows.some(w => w.id === 'chat'),
    },
    {
      id: 'monitor',
      name: 'System Monitor',
      icon: Monitor,
      isActive: windows.some(w => w.id === 'monitor'),
    },
  ];

  const handleTrayItemToggle = (id: string) => {
    const exists = windows.find(w => w.id === id);
    if (exists) {
      closeWindow(id);
    } else {
      switch (id) {
        case 'terminal':
          openWindow('terminal', 'Terminal', (
            <ModernTerminal
              history={terminalHistory}
              currentInput={currentInput}
              onInputChange={setCurrentInput}
              onCommand={processCommand}
              isProcessing={isProcessing}
            />
          ));
          break;
        case 'monitor':
          openWindow('monitor', 'System Monitor', <SystemMonitor />);
          break;
      }
    }
  };

  const handleTrayItemClick = (id: string) => {
    switch (id) {
      case 'calculator':
        openWindow('calculator', 'Calculator', (
          <div className="p-8 text-center">
            <Calculator className="w-16 h-16 mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Calculator functionality</p>
          </div>
        ));
        break;
      case 'clock':
        openWindow('clock', 'Clock', (
          <div className="p-8 text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 text-primary" />
            <div className="text-2xl font-mono">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        ));
        break;
    }
  };

  return (
    <div className="min-h-screen gradient-subtle relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="fixed inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, hsl(var(--accent)) 0%, transparent 50%)`
        }}
      />
      
      {/* Header with logo and workspace tabs */}
      <header className="relative z-40 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20">
              <img 
                src={balanceLogo} 
                alt="Balance Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">Balance</h1>
              <p className="text-sm text-muted-foreground">Secure File Management Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="glass-panel px-4 py-2">
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        <WorkspaceManager
          activeWorkspace={activeWorkspace}
          onWorkspaceChange={setActiveWorkspace}
          workspaces={workspaces}
          onAddWorkspace={addWorkspace}
          onDeleteWorkspace={deleteWorkspace}
          onRenameWorkspace={renameWorkspace}
        />
      </header>

      {/* Left tray for quick access */}
      <WindowTray
        items={trayItems}
        onItemClick={handleTrayItemClick}
        onItemToggle={handleTrayItemToggle}
      />

      {/* Main content area */}
      <main className="relative z-30 p-6">
        {windows.length === 0 && (
          <div className="flex items-center justify-center h-96">
            <div className="glass-panel p-8 text-center max-w-md">
              <Terminal className="w-16 h-16 mx-auto mb-4 text-primary animate-glow" />
              <h2 className="text-xl font-semibold mb-2">Welcome to Balance</h2>
              <p className="text-muted-foreground mb-6">
                Click the terminal icon in the left tray to get started, or use the workspace tabs to switch between different environments.
              </p>
              <button
                onClick={() => handleTrayItemToggle('terminal')}
                className="glass-button px-6 py-3 bg-primary/20 border-primary/30 text-primary font-medium"
              >
                Open Terminal
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Window Manager */}
      <WindowManager
        windows={windows}
        onWindowClose={closeWindow}
      />
    </div>
  );
};

export default NewModernIndex;