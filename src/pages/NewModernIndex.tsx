import React, { useState, useRef, useEffect } from 'react';
import { Terminal, MessageCircle, Settings, Monitor, FileImage } from 'lucide-react';
import { WindowManager } from '@/components/WindowManager';
import { WorkspaceManager } from '@/components/WorkspaceManager';
import { WindowTray } from '@/components/WindowTray';
import { NeomorphicTerminal } from '@/components/NeomorphicTerminal';
import { NeomorphicChat } from '@/components/NeomorphicChat';
import { SystemMonitor } from '@/components/SystemMonitor';
import { AdministrationApp } from '@/components/AdministrationApp';
import { BalanceImageViewer } from '@/components/BalanceImageViewer';
import { EncryptionService } from '@/services/EncryptionService';
import { CausalityService } from '@/services/CausalityService';
import { UserService } from '@/services/UserService';
import { MessageService } from '@/services/MessageService';
import { ChatHistoryService } from '@/services/ChatHistoryService';
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
  const [devMode, setDevMode] = useState(false);
  const [devModePasswordPrompt, setDevModePasswordPrompt] = useState(false);

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
      .replace(/\.txt/g, '<span style="color: hsl(220 30% 45%); font-weight: 500;">.txt</span>')
      .replace(/\.balance/g, '<span style="color: hsl(260 20% 50%); font-weight: 500;">.balance</span>')
      .replace(/\.causality/g, '<span style="color: hsl(280 30% 45%); font-weight: 500;">.causality</span>')
      .replace(/\b(encrypt|decrypt|help|clear|toggledevmode|admin|viewimage|chat|mail|registeruser|login|logout)\b/g, '<span style="color: hsl(220 30% 40%); font-weight: 600;">$1</span>')
      .replace(/Error:/g, '<span style="color: hsl(0 65% 55%); font-weight: 600;">❌ Error:</span>')
      .replace(/Successfully/g, '<span style="color: hsl(120 45% 45%); font-weight: 600;">✅ Successfully</span>')
      .replace(/@(\w+)/g, '<span style="color: hsl(200 50% 45%); font-weight: 500;">@$1</span>');
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

    // Handle dev mode password prompt
    if (devModePasswordPrompt) {
      if (command.trim() === 'workinprogress') {
        setDevMode(!devMode);
        setDevModePasswordPrompt(false);
        addFormattedToHistory(`🔧 Developer mode ${devMode ? 'disabled' : 'enabled'}`);
        if (!devMode) {
          addFormattedToHistory('🛠️ Administration tools are now available');
        }
        toast({
          title: `Developer Mode ${devMode ? 'Disabled' : 'Enabled'}`,
          description: devMode ? 'Back to normal mode' : 'Advanced tools unlocked',
        });
      } else {
        addFormattedToHistory('❌ Incorrect password. Developer mode access denied.');
        setDevModePasswordPrompt(false);
      }
      addToHistory('');
      return;
    }
    
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
        addFormattedToHistory('  encrypt     - Encrypt a text file to .balance/.causality format');
        addFormattedToHistory('  decrypt     - Decrypt a .balance/.causality file');
        addFormattedToHistory('  viewimage   - Open Balance Image Viewer');
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
        addFormattedToHistory('  clear       - Clear terminal history');
        if (devMode) {
          addFormattedToHistory('');
          addFormattedToHistory('🔧 Developer Tools:');
          addFormattedToHistory('  admin       - Open administration panel');
        }
        break;

      case 'toggledevmode':
        addFormattedToHistory('🔐 Enter developer password:');
        setDevModePasswordPrompt(true);
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

      case 'viewimage':
        openWindow('image-viewer', 'Balance Image Viewer', <BalanceImageViewer />);
        addFormattedToHistory('🖼️ Balance Image Viewer opened');
        break;

      case 'admin':
        if (!devMode) {
          addFormattedToHistory('❌ Error: Administration panel requires developer mode');
          addFormattedToHistory('💡 Use "toggledevmode" to access developer features');
        } else {
          openWindow('admin', 'Administration', <AdministrationApp />);
          addFormattedToHistory('🛠️ Administration panel opened');
        }
        break;

      case 'registeruser':
        if (!UserService.getCurrentUser()) {
          setRegistrationMode({ active: true, step: 'username' });
          addFormattedToHistory('📝 User Registration');
          addFormattedToHistory('👤 Enter username:');
        } else {
          addFormattedToHistory('❌ Error: You are already logged in. Logout first to register a new account.');
        }
        break;

      case 'logout':
        const currentUser = UserService.getCurrentUser();
        if (currentUser) {
          UserService.logout();
          addFormattedToHistory(`👋 Successfully logged out from ${currentUser.username}`);
          toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
          });
        } else {
          addFormattedToHistory('❌ Error: You are not logged in');
        }
        break;

      case 'mail':
        if (!UserService.getCurrentUser()) {
          addFormattedToHistory('❌ Error: You must be logged in to check mail');
        } else {
          setIsProcessing(true);
          const result = await MessageService.getUnreadMessages();
          if (result.success && result.count > 0) {
            addFormattedToHistory(`📬 You have ${result.count} unread message(s):`);
            result.messages.slice(0, 3).forEach(msg => {
              addFormattedToHistory(`  • From: ${msg.from_user_id} - ${msg.content.substring(0, 50)}...`);
            });
            if (result.count > 3) {
              addFormattedToHistory(`  ... and ${result.count - 3} more`);
            }
          } else {
            addFormattedToHistory('📭 No unread messages');
          }
          setIsProcessing(false);
        }
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
              openWindow('chat', 'Balance Chat', (
                <NeomorphicChat onExit={() => closeWindow('chat')} />
              ));
              addFormattedToHistory('💬 Chat interface opened');
            } else {
              setIsProcessing(true);
              const targetUser = await UserService.findUserByUsername(username);
              if (targetUser) {
                openWindow('chat', `Chat with @${username}`, (
                  <NeomorphicChat
                    targetUsername={username.toLowerCase()}
                    onExit={() => closeWindow('chat')}
                  />
                ));
                addFormattedToHistory(`💬 Chat with @${username} opened`);
                // Update chat history
                ChatHistoryService.updateChatHistory(username.toLowerCase(), `Started chat with @${username}`, true);
              } else {
                addFormattedToHistory(`❌ Error: User ${username} not found.`);
              }
              setIsProcessing(false);
            }
          }
        }
        else if (args[0] && (args[0].toLowerCase() === 'encrypt' || args[0].toLowerCase() === 'decrypt')) {
          // File operations would be handled through file upload dialogs
          addFormattedToHistory(`💡 ${args[0].charAt(0).toUpperCase() + args[0].slice(1)} operations are available through the file upload interface`);
          addFormattedToHistory('🔐 Supported formats: .balance (standard) and .causality (enhanced)');
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
    {
      id: 'image-viewer',
      name: 'Image Viewer',
      icon: FileImage,
      isActive: windows.some(w => w.id === 'image-viewer'),
    },
    ...(devMode ? [{
      id: 'admin',
      name: 'Administration',
      icon: Settings,
      isActive: windows.some(w => w.id === 'admin'),
    }] : []),
  ];

  const handleTrayItemToggle = (id: string) => {
    const exists = windows.find(w => w.id === id);
    if (exists) {
      closeWindow(id);
    } else {
      switch (id) {
        case 'terminal':
          openWindow('terminal', 'Terminal', (
            <NeomorphicTerminal
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
        case 'chat':
          openWindow('chat', 'Balance Chat', (
            <NeomorphicChat onExit={() => closeWindow('chat')} />
          ));
          break;
        case 'image-viewer':
          openWindow('image-viewer', 'Balance Image Viewer', <BalanceImageViewer />);
          break;
        case 'admin':
          if (devMode) {
            openWindow('admin', 'Administration', <AdministrationApp />);
          }
          break;
      }
    }
  };

  const handleTrayItemClick = (id: string) => {
    // No additional quick action items in neumorphic design
    // All functionality is accessed through the tray toggle system
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Neumorphic background */}
      <div className="fixed inset-0 bg-background" />
      
      {/* Header with logo and workspace tabs */}
      <header className="relative z-40 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="neomorphic-panel w-16 h-16 rounded-full overflow-hidden flex items-center justify-center">
              <img 
                src={balanceLogo} 
                alt="Balance Logo" 
                className="w-12 h-12 object-cover rounded-full"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Balance</h1>
              <p className="text-sm text-muted-foreground">
                Secure File Management Platform {devMode && '• Developer Mode'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="neomorphic-panel px-4 py-2">
              <span className="text-xs text-muted-foreground font-medium">
                {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
              </span>
            </div>
            {devMode && (
              <div className="neomorphic-panel px-3 py-1 border-2 border-destructive/30">
                <span className="text-xs font-bold text-destructive">DEV MODE</span>
              </div>
            )}
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
            <div className="neomorphic-panel p-8 text-center max-w-lg">
              <Terminal className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-semibold mb-2">Welcome to Balance</h2>
              <p className="text-muted-foreground mb-6">
                Your secure file management platform with advanced encryption capabilities.
                Click the terminal icon to get started, or use the workspace tabs to organize your work.
              </p>
              <button
                onClick={() => handleTrayItemToggle('terminal')}
                className="neomorphic-button px-8 py-4 text-primary font-semibold"
              >
                Open Terminal
              </button>
              {devMode && (
                <div className="mt-4 p-3 neomorphic-inset rounded-lg">
                  <p className="text-sm text-destructive font-medium">
                    🔧 Developer Mode Active - Advanced tools available
                  </p>
                </div>
              )}
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