
import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileProcess: (file: File, action: 'encrypt' | 'decrypt') => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileProcess,
  isProcessing
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Determine action based on file extension
      const action = file.name.endsWith('.balance') ? 'decrypt' : 'encrypt';
      onFileProcess(file, action);
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-4 font-mono">
      {/* ASCII Header */}
      <div className="text-white text-center text-xs whitespace-pre">
{`╔══════════════════════════════════════╗
║            FILE OPERATIONS           ║
╚══════════════════════════════════════╝`}
      </div>

      {/* File Upload Section */}
      <div className="border border-white rounded-none p-3 bg-black">
        <div className="text-white text-xs whitespace-pre mb-2">
{`┌─ SELECT FILE ──────────────────────┐
│ `}<span className="text-blue-400">.txt</span>{` files → encrypt to `}<span className="text-purple-400">.balance</span>{`   │
│ `}<span className="text-purple-400">.balance</span>{` files → decrypt to `}<span className="text-blue-400">.txt</span>{`   │
└────────────────────────────────────┘`}
        </div>
        <button
          onClick={handleFileClick}
          disabled={isProcessing}
          className="w-full bg-transparent border border-white text-white px-4 py-2 hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-mono text-sm"
        >
          <Upload className="w-4 h-4 mr-2" />
          [SELECT FILE]
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.balance"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Command Instructions */}
      <div className="border border-white rounded-none p-3 bg-black">
        <div className="text-white text-xs whitespace-pre">
{`┌─ USER COMMANDS ────────────────────┐
│ registeruser - Create new account  │
│ login <user> <pass> - Login        │
│ chat <username> - Start chat       │
│ mail - Check messages              │
└────────────────────────────────────┘`}
        </div>
      </div>

      {/* File Commands */}
      <div className="border border-white rounded-none p-3 bg-black">
        <div className="text-white text-xs whitespace-pre">
{`┌─ FILE COMMANDS ────────────────────┐
│ encrypt - Prepare to encrypt file  │
│ decrypt - Prepare to decrypt file  │
│ help - Show all commands           │
│ clear - Clear terminal history     │
└────────────────────────────────────┘`}
        </div>
      </div>

      {/* Processing indicator with ASCII style */}
      {isProcessing && (
        <div className="text-center text-white">
          <div className="text-xs whitespace-pre animate-pulse">
{`┌─ STATUS ───────────────────────────┐
│          PROCESSING...             │
└────────────────────────────────────┘`}
          </div>
        </div>
      )}
    </div>
  );
};
