
-- Create users table for registration
CREATE TABLE public.terminal_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create messages table for chat and mail
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES public.terminal_users(id) NOT NULL,
  to_user_id UUID REFERENCES public.terminal_users(id) NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'chat', -- 'chat' or 'mail'
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat sessions table
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES public.terminal_users(id) NOT NULL,
  user2_id UUID REFERENCES public.terminal_users(id) NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Enable Row Level Security
ALTER TABLE public.terminal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for terminal_users (public read for username lookup)
CREATE POLICY "Anyone can read usernames" ON public.terminal_users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own account" ON public.terminal_users
  FOR INSERT WITH CHECK (true);

-- Create policies for messages
CREATE POLICY "Users can read their own messages" ON public.messages
  FOR SELECT USING (from_user_id IN (SELECT id FROM public.terminal_users) OR to_user_id IN (SELECT id FROM public.terminal_users));

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (from_user_id IN (SELECT id FROM public.terminal_users));

-- Create policies for chat_sessions
CREATE POLICY "Users can read their chat sessions" ON public.chat_sessions
  FOR SELECT USING (user1_id IN (SELECT id FROM public.terminal_users) OR user2_id IN (SELECT id FROM public.terminal_users));

CREATE POLICY "Users can create chat sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (user1_id IN (SELECT id FROM public.terminal_users) OR user2_id IN (SELECT id FROM public.terminal_users));

-- Create indexes for better performance
CREATE INDEX idx_messages_to_user ON public.messages(to_user_id);
CREATE INDEX idx_messages_from_user ON public.messages(from_user_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_terminal_users_username ON public.terminal_users(username);
