
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
    <div className="space-y-4">
      {/* Encrypt Section */}
      <div className="border border-green-400/50 rounded p-3 hover:border-green-400 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-green-400 font-bold flex items-center">
            <Lock className="w-4 h-4 mr-2" />
            ENCRYPT
          </span>
        </div>
        <p className="text-green-400/70 text-sm mb-3">
          Select a .txt file to encrypt into .balance format
        </p>
        <button
          onClick={handleEncryptClick}
          disabled={isProcessing}
          className="w-full bg-transparent border border-green-400 text-green-400 px-4 py-2 rounded hover:bg-green-400 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Upload className="w-4 h-4 mr-2" />
          SELECT .TXT FILE
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
      <div className="border border-green-400/50 rounded p-3 hover:border-green-400 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-green-400 font-bold flex items-center">
            <Unlock className="w-4 h-4 mr-2" />
            DECRYPT
          </span>
        </div>
        <p className="text-green-400/70 text-sm mb-3">
          Select a .balance file to decrypt back to .txt
        </p>
        <button
          onClick={handleDecryptClick}
          disabled={isProcessing}
          className="w-full bg-transparent border border-green-400 text-green-400 px-4 py-2 rounded hover:bg-green-400 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Upload className="w-4 h-4 mr-2" />
          SELECT .BALANCE FILE
        </button>
        <input
          ref={decryptInputRef}
          type="file"
          accept=".balance"
          onChange={(e) => handleFileChange(e, 'decrypt')}
          className="hidden"
        />
      </div>

      {isProcessing && (
        <div className="text-center text-green-400">
          <div className="animate-pulse">Processing...</div>
        </div>
      )}
    </div>
  );
};
