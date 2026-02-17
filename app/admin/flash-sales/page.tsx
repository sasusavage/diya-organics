'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

import Link from 'next/link';

export default function FlashSalesPage() {
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState({
        active: false,
        title: 'Flash Sale',
        end_time: '',
        banner_color: '#EF4444'
    });

    useEffect(() => { fetchConfig(); }, []);

    const fetchConfig = async () => {
        try {
            const { data } = await supabase.from('site_settings').select('value').eq('key', 'flash_sales_config').single();
            if (data?.value) setConfig(JSON.parse(data.value));
        } finally { setLoading(false); }
    };

    const saveConfig = async () => {
        const { error } = await supabase.from('site_settings').upsert({
            key: 'flash_sales_config', value: JSON.stringify(config), updated_at: new Date().toISOString()
        });
        if (error) toast.error('Failed to save'); else toast.success('Settings saved!');
    };

    if (loading) return <div className="p-4 md:p-8">Loading...</div>;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="mb-4">
                <Link href="/admin/modules" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors w-fit">
                    <i className="ri-arrow-left-line"></i> Back to Modules
                </Link>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Flash Sales Configuration</h1>
            <div className="bg-white p-4 md:p-6 rounded-xl shadow border border-gray-100 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                        type="checkbox"
                        checked={config.active}
                        onChange={e => setConfig({ ...config, active: e.target.checked })}
                        className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <label className="font-medium text-gray-700">Enable Flash Sale</label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sale Title</label>
                        <input
                            type="text"
                            value={config.title}
                            onChange={e => setConfig({ ...config, title: e.target.value })}
                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            placeholder="e.g. Weekend Flash Sale"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                            type="datetime-local"
                            value={config.end_time}
                            onChange={e => setConfig({ ...config, end_time: e.target.value })}
                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={saveConfig}
                        className="w-full md:w-auto px-6 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
