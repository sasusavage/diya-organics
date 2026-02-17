'use client';
import Link from 'next/link';

export default function SupportDashboard() {
    const stats = [
        { title: 'Active Chats', value: '0', icon: 'ri-discuss-line', color: 'bg-green-100 text-green-600' },
        { title: 'Open Tickets', value: '0', icon: 'ri-ticket-line', color: 'bg-amber-100 text-amber-600' },
        { title: 'Unread Messages', value: '0', icon: 'ri-message-3-line', color: 'bg-blue-100 text-blue-600' },
        { title: 'KB Articles', value: '0', icon: 'ri-book-read-line', color: 'bg-purple-100 text-purple-600' },
    ];

    const tools = [
        { title: 'Live Conversations', desc: 'Chat with visitors in real-time', icon: 'ri-chat-1-line', href: '/admin/support/conversations', color: 'bg-blue-500' },
        { title: 'Support Tickets', desc: 'Manage customer inquiries', icon: 'ri-ticket-2-line', href: '/admin/support/tickets', color: 'bg-amber-500' },
        { title: 'Knowledge Base', desc: 'Manage help articles', icon: 'ri-book-open-line', href: '/admin/support/knowledge-base', color: 'bg-purple-500' },
        { title: 'Analytics', desc: 'Support performance stats', icon: 'ri-bar-chart-box-line', href: '/admin/support/analytics', color: 'bg-indigo-500' },
    ];

    return (
        <div className="space-y-8 p-4 md:p-6">

            <div className="mb-4">
                <Link href="/admin/modules" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors w-fit">
                    <i className="ri-arrow-left-line"></i> Back to Modules
                </Link>
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Support Hub</h1>
                <p className="text-gray-500">Manage customer support and AI interactions.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                            <i className={`${stat.icon} text-xl`}></i>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{stat.title}</p>
                            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="text-lg font-bold text-gray-900">Tools & Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tools.map((tool, i) => (
                    <Link key={i} href={tool.href} className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4 ${tool.color} group-hover:scale-110 transition-transform`}>
                            <i className={`${tool.icon} text-2xl`}></i>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{tool.title}</h3>
                        <p className="text-sm text-gray-500">{tool.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
