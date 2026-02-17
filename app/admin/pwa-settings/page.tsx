'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function PWAPage() {
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState({
        app_name: 'WIDAMA Pharmacy',
        theme_color: '#0D6B4E'
    });

    useEffect(() => { fetchConfig(); }, []);

    const fetchConfig = async () => {
        try {
            const { data } = await supabase.from('site_settings').select('value').eq('key', 'pwa_config').single();
            if (data?.value) setConfig(JSON.parse(data.value));
        } finally { setLoading(false); }
    };

    const saveConfig = async () => {
        const { error } = await supabase.from('site_settings').upsert({
            key: 'pwa_config', value: JSON.stringify(config), updated_at: new Date().toISOString()
        });
        if (error) toast.error('Error'); else toast.success('Saved');
    };

    if (loading) return <div className="p-4 md:p-8">Loading...</div>;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="mb-4">
                <Link href="/admin/modules" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors w-fit">
                    <i className="ri-arrow-left-line"></i> Back to Modules
                </Link>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">PWA Settings</h1>
            <div className="bg-white p-4 md:p-6 rounded-xl shadow border border-gray-100 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">App Name</label>
                        <input
                            type="text"
                            value={config.app_name}
                            onChange={e => setConfig({ ...config, app_name: e.target.value })}
                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={config.theme_color}
                                onChange={e => setConfig({ ...config, theme_color: e.target.value })}
                                className="w-12 h-10 p-0 border border-gray-200 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={config.theme_color}
                                onChange={e => setConfig({ ...config, theme_color: e.target.value })}
                                className="flex-1 p-2.5 border border-gray-200 rounded-lg uppercase"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={saveConfig}
                        className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
