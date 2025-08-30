export class CausalityService {
  private static readonly CAUSALITY_HEADER = 'CAUSALITY_ENCRYPTED_FILE_V2';
  private static readonly KEY = 'causality_quantum_key_2024'; // Enhanced key for causality format

  static encrypt(text: string): string {
    try {
      // Enhanced encryption for .causality format
      const encoded = btoa(unescape(encodeURIComponent(text)));
      const encrypted = this.quantumEncrypt(encoded, this.KEY);
      const timestamp = new Date().toISOString();
      return `${this.CAUSALITY_HEADER}\n${timestamp}\n${encrypted}`;
    } catch (error) {
      throw new Error('Causality encryption failed');
    }
  }

  static decrypt(encryptedText: string): string {
    try {
      const lines = encryptedText.split('\n');
      
      if (lines[0] !== this.CAUSALITY_HEADER) {
        throw new Error('Invalid .causality file format');
      }
      
      // Skip timestamp (line 1) and get encrypted content
      const encrypted = lines.slice(2).join('\n');
      const decrypted = this.quantumDecrypt(encrypted, this.KEY);
      const decoded = decodeURIComponent(escape(atob(decrypted)));
      
      return decoded;
    } catch (error) {
      throw new Error('Causality decryption failed - invalid file or corrupted data');
    }
  }

  private static quantumEncrypt(text: string, key: string): string {
    let result = '';
    const keyHash = this.simpleHash(key);
    
    for (let i = 0; i < text.length; i++) {
      const textChar = text.charCodeAt(i);
      const keyChar = keyHash.charCodeAt(i % keyHash.length);
      const quantum = (i % 3) + 1; // Simple quantum modifier
      result += String.fromCharCode((textChar ^ keyChar) + quantum);
    }
    return btoa(result);
  }

  private static quantumDecrypt(encryptedText: string, key: string): string {
    const text = atob(encryptedText);
    let result = '';
    const keyHash = this.simpleHash(key);
    
    for (let i = 0; i < text.length; i++) {
      const textChar = text.charCodeAt(i);
      const keyChar = keyHash.charCodeAt(i % keyHash.length);
      const quantum = (i % 3) + 1; // Simple quantum modifier
      result += String.fromCharCode((textChar - quantum) ^ keyChar);
    }
    return result;
  }

  private static simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Validate if a file appears to be a .causality file
  static isValidCausalityFile(content: string): boolean {
    return content.startsWith(this.CAUSALITY_HEADER);
  }

  static getFileInfo(content: string): { timestamp?: string; valid: boolean } {
    if (!this.isValidCausalityFile(content)) {
      return { valid: false };
    }
    
    const lines = content.split('\n');
    const timestamp = lines[1];
    return { timestamp, valid: true };
  }
}