'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';




export default function ConversationsPage() {
    const [loading, setLoading] = useState(true);
    const [chats, setChats] = useState<any[]>([]);

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            // Fetch chats (mock or real)
            const { data, error } = await supabase
                .from('chat_conversations')
                .select('*')
                .order('last_message_at', { ascending: false });

            if (data) setChats(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <Link href="/admin/support" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors w-fit">
                    <i className="ri-arrow-left-line"></i> Back to Support
                </Link>
            </div>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Live Conversations</h1>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                    <i className="ri-refresh-line mr-2"></i> Refresh
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading chats...</div>
                ) : chats.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="ri-chat-1-line text-2xl text-gray-400"></i>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No active conversations</h3>
                        <p className="text-gray-500">When visitors start chatting, they will appear here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {chats.map(chat => (
                            <Link href={`/admin/support/conversations/${chat.id}`} key={chat.id} className="block hover:bg-gray-50 transition-colors p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {chat.visitor_id ? 'V' : 'U'}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">
                                                {chat.visitor_id ? `Visitor ${chat.visitor_id.substring(0, 6)}` : 'Registered User'}
                                            </h4>
                                            <p className="text-sm text-gray-500 line-clamp-1">
                                                {chat.messages && chat.messages.length > 0
                                                    ? chat.messages[chat.messages.length - 1].content || 'Sent an image'
                                                    : 'Started a chat'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${chat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {chat.is_active ? 'Active' : 'Closed'}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
