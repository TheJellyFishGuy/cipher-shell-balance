import React, { useEffect, useRef } from 'react';
import { Terminal, ChevronRight } from 'lucide-react';

interface ModernTerminalProps {
  history: string[];
  currentInput: string;
  onInputChange: (value: string) => void;
  onCommand: (command: string) => void;
  isProcessing: boolean;
}

export const ModernTerminal: React.FC<ModernTerminalProps> = ({
  history,
  currentInput,
  onInputChange,
  onCommand,
  isProcessing
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (inputRef.current && !isProcessing) {
      inputRef.current.focus();
    }
  }, [isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim() && !isProcessing) {
      onCommand(currentInput);
      onInputChange('');
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const formatMessage = (message: string) => {
    // Enhanced formatting for modern UI
    let formatted = message
      .replace(/\.txt/g, '<span class="text-blue-500 font-medium">.txt</span>')
      .replace(/\.balance/g, '<span class="text-purple-500 font-medium">.balance</span>')
      .replace(/\b(encrypt|decrypt|help|clear|logo|chat|mail|registeruser|login|logout)\b/g, '<span class="text-indigo-600 font-semibold">$1</span>')
      .replace(/Error:/g, '<span class="text-red-500 font-semibold">Error:</span>')
      .replace(/Successfully/g, '<span class="text-emerald-500 font-semibold">Successfully</span>')
      .replace(/@(\w+)/g, '<span class="text-cyan-500 font-medium">@$1</span>');
    
    return formatted;
  };

  return (
    <div className="card-modern h-full flex flex-col animate-fade-in">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
          <Terminal className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Terminal</h3>
          <p className="text-xs text-muted-foreground">Execute commands securely</p>
        </div>
      </div>
      
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto space-y-1 cursor-text scrollbar-thin"
        onClick={handleClick}
      >
        {history.map((line, index) => (
          <div 
            key={index} 
            className="text-sm leading-relaxed font-mono"
            dangerouslySetInnerHTML={{ __html: formatMessage(line) }}
          />
        ))}
        
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-4 pt-2">
          <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => onInputChange(e.target.value)}
            className="bg-transparent text-foreground outline-none flex-1 font-mono text-sm placeholder:text-muted-foreground"
            placeholder={isProcessing ? "Processing..." : "Type a command..."}
            disabled={isProcessing}
            autoComplete="off"
            spellCheck="false"
          />
          {isProcessing && (
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </form>
      </div>
    </div>
  );
};