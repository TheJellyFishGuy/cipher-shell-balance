
export class EncryptionService {
  private static readonly BALANCE_HEADER = 'BALANCE_ENCRYPTED_FILE_V1';
  private static readonly KEY = 'balance_secret_key_2024'; // In production, use proper key management

  static encrypt(text: string): string {
    try {
      // Simple encryption - in production, use proper encryption libraries
      const encoded = btoa(unescape(encodeURIComponent(text)));
      const encrypted = this.simpleEncrypt(encoded, this.KEY);
      return `${this.BALANCE_HEADER}\n${encrypted}`;
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  static decrypt(encryptedText: string): string {
    try {
      const lines = encryptedText.split('\n');
      
      if (lines[0] !== this.BALANCE_HEADER) {
        throw new Error('Invalid .balance file format');
      }
      
      const encrypted = lines.slice(1).join('\n');
      const decrypted = this.simpleDecrypt(encrypted, this.KEY);
      const decoded = decodeURIComponent(escape(atob(decrypted)));
      
      return decoded;
    } catch (error) {
      throw new Error('Decryption failed - invalid file or corrupted data');
    }
  }

  private static simpleEncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const textChar = text.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      result += String.fromCharCode(textChar ^ keyChar);
    }
    return btoa(result);
  }

  private static simpleDecrypt(encryptedText: string, key: string): string {
    const text = atob(encryptedText);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const textChar = text.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      result += String.fromCharCode(textChar ^ keyChar);
    }
    return result;
  }

  // Validate if a file appears to be a .balance file
  static isValidBalanceFile(content: string): boolean {
    return content.startsWith(this.BALANCE_HEADER);
  }
}
