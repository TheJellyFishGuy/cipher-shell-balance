
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

export interface TerminalUser {
  id: string;
  username: string;
  created_at: string;
  last_seen: string | null;
}

export class UserService {
  private static currentUser: TerminalUser | null = null;

  static async registerUser(username: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('terminal_users')
        .select('username')
        .eq('username', username.toLowerCase())
        .single();

      if (existingUser) {
        return { success: false, message: 'Username already exists' };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Insert new user
      const { data, error } = await supabase
        .from('terminal_users')
        .insert([
          {
            username: username.toLowerCase(),
            password_hash: passwordHash
          }
        ])
        .select()
        .single();

      if (error) {
        return { success: false, message: 'Registration failed: ' + error.message };
      }

      this.currentUser = data;
      localStorage.setItem('currentUser', JSON.stringify(data));

      return { success: true, message: `User ${username} registered successfully` };
    } catch (error) {
      return { success: false, message: 'Registration failed: ' + (error as Error).message };
    }
  }

  static async loginUser(username: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: user, error } = await supabase
        .from('terminal_users')
        .select('*')
        .eq('username', username.toLowerCase())
        .single();

      if (error || !user) {
        return { success: false, message: 'User not found' };
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return { success: false, message: 'Invalid password' };
      }

      // Update last seen
      await supabase
        .from('terminal_users')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', user.id);

      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));

      return { success: true, message: `Welcome back, ${username}` };
    } catch (error) {
      return { success: false, message: 'Login failed: ' + (error as Error).message };
    }
  }

  static getCurrentUser(): TerminalUser | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
    return this.currentUser;
  }

  static async findUserByUsername(username: string): Promise<TerminalUser | null> {
    try {
      const { data, error } = await supabase
        .from('terminal_users')
        .select('id, username, created_at, last_seen')
        .eq('username', username.toLowerCase())
        .single();

      return error ? null : data;
    } catch {
      return null;
    }
  }

  static logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }
}
