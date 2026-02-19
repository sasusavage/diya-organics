'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

export default function ChatDetailPage() {
    const { id } = useParams();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = useCallback(async () => {
        const { data } = await supabase.from('chat_conversations').select('messages').eq('id', id).single();
        if (data?.messages) setMessages(data.messages);
    }, [id]);

    useEffect(() => {
        fetchMessages();
        const channel = supabase
            .channel(`chat:${id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_conversations', filter: `id=eq.${id}` }, (payload) => {
                if (payload.new && payload.new.messages) {
                    setMessages(payload.new.messages);
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [id, fetchMessages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msg = { role: 'agent', content: newMessage, created_at: new Date().toISOString() };
        const updatedMessages = [...messages, msg];

        // Optimistic update
        setMessages(updatedMessages);
        setNewMessage('');

        await supabase
            .from('chat_conversations')
            .update({ messages: updatedMessages, last_message_at: new Date().toISOString() })
            .eq('id', id);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="font-bold text-gray-800">Chat Session</h2>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Active</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'agent' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.role === 'agent'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                            }`}>
                            <p>{msg.content}</p>
                            <div className={`text-[10px] mt-1 ${msg.role === 'agent' ? 'text-blue-200' : 'text-gray-400'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 bg-gray-100 border-0 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-lg flex items-center justify-center transition-colors">
                    <i className="ri-send-plane-fill text-lg"></i>
                </button>
            </form>
        </div>
    );
}
