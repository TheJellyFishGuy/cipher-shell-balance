import React, { useState } from 'react';
import { Image, Upload, Download, Eye, FileImage, AlertCircle } from 'lucide-react';
import { EncryptionService } from '@/services/EncryptionService';
import { CausalityService } from '@/services/CausalityService';
import { useToast } from '@/hooks/use-toast';

export const BalanceImageViewer: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'view' | 'convert'>('view');
  const [viewFormat, setViewFormat] = useState<'ico' | 'jpeg' | 'jpg' | 'png'>('png');
  const [convertFormat, setConvertFormat] = useState<'balance' | 'causality'>('balance');
  const [imageData, setImageData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const supportedFormats = ['ico', 'jpeg', 'jpg', 'png'];
  const encryptionFormats = ['balance', 'causality'];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, mode: 'view' | 'convert') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      if (mode === 'view') {
        // Viewing encrypted image from .balance or .causality file
        if (!file.name.endsWith('.balance') && !file.name.endsWith('.causality')) {
          toast({
            title: "Invalid File Type",
            description: "Please select a .balance or .causality file.",
            variant: "destructive"
          });
          return;
        }

        const fileContent = await file.text();
        let decryptedContent: string;
        
        try {
          if (EncryptionService.isValidBalanceFile(fileContent)) {
            decryptedContent = EncryptionService.decrypt(fileContent);
          } else if (CausalityService.isValidCausalityFile(fileContent)) {
            decryptedContent = CausalityService.decrypt(fileContent);
          } else {
            throw new Error('Invalid file format');
          }

          // Convert base64 to image data URL with specified format
          const mimeType = `image/${viewFormat}`;
          const imageDataUrl = `data:${mimeType};base64,${decryptedContent}`;
          
          setImageData(imageDataUrl);
          setFileName(file.name);
          
          toast({
            title: "Image Loaded",
            description: `Successfully decrypted and loaded ${file.name}`,
          });
        } catch (error) {
          toast({
            title: "Decryption Failed",
            description: "Failed to decrypt the image file. Please check the file format.",
            variant: "destructive"
          });
        }
      } else {
        // Converting regular image to encrypted format
        const validExtensions = supportedFormats.map(fmt => `.${fmt}`);
        const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        
        if (!hasValidExtension) {
          toast({
            title: "Invalid File Type",
            description: `Please select a file with one of these extensions: ${validExtensions.join(', ')}`,
            variant: "destructive"
          });
          return;
        }

        // Convert image to base64
        const reader = new FileReader();
        reader.onload = async (e) => {
          const result = e.target?.result as string;
          const base64Data = result.split(',')[1]; // Remove data URL prefix
          
          try {
            let encryptedContent: string;
            let outputFileName: string;
            
            if (convertFormat === 'balance') {
              encryptedContent = EncryptionService.encrypt(base64Data);
              outputFileName = file.name.replace(/\.[^/.]+$/, '') + '.balance';
            } else {
              encryptedContent = CausalityService.encrypt(base64Data);
              outputFileName = file.name.replace(/\.[^/.]+$/, '') + '.causality';
            }
            
            // Create download
            const blob = new Blob([encryptedContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = outputFileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            toast({
              title: "Image Converted",
              description: `Successfully converted to ${outputFileName}`,
            });
          } catch (error) {
            toast({
              title: "Conversion Failed",
              description: "Failed to encrypt the image.",
              variant: "destructive"
            });
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "An error occurred while processing the file.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  const downloadDecryptedImage = () => {
    if (!imageData) return;
    
    try {
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `decrypted_${fileName.replace(/\.(balance|causality)$/, '')}.${viewFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Image Downloaded",
        description: `Decrypted image saved as ${viewFormat.toUpperCase()} file.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the image.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-full p-6">
      <div className="neomorphic-panel p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="neomorphic-button p-3">
            <FileImage className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Balance Image Viewer</h1>
            <p className="text-sm text-muted-foreground">View and convert encrypted images</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('view')}
            className={`neomorphic-button px-6 py-3 flex items-center gap-2 transition-all ${
              activeTab === 'view' ? 'neomorphic-inset' : ''
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="font-medium">View Image</span>
          </button>
          <button
            onClick={() => setActiveTab('convert')}
            className={`neomorphic-button px-6 py-3 flex items-center gap-2 transition-all ${
              activeTab === 'convert' ? 'neomorphic-inset' : ''
            }`}
          >
            <Upload className="w-4 h-4" />
            <span className="font-medium">Convert Image</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'view' && (
            <div className="space-y-6">
              {/* View Controls */}
              <div className="neomorphic-panel p-4">
                <h3 className="text-lg font-semibold mb-4">View Encrypted Image</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Expected Image Format:</label>
                    <select
                      value={viewFormat}
                      onChange={(e) => setViewFormat(e.target.value as any)}
                      className="neomorphic-input w-full"
                    >
                      {supportedFormats.map(format => (
                        <option key={format} value={format}>
                          .{format.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Encrypted File:</label>
                    <input
                      type="file"
                      accept=".balance,.causality"
                      onChange={(e) => handleFileSelect(e, 'view')}
                      disabled={isProcessing}
                      className="neomorphic-input w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 neomorphic-inset rounded-lg">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Select the correct format that the image was originally in before encryption.
                  </p>
                </div>
              </div>

              {/* Image Display */}
              {imageData && (
                <div className="neomorphic-panel p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Decrypted Image</h3>
                    <button
                      onClick={downloadDecryptedImage}
                      className="neomorphic-button px-4 py-2 flex items-center gap-2 text-primary"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                  
                  <div className="neomorphic-inset p-4 rounded-lg">
                    <img
                      src={imageData}
                      alt="Decrypted image"
                      className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                      style={{ imageRendering: viewFormat === 'ico' ? 'pixelated' : 'auto' }}
                    />
                  </div>
                  
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>File: {fileName}</p>
                    <p>Format: {viewFormat.toUpperCase()}</p>
                  </div>
                </div>
              )}

              {!imageData && !isProcessing && (
                <div className="neomorphic-inset p-8 text-center">
                  <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Image Loaded</h3>
                  <p className="text-muted-foreground">
                    Select an encrypted .balance or .causality file to view the image
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'convert' && (
            <div className="space-y-6">
              {/* Convert Controls */}
              <div className="neomorphic-panel p-4">
                <h3 className="text-lg font-semibold mb-4">Convert Image to Encrypted Format</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Encryption Format:</label>
                    <select
                      value={convertFormat}
                      onChange={(e) => setConvertFormat(e.target.value as any)}
                      className="neomorphic-input w-full"
                    >
                      {encryptionFormats.map(format => (
                        <option key={format} value={format}>
                          .{format} {format === 'balance' ? '(Standard)' : '(Enhanced)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Image File:</label>
                    <input
                      type="file"
                      accept={supportedFormats.map(f => `.${f}`).join(',')}
                      onChange={(e) => handleFileSelect(e, 'convert')}
                      disabled={isProcessing}
                      className="neomorphic-input w-full"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 neomorphic-inset rounded-lg">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Supported formats: {supportedFormats.map(f => `.${f.toUpperCase()}`).join(', ')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="neomorphic-inset p-3 rounded-lg">
                      <h4 className="font-medium mb-2">.balance Format</h4>
                      <p className="text-muted-foreground">Standard encryption with basic security</p>
                    </div>
                    <div className="neomorphic-inset p-3 rounded-lg">
                      <h4 className="font-medium mb-2">.causality Format</h4>
                      <p className="text-muted-foreground">Enhanced encryption with quantum-resistant algorithms</p>
                    </div>
                  </div>
                </div>
              </div>

              {!isProcessing && (
                <div className="neomorphic-inset p-8 text-center">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Convert</h3>
                  <p className="text-muted-foreground mb-4">
                    Select an image file to encrypt it into the chosen format
                  </p>
                  <div className="text-sm text-muted-foreground">
                    The encrypted file will be automatically downloaded when conversion completes
                  </div>
                </div>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="neomorphic-inset p-8 text-center">
              <div className="animate-pulse">
                <FileImage className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Processing...</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'view' ? 'Decrypting image...' : 'Converting and encrypting image...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};