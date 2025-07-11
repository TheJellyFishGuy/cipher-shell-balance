
import React, { useRef } from 'react';
import { Upload, Lock, Unlock } from 'lucide-react';

interface FileUploadProps {
  onFileProcess: (file: File, action: 'encrypt' | 'decrypt') => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileProcess,
  isProcessing
}) => {
  const encryptInputRef = useRef<HTMLInputElement>(null);
  const decryptInputRef = useRef<HTMLInputElement>(null);

  const handleEncryptClick = () => {
    encryptInputRef.current?.click();
  };

  const handleDecryptClick = () => {
    decryptInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, action: 'encrypt' | 'decrypt') => {
    const file = e.target.files?.[0];
    if (file) {
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

      {/* Encrypt Section */}
      <div className="border border-white rounded-none p-3 bg-black">
        <div className="text-white text-xs whitespace-pre mb-2">
{`┌─ ENCRYPT ──────────────────────────┐
│ Convert .txt files to .balance     │
└────────────────────────────────────┘`}
        </div>
        <button
          onClick={handleEncryptClick}
          disabled={isProcessing}
          className="w-full bg-transparent border border-white text-white px-4 py-2 hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-mono text-sm"
        >
          <Lock className="w-4 h-4 mr-2" />
          [SELECT .TXT FILE]
        </button>
        <input
          ref={encryptInputRef}
          type="file"
          accept=".txt"
          onChange={(e) => handleFileChange(e, 'encrypt')}
          className="hidden"
        />
      </div>

      {/* Decrypt Section */}
      <div className="border border-white rounded-none p-3 bg-black">
        <div className="text-white text-xs whitespace-pre mb-2">
{`┌─ DECRYPT ──────────────────────────┐
│ Convert .balance files to .txt     │
└────────────────────────────────────┘`}
        </div>
        <button
          onClick={handleDecryptClick}
          disabled={isProcessing}
          className="w-full bg-transparent border border-white text-white px-4 py-2 hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-mono text-sm"
        >
          <Unlock className="w-4 h-4 mr-2" />
          [SELECT .BALANCE FILE]
        </button>
        <input
          ref={decryptInputRef}
          type="file"
          accept=".balance"
          onChange={(e) => handleFileChange(e, 'decrypt')}
          className="hidden"
        />
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
