import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

interface NeomorphicTerminalProps {
  history: string[];
  currentInput: string;
  onInputChange: (value: string) => void;
  onCommand: (command: string) => void;
  isProcessing: boolean;
}

export const NeomorphicTerminal: React.FC<NeomorphicTerminalProps> = ({
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
    if (!isProcessing && inputRef.current) {
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

  const formatMessage = (message: string) => {
    return message
      .replace(/\.txt/g, '<span style="color: hsl(220 30% 45%); font-weight: 500;">.txt</span>')
      .replace(/\.balance/g, '<span style="color: hsl(260 20% 50%); font-weight: 500;">.balance</span>')
      .replace(/\.causality/g, '<span style="color: hsl(280 30% 45%); font-weight: 500;">.causality</span>')
      .replace(/\b(encrypt|decrypt|help|clear|toggledevmode|admin|viewimage)\b/g, '<span style="color: hsl(220 30% 40%); font-weight: 600;">$1</span>')
      .replace(/❌ Error:/g, '<span style="color: hsl(0 65% 55%); font-weight: 600;">❌ Error:</span>')
      .replace(/✅ Successfully/g, '<span style="color: hsl(120 45% 45%); font-weight: 600;">✅ Successfully</span>')
      .replace(/@(\w+)/g, '<span style="color: hsl(200 50% 45%); font-weight: 500;">@$1</span>');
  };

  return (
    <div className="neomorphic-panel p-6 h-full flex flex-col">
      {/* Terminal Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="neomorphic-button p-2">
          <Terminal className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Balance Terminal</h3>
          <p className="text-sm text-muted-foreground">Secure file management interface</p>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="neomorphic-inset flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1 mb-4"
      >
        {history.map((line, index) => (
          <div
            key={index}
            className="text-foreground whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formatMessage(line) }}
          />
        ))}
        {isProcessing && (
          <div className="text-muted-foreground animate-pulse">
            Processing...
          </div>
        )}
      </div>

      {/* Terminal Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <span className="text-primary font-mono font-semibold">$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => onInputChange(e.target.value)}
          disabled={isProcessing}
          className="neomorphic-input flex-1 font-mono text-sm text-foreground placeholder:text-muted-foreground"
          placeholder="Type your command..."
          autoComplete="off"
        />
      </form>
    </div>
  );
};