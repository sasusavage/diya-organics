'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';


import Link from 'next/link';

export default function KnowledgeBasePage() {
    const [loading, setLoading] = useState(true);
    const [articles, setArticles] = useState<any[]>([]);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const { data } = await supabase.from('knowledge_base').select('*').order('updated_at', { ascending: false });
            if (data) setArticles(data);
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
                <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">
                    <i className="ri-add-line mr-2"></i> New Article
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading articles...</div>
                ) : articles.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="ri-book-open-line text-2xl text-gray-400"></i>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No articles found</h3>
                        <p className="text-gray-500">Create articles to help your customers.</p>
                    </div>
                ) : (
                    <div className="grid divide-y divide-gray-100">
                        {articles.map(article => (
                            <div key={article.id} className="p-6 hover:bg-gray-50 transition-colors flex justify-between items-center">
                                <div>
                                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md mb-2 inline-block uppercase tracking-wide">
                                        {article.category}
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900">{article.title}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <span>/{article.slug}</span>
                                        <span>•</span>
                                        <span>{article.is_published ? 'Published' : 'Draft'}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><i className="ri-edit-line text-xl"></i></button>
                                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors"><i className="ri-delete-bin-line text-xl"></i></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
