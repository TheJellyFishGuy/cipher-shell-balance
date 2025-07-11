
import React, { useEffect, useRef } from 'react';

interface TerminalProps {
  history: string[];
  currentInput: string;
  onInputChange: (value: string) => void;
  onCommand: (command: string) => void;
  isProcessing: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({
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

  return (
    <div 
      className="border border-green-400 rounded h-full bg-black/50 flex flex-col cursor-text"
      onClick={handleClick}
    >
      <div className="p-4 border-b border-green-400">
        <h2 className="text-green-400 font-bold">BALANCE TERMINAL</h2>
      </div>
      
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-transparent"
      >
        {history.map((line, index) => (
          <div key={index} className="text-green-400 whitespace-pre-wrap leading-tight">
            {line}
          </div>
        ))}
        
        <form onSubmit={handleSubmit} className="flex items-center mt-2">
          <span className="text-green-400 mr-2">balance@terminal:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => onInputChange(e.target.value)}
            className="bg-transparent text-green-400 outline-none flex-1 font-mono"
            disabled={isProcessing}
            autoComplete="off"
            spellCheck="false"
          />
          {isProcessing && (
            <span className="text-green-400 animate-pulse ml-2">●</span>
          )}
        </form>
      </div>
    </div>
  );
};
