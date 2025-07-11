import React, { useState, useRef, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Terminal } from '@/components/Terminal';
import { BalanceLogo } from '@/components/BalanceLogo';
import { EncryptionService } from '@/services/EncryptionService';

const Index = () => {
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'Welcome to BALANCE - Secure File Encryption Terminal',
    'Type "help" for available commands',
    ''
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingAction, setPendingAction] = useState<'encrypt' | 'decrypt' | null>(null);

  const addToHistory = (message: string) => {
    setTerminalHistory(prev => [...prev, message]);
  };

  const formatMessage = (message: string) => {
    // Color code file extensions and commands
    let formatted = message
      .replace(/\.txt/g, '<span class="text-blue-400">.txt</span>')
      .replace(/\.balance/g, '<span class="text-purple-400">.balance</span>')
      .replace(/\b(encrypt|decrypt|help|clear|logo)\b/g, '<span class="text-purple-300">$1</span>')
      .replace(/Error:/g, '<span class="text-red-400">Error:</span>')
      .replace(/Successfully/g, '<span class="text-green-400">Successfully</span>');
    
    return formatted;
  };

  const addFormattedToHistory = (message: string) => {
    setTerminalHistory(prev => [...prev, formatMessage(message)]);
  };

  const processCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim();
    addToHistory(`> ${command}`);
    
    switch (cmd) {
      case 'help':
        addFormattedToHistory('Available commands:');
        addFormattedToHistory('  help     - Show this help message');
        addFormattedToHistory('  encrypt  - Encrypt a text file to .balance format');
        addFormattedToHistory('  decrypt  - Decrypt a .balance file');
        addFormattedToHistory('  clear    - Clear terminal history');
        addFormattedToHistory('  logo     - Display BALANCE logo');
        break;
      
      case 'clear':
        setTerminalHistory([
          'Welcome to BALANCE - Secure File Encryption Terminal',
          'Type "help" for available commands',
          ''
        ]);
        return;
      
      case 'logo':
        addToHistory('');
        addToHistory('BALANCE ASCII Logo:');
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
        addFormattedToHistory(`Unknown command: ${command}`);
        addFormattedToHistory('Type "help" for available commands');
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
          
          {/* Terminal Section */}
          <div className="lg:col-span-2">
            <Terminal
              history={terminalHistory}
              currentInput={currentInput}
              onInputChange={setCurrentInput}
              onCommand={processCommand}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
