'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function LoyaltyPage() {
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState({
        enabled: false,
        points_ratio: 1,
        redemption_value: 0.1
    });

    useEffect(() => { fetchConfig(); }, []);

    const fetchConfig = async () => {
        try {
            const { data } = await supabase.from('site_settings').select('value').eq('key', 'loyalty_config').single();
            if (data?.value) setConfig(JSON.parse(data.value));
        } finally { setLoading(false); }
    };

    const saveConfig = async () => {
        const { error } = await supabase.from('site_settings').upsert({
            key: 'loyalty_config', value: JSON.stringify(config), updated_at: new Date().toISOString()
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
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Loyalty Program</h1>
            <div className="bg-white p-4 md:p-6 rounded-xl shadow border border-gray-100 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={e => setConfig({ ...config, enabled: e.target.checked })}
                        className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                    />
                    <label className="font-medium text-gray-700">Enable Loyalty Program</label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Points per Cedi Spent</label>
                        <input
                            type="number"
                            step="0.1"
                            value={config.points_ratio}
                            onChange={e => setConfig({ ...config, points_ratio: Number(e.target.value) })}
                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">How many points user gets for 1 GHS.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Redemption Value (GHS)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={config.redemption_value}
                            onChange={e => setConfig({ ...config, redemption_value: Number(e.target.value) })}
                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">Value of 1 point in GHS.</p>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={saveConfig}
                        className="w-full md:w-auto px-6 py-2.5 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors shadow-sm"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
