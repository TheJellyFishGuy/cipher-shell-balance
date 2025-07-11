
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
│ `}<span className="text-white">registeruser</span>{` - Create new account    │
│ `}<span className="text-white">login</span>{` <user> <pass> - Login       │
│ `}<span className="text-white">chat</span>{` <username> - Start chat      │
│ `}<span className="text-white">mail</span>{`         - Check messages     │
└────────────────────────────────────┘`}
        </div>
      </div>

      {/* File Commands */}
      <div className="border border-white rounded-none p-3 bg-black">
        <div className="text-white text-xs whitespace-pre">
{`┌─ FILE COMMANDS ────────────────────┐
│ `}<span className="text-white">encrypt</span>{`  - Prepare to encrypt file │
│ `}<span className="text-white">decrypt</span>{`  - Prepare to decrypt file │
│ `}<span className="text-white">help</span>{`     - Show all commands       │
│ `}<span className="text-white">clear</span>{`    - Clear terminal history  │
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
