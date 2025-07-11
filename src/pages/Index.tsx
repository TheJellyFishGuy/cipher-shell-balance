
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

  const addToHistory = (message: string) => {
    setTerminalHistory(prev => [...prev, message]);
  };

  const processCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim();
    addToHistory(`> ${command}`);
    
    switch (cmd) {
      case 'help':
        addToHistory('Available commands:');
        addToHistory('  help     - Show this help message');
        addToHistory('  encrypt  - Encrypt a text file to .balance format');
        addToHistory('  decrypt  - Decrypt a .balance file');
        addToHistory('  clear    - Clear terminal history');
        addToHistory('  logo     - Display BALANCE logo');
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
        addToHistory('Use the file upload area to select a text file for encryption.');
        break;
      
      case 'decrypt':
        addToHistory('Use the file upload area to select a .balance file for decryption.');
        break;
      
      default:
        addToHistory(`Unknown command: ${command}`);
        addToHistory('Type "help" for available commands');
    }
    
    addToHistory('');
  };

  const handleFileProcess = async (file: File, action: 'encrypt' | 'decrypt') => {
    setIsProcessing(true);
    addToHistory(`> ${action} "${file.name}"`);
    
    try {
      if (action === 'encrypt') {
        if (!file.name.endsWith('.txt')) {
          addToHistory('Error: Only .txt files can be encrypted');
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
        
        addToHistory(`Successfully encrypted "${file.name}" to "${file.name.replace('.txt', '.balance')}"`);
        
      } else {
        if (!file.name.endsWith('.balance')) {
          addToHistory('Error: Only .balance files can be decrypted');
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
        
        addToHistory(`Successfully decrypted "${file.name}" to "${file.name.replace('.balance', '.txt')}"`);
      }
    } catch (error) {
      addToHistory(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsProcessing(false);
      addToHistory('');
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono overflow-hidden">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen">
          {/* Logo Section */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="border border-green-400 rounded p-4 mb-4 bg-black/50">
              <h1 className="text-green-400 text-xl mb-4 text-center font-bold">
                BALANCE v1.0
              </h1>
              <BalanceLogo />
            </div>
            
            {/* File Operations */}
            <div className="border border-green-400 rounded p-4 bg-black/50 flex-1">
              <h2 className="text-green-400 mb-4 font-bold">FILE OPERATIONS</h2>
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
