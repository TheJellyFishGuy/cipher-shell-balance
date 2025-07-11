
import { supabase } from '@/integrations/supabase/client';
import { UserService } from './UserService';

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  content: string;
  message_type: 'chat' | 'mail';
  read_at: string | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string | null;
  created_at: string;
}

export class MessageService {
  static async sendMessage(
    toUsername: string, 
    content: string, 
    messageType: 'chat' | 'mail' = 'chat'
  ): Promise<{ success: boolean; message: string }> {
    const currentUser = UserService.getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'You must be logged in to send messages' };
    }

    try {
      const targetUser = await UserService.findUserByUsername(toUsername);
      if (!targetUser) {
        return { success: false, message: `User ${toUsername} not found` };
      }

      const { error } = await supabase
        .from('messages')
        .insert([
          {
            from_user_id: currentUser.id,
            to_user_id: targetUser.id,
            content,
            message_type: messageType
          }
        ]);

      if (error) {
        return { success: false, message: 'Failed to send message: ' + error.message };
      }

      return { success: true, message: `Message sent to ${toUsername}` };
    } catch (error) {
      return { success: false, message: 'Failed to send message: ' + (error as Error).message };
    }
  }

  static async getUnreadMessages(): Promise<{ success: boolean; messages: Message[]; count: number }> {
    const currentUser = UserService.getCurrentUser();
    if (!currentUser) {
      return { success: false, messages: [], count: 0 };
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('to_user_id', currentUser.id)
        .is('read_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, messages: [], count: 0 };
      }

      // Type cast the data to match our Message interface
      const messages: Message[] = (data || []).map(msg => ({
        ...msg,
        message_type: msg.message_type as 'chat' | 'mail'
      }));

      return { success: true, messages, count: messages.length };
    } catch {
      return { success: false, messages: [], count: 0 };
    }
  }

  static async markMessageAsRead(messageId: string): Promise<void> {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId);
  }

  static async getChatHistory(username: string): Promise<{ success: boolean; messages: Message[] }> {
    const currentUser = UserService.getCurrentUser();
    if (!currentUser) {
      return { success: false, messages: [] };
    }

    try {
      const targetUser = await UserService.findUserByUsername(username);
      if (!targetUser) {
        return { success: false, messages: [] };
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(from_user_id.eq.${currentUser.id},to_user_id.eq.${targetUser.id}),and(from_user_id.eq.${targetUser.id},to_user_id.eq.${currentUser.id})`)
        .eq('message_type', 'chat')
        .order('created_at', { ascending: true });

      if (error) {
        return { success: false, messages: [] };
      }

      // Type cast the data to match our Message interface
      const messages: Message[] = (data || []).map(msg => ({
        ...msg,
        message_type: msg.message_type as 'chat' | 'mail'
      }));

      return { success: true, messages };
    } catch {
      return { success: false, messages: [] };
    }
  }

  static async createOrGetChatSession(username: string): Promise<{ success: boolean; sessionId?: string }> {
    const currentUser = UserService.getCurrentUser();
    if (!currentUser) {
      return { success: false };
    }

    try {
      const targetUser = await UserService.findUserByUsername(username);
      if (!targetUser) {
        return { success: false };
      }

      // Try to find existing session
      const { data: existingSession } = await supabase
        .from('chat_sessions')
        .select('*')
        .or(`and(user1_id.eq.${currentUser.id},user2_id.eq.${targetUser.id}),and(user1_id.eq.${targetUser.id},user2_id.eq.${currentUser.id})`)
        .single();

      if (existingSession) {
        return { success: true, sessionId: existingSession.id };
      }

      // Create new session
      const { data: newSession, error } = await supabase
        .from('chat_sessions')
        .insert([
          {
            user1_id: currentUser.id,
            user2_id: targetUser.id
          }
        ])
        .select()
        .single();

      if (error) {
        return { success: false };
      }

      return { success: true, sessionId: newSession.id };
    } catch {
      return { success: false };
    }
  }
}
