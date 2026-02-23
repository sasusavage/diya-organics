'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Helper to generate simple ID if crypto not available
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export default function ChatWidget() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);

    // Chat State
    const [visitorId, setVisitorId] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Hide on admin
        if (pathname?.startsWith('/admin')) {
            setIsEnabled(false);
            return;
        }

        // Initialize Visitor & Check Module Status
        const init = async () => {
            // 1. Check Module Status
            try {
                const { data: moduleData } = await supabase.from('store_modules').select('enabled').eq('id', 'support-hub').single();
                if (!moduleData?.enabled) return; // Don't enable if module off
                setIsEnabled(true);
            } catch (e) {
                console.error('Error checking chat module:', e);
                return;
            }

            // 2. Get/Set Visitor ID
            let vid = localStorage.getItem('STORE_visitor_id');
            if (!vid) {
                vid = generateId();
                localStorage.setItem('STORE_visitor_id', vid);
            }
            setVisitorId(vid);

            // 3. Fetch Existing Conversation
            const { data: conv } = await supabase
                .from('chat_conversations')
                .select('*')
                .eq('visitor_id', vid)
                .eq('is_active', true)
                .single();

            if (conv) {
                setConversationId(conv.id);
                setMessages(conv.messages || []);
            } else {
                // Default Welcome Message
                setMessages([{ role: 'system', content: 'Hello! 👋 How can we help you today?', created_at: new Date().toISOString() }]);
            }
        };

        init();
    }, [pathname]);

    // Realtime Subscription
    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase
            .channel(`chat:${conversationId}`)
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'chat_conversations', filter: `id=eq.${conversationId}` },
                (payload) => {
                    if (payload.new && payload.new.messages) {
                        setMessages(payload.new.messages);
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [conversationId]);

    // Scroll to bottom
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input, created_at: new Date().toISOString() };
        const newMessages = [...messages, userMsg];

        // Optimistic Update
        setMessages(newMessages);
        setInput('');

        try {
            let currentConvId = conversationId;

            // 1. Save User Message to DB
            if (conversationId) {
                // Update existing
                const { error } = await supabase
                    .from('chat_conversations')
                    .update({
                        messages: newMessages,
                        last_message_at: new Date().toISOString(),
                    })
                    .eq('id', conversationId);

                if (error) console.error('DB Update Error:', error);
            } else {
                // Create new
                const { data, error } = await supabase
                    .from('chat_conversations')
                    .insert({
                        visitor_id: visitorId,
                        messages: newMessages,
                        is_active: true
                    })
                    .select()
                    .single();

                if (data) {
                    setConversationId(data.id);
                    currentConvId = data.id;
                }
            }

            // 2. Call AI API
            // Only if we have a valid key (check implicit, api handles it)
            // UX: Add a 'typing' indicator here ideally
            const aiResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, history: messages })
            });

            if (aiResponse.ok) {
                const aiData = await aiResponse.json();
                if (aiData.reply) {
                    const aiMsg = { role: 'agent', content: aiData.reply, created_at: new Date().toISOString() };
                    const updatedWithAi = [...newMessages, aiMsg];

                    setMessages(updatedWithAi);

                    // Update DB with AI reply
                    if (currentConvId) {
                        await supabase
                            .from('chat_conversations')
                            .update({
                                messages: updatedWithAi,
                                last_message_at: new Date().toISOString()
                            })
                            .eq('id', currentConvId);
                    }
                }
            }

        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    if (!isEnabled) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden">
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-[350px] h-[500px] mb-4 flex flex-col border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center shadow-md shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <i className="ri-customer-service-2-line text-lg"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Support Team</h3>
                                <span className="flex items-center gap-1.5 text-xs text-blue-100">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                    We reply instantly
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <i className="ri-close-line text-xl"></i>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                        <form className="relative flex items-center gap-2" onSubmit={handleSend}>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 bg-gray-100 text-gray-800 text-sm border-0 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none placeholder:text-gray-400"
                                placeholder="Type your message..."
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-transform active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="ri-send-plane-fill text-sm"></i>
                            </button>
                        </form>
                        <div className="text-[10px] text-center text-gray-400 mt-2">
                            Powered by <a href="#" className="hover:text-blue-500">STORE AI</a>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
                aria-label="Toggle Chat"
            >
                <span className="absolute inset-0 rounded-full animate-ping bg-blue-600 opacity-20"></span>
                <i className="ri-message-3-fill text-2xl"></i>
            </button>

            {/* Close button state */}
            {isOpen && (
                <button
                    onClick={() => setIsOpen(false)}
                    className="bg-gray-800 hover:bg-gray-900 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all animate-in zoom-in spin-in-90 duration-300 absolute bottom-0 right-0"
                >
                    <i className="ri-close-line text-2xl"></i>
                </button>
            )}
        </div>
    );
}
