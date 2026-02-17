'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SettingRow {
    key: string;
    value: any;
    category: string;
}

const SETTING_CATEGORIES = [
    { id: 'general', label: 'General', icon: 'ri-settings-3-line', description: 'Site name, tagline, and logo' },
    { id: 'contact', label: 'Contact Info', icon: 'ri-contacts-line', description: 'Email, phone, and address' },
    { id: 'social', label: 'Social Media', icon: 'ri-share-line', description: 'Social media links' },
    { id: 'branding', label: 'Branding', icon: 'ri-palette-line', description: 'Colors and visual identity' },
    { id: 'currency', label: 'Currency', icon: 'ri-money-cny-circle-line', description: 'Currency settings' },
    { id: 'footer', label: 'Footer', icon: 'ri-layout-bottom-line', description: 'Footer content and links' },
];

const SOCIAL_PLATFORMS = [
    { key: 'social_facebook', label: 'Facebook', icon: 'ri-facebook-fill', color: '#1877F2' },
    { key: 'social_instagram', label: 'Instagram', icon: 'ri-instagram-line', color: '#E4405F' },
    { key: 'social_twitter', label: 'X (Twitter)', icon: 'ri-twitter-x-line', color: '#000' },
    { key: 'social_tiktok', label: 'TikTok', icon: 'ri-tiktok-line', color: '#000' },
    { key: 'social_youtube', label: 'YouTube', icon: 'ri-youtube-line', color: '#FF0000' },
    { key: 'social_snapchat', label: 'Snapchat', icon: 'ri-snapchat-line', color: '#FFFC00' },
    { key: 'social_whatsapp', label: 'WhatsApp', icon: 'ri-whatsapp-line', color: '#25D366' },
];

export default function SiteSettingsPage() {
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase.from('site_settings').select('*');
            if (error) throw error;

            const settingsObj: Record<string, any> = {};
            (data || []).forEach((row: SettingRow) => {
                settingsObj[row.key] = typeof row.value === 'string' ? row.value : row.value;
            });
            setSettings(settingsObj);
        } catch (err) {
            console.error('Error fetching settings:', err);
            showToast('error', 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type: string, message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const getVal = (key: string): string => {
        const val = settings[key];
        if (val === undefined || val === null) return '';
        if (typeof val === 'string') return val;
        return String(val);
    };

    const setVal = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            // Upload logo if changed
            let logoUrl = getVal('site_logo');
            if (logoFile) {
                const ext = logoFile.name.split('.').pop();
                const filePath = `branding/logo-${Date.now()}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from('media')
                    .upload(filePath, logoFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
                logoUrl = urlData.publicUrl;
                setVal('site_logo', logoUrl);
            }

            // Prepare all settings for upsert
            const settingsToSave = Object.entries(settings).map(([key, value]) => {
                // Determine category
                let category = 'general';
                if (key.startsWith('social_')) category = 'social';
                else if (key.startsWith('contact_')) category = 'contact';
                else if (key.startsWith('footer_') || key === 'payment_methods') category = 'footer';
                else if (['primary_color', 'secondary_color', 'accent_color'].includes(key)) category = 'branding';
                else if (['currency', 'currency_symbol'].includes(key)) category = 'currency';

                return {
                    key,
                    value: typeof value === 'string' ? value : JSON.stringify(value),
                    category,
                    updated_at: new Date().toISOString(),
                };
            });

            // Also include logo
            if (logoUrl !== getVal('site_logo')) {
                const existing = settingsToSave.find(s => s.key === 'site_logo');
                if (existing) {
                    existing.value = logoUrl;
                }
            }

            const { error } = await supabase
                .from('site_settings')
                .upsert(settingsToSave, { onConflict: 'key' });

            if (error) throw error;

            showToast('success', 'Settings saved successfully!');
            setLogoFile(null);
        } catch (err: any) {
            console.error('Error saving settings:', err);
            showToast('error', err.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-500">
                    <i className="ri-loader-4-line animate-spin text-2xl"></i>
                    <span>Loading settings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl text-white font-medium flex items-center gap-3 animate-slide-in-right ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    <i className={toast.type === 'success' ? 'ri-check-line text-lg' : 'ri-error-warning-line text-lg'}></i>
                    {toast.message}
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
                        <p className="text-gray-500 mt-1">Manage your website&apos;s global configuration</p>
                    </div>
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
                    >
                        {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-line"></i>}
                        {saving ? 'Saving...' : 'Save All'}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Tabs */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            {SETTING_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveTab(cat.id)}
                                    className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-all border-l-4 ${activeTab === cat.id
                                            ? 'bg-blue-50 border-blue-600 text-blue-700'
                                            : 'border-transparent text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <i className={`${cat.icon} text-xl`}></i>
                                    <div>
                                        <p className="font-semibold text-sm">{cat.label}</p>
                                        <p className="text-xs text-gray-400">{cat.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Panel */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                            {/* General */}
                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <i className="ri-settings-3-line text-blue-600"></i> General Settings
                                    </h2>
                                    <div className="grid gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Site Name</label>
                                            <input type="text" value={getVal('site_name')} onChange={e => setVal('site_name', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tagline</label>
                                            <input type="text" value={getVal('site_tagline')} onChange={e => setVal('site_tagline', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Site Logo</label>
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-20 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                                    {(logoPreview || getVal('site_logo')) ? (
                                                        <img src={logoPreview || getVal('site_logo')} alt="Logo" className="w-full h-full object-contain p-2" />
                                                    ) : (
                                                        <i className="ri-image-add-line text-3xl text-gray-400"></i>
                                                    )}
                                                </div>
                                                <div>
                                                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-upload" />
                                                    <label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                                                        <i className="ri-upload-2-line"></i> Upload Logo
                                                    </label>
                                                    <p className="text-xs text-gray-400 mt-1">PNG, SVG, or WebP. Max 2MB.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Contact */}
                            {activeTab === 'contact' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <i className="ri-contacts-line text-blue-600"></i> Contact Information
                                    </h2>
                                    <div className="grid gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                            <div className="relative">
                                                <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                                <input type="email" value={getVal('contact_email')} onChange={e => setVal('contact_email', e.target.value)} className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                            <div className="relative">
                                                <i className="ri-phone-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                                <input type="text" value={getVal('contact_phone')} onChange={e => setVal('contact_phone', e.target.value)} className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Physical Address</label>
                                            <div className="relative">
                                                <i className="ri-map-pin-line absolute left-4 top-4 text-gray-400"></i>
                                                <textarea value={getVal('contact_address')} onChange={e => setVal('contact_address', e.target.value)} rows={3} className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Social Media */}
                            {activeTab === 'social' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <i className="ri-share-line text-blue-600"></i> Social Media Links
                                    </h2>
                                    <p className="text-sm text-gray-500">Add your social media profile URLs. Leave blank to hide a platform.</p>
                                    <div className="grid gap-4">
                                        {SOCIAL_PLATFORMS.map(platform => (
                                            <div key={platform.key} className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: platform.color + '15', color: platform.color }}>
                                                    <i className={`${platform.icon} text-xl`}></i>
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="url"
                                                        value={getVal(platform.key)}
                                                        onChange={e => setVal(platform.key, e.target.value)}
                                                        placeholder={`https://${platform.label.toLowerCase().replace(/[() ]/g, '')}.com/...`}
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Branding */}
                            {activeTab === 'branding' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <i className="ri-palette-line text-blue-600"></i> Brand Colors
                                    </h2>
                                    <p className="text-sm text-gray-500">Define your brand&apos;s color scheme. Changes will reflect across the entire website.</p>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {[
                                            { key: 'primary_color', label: 'Primary Color', desc: 'Main brand color (green)' },
                                            { key: 'secondary_color', label: 'Secondary Color', desc: 'Accent/gold color' },
                                            { key: 'accent_color', label: 'Accent Color', desc: 'Hover/highlight color' },
                                        ].map(colorSetting => (
                                            <div key={colorSetting.key} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">{colorSetting.label}</label>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <input
                                                        type="color"
                                                        value={getVal(colorSetting.key) || '#000000'}
                                                        onChange={e => setVal(colorSetting.key, e.target.value)}
                                                        className="w-14 h-14 rounded-xl cursor-pointer border-2 border-gray-200"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={getVal(colorSetting.key)}
                                                        onChange={e => setVal(colorSetting.key, e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                                                        placeholder="#000000"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-400">{colorSetting.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Preview */}
                                    <div className="mt-8 p-6 rounded-2xl border border-gray-200">
                                        <h3 className="font-bold text-sm text-gray-600 mb-4">Preview</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 flex-1 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: getVal('primary_color') || '#0D6B4E' }}>
                                                Primary
                                            </div>
                                            <div className="h-16 flex-1 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: getVal('secondary_color') || '#D4A853' }}>
                                                Secondary
                                            </div>
                                            <div className="h-16 flex-1 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: getVal('accent_color') || '#1a8f6e' }}>
                                                Accent
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Currency */}
                            {activeTab === 'currency' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <i className="ri-money-cny-circle-line text-blue-600"></i> Currency Settings
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Currency Code</label>
                                            <input type="text" value={getVal('currency')} onChange={e => setVal('currency', e.target.value)} placeholder="GHS" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Currency Symbol</label>
                                            <input type="text" value={getVal('currency_symbol')} onChange={e => setVal('currency_symbol', e.target.value)} placeholder="GH₵" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            {activeTab === 'footer' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <i className="ri-layout-bottom-line text-blue-600"></i> Footer Settings
                                    </h2>
                                    <div className="grid gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Footer Description</label>
                                            <textarea value={getVal('footer_description')} onChange={e => setVal('footer_description', e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Copyright Text</label>
                                            <input type="text" value={getVal('footer_copyright')} onChange={e => setVal('footer_copyright', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">CTA Title</label>
                                                <input type="text" value={getVal('footer_cta_title')} onChange={e => setVal('footer_cta_title', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">CTA Subtitle</label>
                                                <input type="text" value={getVal('footer_cta_subtitle')} onChange={e => setVal('footer_cta_subtitle', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
