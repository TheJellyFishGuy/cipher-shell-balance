
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
      className="border border-white rounded-none h-full bg-black flex flex-col cursor-text"
      onClick={handleClick}
    >
      <div className="p-4 border-b border-white">
        <h2 className="text-white font-bold">BALANCE TERMINAL</h2>
      </div>
      
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white scrollbar-track-transparent"
      >
        {history.map((line, index) => (
          <div key={index} className="text-white whitespace-pre-wrap leading-tight">
            {line}
          </div>
        ))}
        
        <form onSubmit={handleSubmit} className="flex items-center mt-2">
          <span className="text-white mr-2">balance@terminal:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => onInputChange(e.target.value)}
            className="bg-transparent text-white outline-none flex-1 font-mono"
            disabled={isProcessing}
            autoComplete="off"
            spellCheck="false"
          />
          {isProcessing && (
            <span className="text-white animate-pulse ml-2">●</span>
          )}
        </form>
      </div>
    </div>
  );
};
