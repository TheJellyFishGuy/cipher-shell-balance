import React, { useRef, useState } from 'react';
import { Upload, FileText, Lock, Unlock, Zap } from 'lucide-react';

interface ModernFileUploadProps {
  onFileProcess: (file: File, action: 'encrypt' | 'decrypt') => void;
  isProcessing: boolean;
}

export const ModernFileUpload: React.FC<ModernFileUploadProps> = ({
  onFileProcess,
  isProcessing
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const action = file.name.endsWith('.balance') ? 'decrypt' : 'encrypt';
      onFileProcess(file, action);
    }
    e.target.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const action = file.name.endsWith('.balance') ? 'decrypt' : 'encrypt';
      onFileProcess(file, action);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Card */}
      <div className="card-modern animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Upload className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">File Processing</h3>
            <p className="text-xs text-muted-foreground">Drag & drop or click to select</p>
          </div>
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer group ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
          onClick={handleFileClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              dragActive ? 'bg-primary text-white' : 'bg-muted group-hover:bg-primary group-hover:text-white'
            }`}>
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {isProcessing ? 'Processing file...' : 'Choose files to process'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports .txt (encrypt) and .balance (decrypt) files
              </p>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.balance"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />
      </div>

      {/* File Type Guide */}
      <div className="card-modern animate-slide-up" style={{animationDelay: '100ms'}}>
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Supported Operations
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-emerald-700 dark:text-emerald-300 text-sm">Encrypt Files</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">.txt → .balance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Unlock className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-purple-700 dark:text-purple-300 text-sm">Decrypt Files</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">.balance → .txt</p>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="card-modern animate-scale-in border-primary/50 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <p className="font-medium text-primary">Processing your file...</p>
              <p className="text-xs text-primary/70">Please wait while we handle your request</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};