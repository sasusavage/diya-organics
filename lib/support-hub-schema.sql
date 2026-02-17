-- Enable Support Hub Module
INSERT INTO store_modules (id, enabled, updated_at)
VALUES ('support-hub', true, now())
ON CONFLICT (id) DO UPDATE SET enabled = EXCLUDED.enabled;

-- 1. Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Chat Conversations Table
CREATE TABLE IF NOT EXISTS chat_conversations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    visitor_id text, -- For anon users
    messages jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    last_message_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Knowledge Base
CREATE TABLE IF NOT EXISTS knowledge_base (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    content text NOT NULL,
    category text NOT NULL,
    tags text[],
    is_published boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS Policies (Basic)
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own tickets/chats
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own chats" ON chat_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own chats" ON chat_conversations FOR UPDATE USING (auth.uid() = user_id);

-- Knowledge base is public read
CREATE POLICY "Public KB Read" ON knowledge_base FOR SELECT USING (true);
