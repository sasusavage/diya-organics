'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface SettingRow {
    key: string;
    value: any;
    category: string;
}

const SETTING_CATEGORIES = [
    { id: 'announcement', label: 'Announcement', icon: 'ri-megaphone-line', description: 'Top announcement bar' },
    { id: 'newsletter', label: 'Newsletter', icon: 'ri-mail-send-line', description: 'Subscription section' },
    { id: 'general', label: 'General', icon: 'ri-settings-3-line', description: 'Site name, tagline, and logo' },
    { id: 'contact', label: 'Contact Info', icon: 'ri-contacts-line', description: 'Email, phone, and address' },
    { id: 'social', label: 'Social Media', icon: 'ri-share-line', description: 'Social media links' },
    { id: 'branding', label: 'Branding', icon: 'ri-palette-line', description: 'Colors and visual identity' },
    { id: 'currency', label: 'Currency', icon: 'ri-money-cny-circle-line', description: 'Currency settings' },
    { id: 'footer', label: 'Footer', icon: 'ri-layout-bottom-line', description: 'Footer content and links' },
    { id: 'about', label: 'About Us', icon: 'ri-info-card-line', description: 'Edit your story and mission' },
    { id: 'home', label: 'Homepage', icon: 'ri-home-4-line', description: 'Edit main page content and hero' },
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

function SettingsContent() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    const [settings, setSettings] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState(tabParam || 'general');
    const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [aboutHeroFile, setAboutHeroFile] = useState<File | null>(null);
    const [aboutHeroPreview, setAboutHeroPreview] = useState<string | null>(null);
    const [contactHeroFile, setContactHeroFile] = useState<File | null>(null);
    const [contactHeroPreview, setContactHeroPreview] = useState<string | null>(null);
    const [homeHeroFile, setHomeHeroFile] = useState<File | null>(null);
    const [homeHeroPreview, setHomeHeroPreview] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

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

    const getJSON = (key: string, fallback: any = []) => {
        const val = settings[key];
        if (!val) return fallback;
        if (typeof val === 'string') {
            try {
                return JSON.parse(val);
            } catch (e) {
                return fallback;
            }
        }
        return val;
    };

    const setJSON = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleAboutHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAboutHeroFile(file);
            setAboutHeroPreview(URL.createObjectURL(file));
        }
    };

    const handleContactHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setContactHeroFile(file);
            setContactHeroPreview(URL.createObjectURL(file));
        }
    };

    const handleHomeHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setHomeHeroFile(file);
            setHomeHeroPreview(URL.createObjectURL(file));
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

            // Upload about hero if changed
            let aboutHeroUrl = getVal('about_hero_image');
            if (aboutHeroFile) {
                const ext = aboutHeroFile.name.split('.').pop();
                const filePath = `about/hero-${Date.now()}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from('media')
                    .upload(filePath, aboutHeroFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
                aboutHeroUrl = urlData.publicUrl;
            }

            // Upload contact hero if changed
            let contactHeroUrl = getVal('contact_hero_image');
            if (contactHeroFile) {
                const ext = contactHeroFile.name.split('.').pop();
                const filePath = `contact/hero-${Date.now()}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from('media')
                    .upload(filePath, contactHeroFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
                contactHeroUrl = urlData.publicUrl;
            }

            // Upload home hero if changed
            let homeHeroUrl = getVal('home_hero_image');
            if (homeHeroFile) {
                const ext = homeHeroFile.name.split('.').pop();
                const filePath = `home/hero-${Date.now()}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from('media')
                    .upload(filePath, homeHeroFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
                homeHeroUrl = urlData.publicUrl;
            }

            // Prepare all settings for upsert
            const settingsToSave = Object.entries(settings).map(([key, value]) => {
                // Determine category
                let category = 'general';
                if (key.startsWith('announcement_')) category = 'announcement';
                else if (key.startsWith('newsletter_')) category = 'newsletter';
                else if (key.startsWith('social_')) category = 'social';
                else if (key.startsWith('contact_')) category = 'contact';
                else if (key.startsWith('footer_') || key === 'payment_methods') category = 'footer';
                else if (key.startsWith('about_')) category = 'about';
                else if (key.startsWith('home_')) category = 'home';
                else if (['primary_color', 'secondary_color', 'accent_color'].includes(key)) category = 'branding';
                else if (['currency', 'currency_symbol'].includes(key)) category = 'currency';

                let finalValue = typeof value === 'string' ? value : JSON.stringify(value);
                if (key === 'site_logo') finalValue = logoUrl;
                if (key === 'about_hero_image') finalValue = aboutHeroUrl;
                if (key === 'contact_hero_image') finalValue = contactHeroUrl;
                if (key === 'home_hero_image') finalValue = homeHeroUrl;

                return {
                    key,
                    value: finalValue,
                    category,
                    updated_at: new Date().toISOString(),
                };
            });

            // If keys were missing from state but we have new URLs, ensure they are added
            if (!settingsToSave.find(s => s.key === 'site_logo')) {
                settingsToSave.push({ key: 'site_logo', value: logoUrl, category: 'general', updated_at: new Date().toISOString() });
            }
            if (!settingsToSave.find(s => s.key === 'about_hero_image')) {
                settingsToSave.push({ key: 'about_hero_image', value: aboutHeroUrl, category: 'about', updated_at: new Date().toISOString() });
            }
            if (!settingsToSave.find(s => s.key === 'contact_hero_image')) {
                settingsToSave.push({ key: 'contact_hero_image', value: contactHeroUrl, category: 'contact', updated_at: new Date().toISOString() });
            }
            if (!settingsToSave.find(s => s.key === 'home_hero_image')) {
                settingsToSave.push({ key: 'home_hero_image', value: homeHeroUrl, category: 'home', updated_at: new Date().toISOString() });
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
                            {/* Announcement */}
                            {activeTab === 'announcement' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <i className="ri-megaphone-line text-blue-600"></i> Announcement Bar
                                    </h2>
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                        <i className="ri-information-line text-blue-600 mt-0.5"></i>
                                        <p className="text-sm text-blue-700">
                                            The announcement bar appears at the very top of your website. Use it for important notices, shipping offers, or running promotions.
                                        </p>
                                    </div>

                                    <div className="grid gap-6">
                                        <div className="flex items-center justify-between bg-white p-4 border border-gray-200 rounded-xl">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900">Enable Announcement Bar</label>
                                                <p className="text-xs text-gray-500">Toggle visibility on the frontend</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={getVal('announcement_enabled') === 'true'}
                                                    onChange={e => setVal('announcement_enabled', String(e.target.checked))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Announcement Text</label>
                                            <input
                                                type="text"
                                                value={getVal('announcement_text')}
                                                onChange={e => setVal('announcement_text', e.target.value)}
                                                placeholder="e.g. Free delivery on orders over GHC 200"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    <div className="mt-8">
                                        <h3 className="font-bold text-sm text-gray-600 mb-4">Preview</h3>
                                        <div className="bg-brand-700 text-white px-4 py-2.5 text-center text-xs sm:text-sm font-medium rounded-lg">
                                            {getVal('announcement_text') || 'Your announcement will appear here'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Newsletter */}
                            {activeTab === 'newsletter' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <i className="ri-mail-send-line text-blue-600"></i> Newsletter Section
                                    </h2>
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                        <i className="ri-information-line text-blue-600 mt-0.5"></i>
                                        <p className="text-sm text-blue-700">
                                            Configure the newsletter subscription section that appears above the footer.
                                        </p>
                                    </div>

                                    <div className="grid gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Section Title</label>
                                            <input
                                                type="text"
                                                value={getVal('newsletter_title')}
                                                onChange={e => setVal('newsletter_title', e.target.value)}
                                                placeholder="Stay Healthy, Stay Informed"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Section Subtitle</label>
                                            <textarea
                                                value={getVal('newsletter_subtitle')}
                                                onChange={e => setVal('newsletter_subtitle', e.target.value)}
                                                placeholder="Subscribe to our newsletter for health tips..."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                <div className="space-y-8">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <i className="ri-contacts-line text-blue-600"></i> Contact Us Page Editor
                                    </h2>

                                    <div className="grid gap-6">
                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                            <h3 className="font-bold text-gray-900 mb-4">Hero Section</h3>
                                            <div className="grid gap-4">
                                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                                    <div className="w-full md:w-1/3">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Image</label>
                                                        <div className="relative group aspect-video bg-white rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                                                            {contactHeroPreview || getVal('contact_hero_image') ? (
                                                                <img src={contactHeroPreview || getVal('contact_hero_image')} alt="Hero Preview" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="text-gray-400 text-center p-4">
                                                                    <i className="ri-image-add-line text-3xl mb-1 block"></i>
                                                                    <span className="text-xs">16:9 Aspect Ratio recommended</span>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                <label className="cursor-pointer bg-white text-gray-900 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-100">
                                                                    Change
                                                                    <input type="file" className="hidden" accept="image/*" onChange={handleContactHeroChange} />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 grid gap-4">
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Title</label>
                                                            <input type="text" value={getVal('contact_hero_title')} onChange={e => setVal('contact_hero_title', e.target.value)} placeholder="Get In Touch" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Description</label>
                                                            <textarea value={getVal('contact_hero_subtitle')} onChange={e => setVal('contact_hero_subtitle', e.target.value)} rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-gray-900">Contact Methods</h3>
                                                <button
                                                    onClick={() => {
                                                        const current = getJSON('contact_methods');
                                                        setJSON('contact_methods', [...current, { icon: 'ri-phone-line', title: 'New Method', value: '', link: '', description: '' }]);
                                                    }}
                                                    className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
                                                >
                                                    <i className="ri-add-line"></i> Add Method
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {getJSON('contact_methods').map((m: any, i: number) => (
                                                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 relative group">
                                                        <button
                                                            onClick={() => {
                                                                const current = getJSON('contact_methods');
                                                                setJSON('contact_methods', current.filter((_: any, idx: number) => idx !== i));
                                                            }}
                                                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <i className="ri-delete-bin-line"></i>
                                                        </button>
                                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Icon</label>
                                                                <input type="text" value={m.icon} onChange={e => {
                                                                    const current = getJSON('contact_methods');
                                                                    current[i].icon = e.target.value;
                                                                    setJSON('contact_methods', [...current]);
                                                                }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="ri-phone-line" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                                                                <input type="text" value={m.title} onChange={e => {
                                                                    const current = getJSON('contact_methods');
                                                                    current[i].title = e.target.value;
                                                                    setJSON('contact_methods', [...current]);
                                                                }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Call Us" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Value</label>
                                                                <input type="text" value={m.value} onChange={e => {
                                                                    const current = getJSON('contact_methods');
                                                                    current[i].value = e.target.value;
                                                                    setJSON('contact_methods', [...current]);
                                                                }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="+233..." />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Link (URL/tel/mailto)</label>
                                                                <input type="text" value={m.link} onChange={e => {
                                                                    const current = getJSON('contact_methods');
                                                                    current[i].link = e.target.value;
                                                                    setJSON('contact_methods', [...current]);
                                                                }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="tel:+233..." />
                                                            </div>
                                                            <div className="lg:col-span-2">
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                                                <input type="text" value={m.description} onChange={e => {
                                                                    const current = getJSON('contact_methods');
                                                                    current[i].description = e.target.value;
                                                                    setJSON('contact_methods', [...current]);
                                                                }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Mon-Fri, 8am-6pm" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-gray-900">FAQ Section</h3>
                                                <button
                                                    onClick={() => {
                                                        const current = getJSON('contact_faqs');
                                                        setJSON('contact_faqs', [...current, { question: 'New Question', answer: 'New Answer' }]);
                                                    }}
                                                    className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
                                                >
                                                    <i className="ri-add-line"></i> Add FAQ
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {getJSON('contact_faqs').map((faq: any, i: number) => (
                                                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 relative group">
                                                        <button
                                                            onClick={() => {
                                                                const current = getJSON('contact_faqs');
                                                                setJSON('contact_faqs', current.filter((_: any, idx: number) => idx !== i));
                                                            }}
                                                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <i className="ri-delete-bin-line"></i>
                                                        </button>
                                                        <div className="grid gap-3">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Question</label>
                                                                <input type="text" value={faq.question} onChange={e => {
                                                                    const current = getJSON('contact_faqs');
                                                                    current[i].question = e.target.value;
                                                                    setJSON('contact_faqs', [...current]);
                                                                }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Answer</label>
                                                                <textarea value={faq.answer} onChange={e => {
                                                                    const current = getJSON('contact_faqs');
                                                                    current[i].answer = e.target.value;
                                                                    setJSON('contact_faqs', [...current]);
                                                                }} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                            <h3 className="font-bold text-gray-900 mb-4">Core Info (Used Site-wide)</h3>
                                            <div className="grid gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                                    <div className="relative">
                                                        <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                                        <input type="email" value={getVal('contact_email')} onChange={e => setVal('contact_email', e.target.value)} className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                                    <div className="relative">
                                                        <i className="ri-phone-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                                        <input type="text" value={getVal('contact_phone')} onChange={e => setVal('contact_phone', e.target.value)} className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Physical Address</label>
                                                    <div className="relative">
                                                        <i className="ri-map-pin-line absolute left-4 top-4 text-gray-400"></i>
                                                        <textarea value={getVal('contact_address')} onChange={e => setVal('contact_address', e.target.value)} rows={3} className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Homepage */}
                            {activeTab === 'home' && (
                                <div className="space-y-8">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <i className="ri-home-4-line text-blue-600"></i> Homepage Editor
                                    </h2>

                                    {/* Hero Section */}
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                        <h3 className="font-bold text-gray-900 mb-4">Hero Section</h3>
                                        <div className="grid gap-6">
                                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                                <div className="w-full md:w-1/3">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Background Image</label>
                                                    <div className="relative group aspect-video bg-white rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                                                        {homeHeroPreview || getVal('home_hero_image') ? (
                                                            <img src={homeHeroPreview || getVal('home_hero_image')} alt="Hero Preview" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="text-gray-400 text-center p-4">
                                                                <i className="ri-image-add-line text-3xl mb-1 block"></i>
                                                                <span className="text-xs">High resolution recommended</span>
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <label className="cursor-pointer bg-white text-gray-900 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-100">
                                                                Change Image
                                                                <input type="file" className="hidden" accept="image/*" onChange={handleHomeHeroChange} />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 grid gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Badge Text</label>
                                                        <input type="text" value={getVal('home_hero_badge')} onChange={e => setVal('home_hero_badge', e.target.value)} placeholder="100% Organic & Pure" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Main Title</label>
                                                        <input type="text" value={getVal('home_hero_title')} onChange={e => setVal('home_hero_title', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                                                        <p className="text-xs text-gray-400 mt-1">Tip: Use &lt;br /&gt; for line breaks.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Description</label>
                                                    <textarea value={getVal('home_hero_desc')} onChange={e => setVal('home_hero_desc', e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Primary CTA Text</label>
                                                        <input type="text" value={getVal('home_hero_cta_primary')} onChange={e => setVal('home_hero_cta_primary', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary CTA Text</label>
                                                        <input type="text" value={getVal('home_hero_cta_secondary')} onChange={e => setVal('home_hero_cta_secondary', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Benefits Section */}
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-gray-900">Benefits Grid</h3>
                                            <button
                                                onClick={() => {
                                                    const current = getJSON('home_benefits');
                                                    setJSON('home_benefits', [...current, { icon: 'ri-leaf-line', title: 'New Benefit', desc: 'Description of benefit' }]);
                                                }}
                                                className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
                                            >
                                                <i className="ri-add-line"></i> Add Benefit
                                            </button>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {getJSON('home_benefits').map((item: any, i: number) => (
                                                <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 relative group">
                                                    <button
                                                        onClick={() => {
                                                            const current = getJSON('home_benefits');
                                                            setJSON('home_benefits', current.filter((_: any, idx: number) => idx !== i));
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <i className="ri-delete-bin-line"></i>
                                                    </button>
                                                    <div className="grid gap-3">
                                                        <div className="flex gap-4">
                                                            <div className="w-1/3">
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Icon</label>
                                                                <input type="text" value={item.icon} onChange={e => {
                                                                    const current = getJSON('home_benefits');
                                                                    current[i].icon = e.target.value;
                                                                    setJSON('home_benefits', [...current]);
                                                                }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="ri-leaf-line" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                                                                <input type="text" value={item.title} onChange={e => {
                                                                    const current = getJSON('home_benefits');
                                                                    current[i].title = e.target.value;
                                                                    setJSON('home_benefits', [...current]);
                                                                }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                                            <input type="text" value={item.desc} onChange={e => {
                                                                const current = getJSON('home_benefits');
                                                                current[i].desc = e.target.value;
                                                                setJSON('home_benefits', [...current]);
                                                            }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Featured Section */}
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                        <h3 className="font-bold text-gray-900 mb-4">Featured Products Section</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Section Badge</label>
                                                <input type="text" value={getVal('home_featured_badge')} onChange={e => setVal('home_featured_badge', e.target.value)} placeholder="The Essentials" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">View All Link Text</label>
                                                <input type="text" value={getVal('home_featured_link')} onChange={e => setVal('home_featured_link', e.target.value)} placeholder="Shop All Products" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Main Title</label>
                                                <textarea value={getVal('home_featured_title')} onChange={e => setVal('home_featured_title', e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Testimonials */}
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-gray-900">Featured Testimonials</h3>
                                            <button
                                                onClick={() => {
                                                    const current = getJSON('home_testimonials');
                                                    setJSON('home_testimonials', [...current, { quote: '', author: '', role: 'Verified Buyer', image: '' }]);
                                                }}
                                                className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
                                            >
                                                <i className="ri-add-line"></i> Add Testimonial
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {getJSON('home_testimonials').map((t: any, i: number) => (
                                                <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 relative group">
                                                    <button
                                                        onClick={() => {
                                                            const current = getJSON('home_testimonials');
                                                            setJSON('home_testimonials', current.filter((_: any, idx: number) => idx !== i));
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <i className="ri-delete-bin-line"></i>
                                                    </button>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quote</label>
                                                            <textarea value={t.quote} onChange={e => {
                                                                const current = getJSON('home_testimonials');
                                                                current[i].quote = e.target.value;
                                                                setJSON('home_testimonials', [...current]);
                                                            }} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Author Name</label>
                                                            <input type="text" value={t.author} onChange={e => {
                                                                const current = getJSON('home_testimonials');
                                                                current[i].author = e.target.value;
                                                                setJSON('home_testimonials', [...current]);
                                                            }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role/Tag</label>
                                                            <input type="text" value={t.role} onChange={e => {
                                                                const current = getJSON('home_testimonials');
                                                                current[i].role = e.target.value;
                                                                setJSON('home_testimonials', [...current]);
                                                            }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
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

                            {/* About Section */}
                            {activeTab === 'about' && (
                                <div className="space-y-8">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <i className="ri-info-card-line text-blue-600"></i> About Us Section
                                    </h2>

                                    <div className="grid gap-6">
                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                            <h3 className="font-bold text-gray-900 mb-4">Hero Section</h3>
                                            <div className="grid gap-4">
                                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                                    <div className="w-full md:w-1/3">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Image</label>
                                                        <div className="relative group aspect-video bg-white rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                                                            {aboutHeroPreview || getVal('about_hero_image') ? (
                                                                <img src={aboutHeroPreview || getVal('about_hero_image')} alt="Hero Preview" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="text-gray-400 text-center p-4">
                                                                    <i className="ri-image-add-line text-3xl mb-1 block"></i>
                                                                    <span className="text-xs">16:9 Aspect Ratio recommended</span>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                <label className="cursor-pointer bg-white text-gray-900 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-100">
                                                                    Change
                                                                    <input type="file" className="hidden" accept="image/*" onChange={handleAboutHeroChange} />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 grid gap-4">
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Title</label>
                                                            <input type="text" value={getVal('about_hero_title')} onChange={e => setVal('about_hero_title', e.target.value)} placeholder="More Than Just A Pharmacy" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Description</label>
                                                            <textarea value={getVal('about_hero_subtitle')} onChange={e => setVal('about_hero_subtitle', e.target.value)} rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Establishment Year</label>
                                                            <input type="text" value={getVal('about_est_year')} onChange={e => setVal('about_est_year', e.target.value)} placeholder="2004" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                            <h3 className="font-bold text-gray-900 mb-4">Our Story</h3>
                                            <div className="grid gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Paragraph 1</label>
                                                    <textarea value={getVal('about_story_p1')} onChange={e => setVal('about_story_p1', e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Paragraph 2</label>
                                                    <textarea value={getVal('about_story_p2')} onChange={e => setVal('about_story_p2', e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Paragraph 3</label>
                                                    <textarea value={getVal('about_story_p3')} onChange={e => setVal('about_story_p3', e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Milestones Editor */}
                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-gray-900">Milestones / Journey</h3>
                                                <button
                                                    onClick={() => {
                                                        const current = getJSON('about_milestones');
                                                        setJSON('about_milestones', [...current, { year: '2025', title: 'New Milestone', description: 'Description here...' }]);
                                                    }}
                                                    className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
                                                >
                                                    <i className="ri-add-line"></i> Add Milestone
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {getJSON('about_milestones').map((m: any, i: number) => (
                                                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 relative group">
                                                        <button
                                                            onClick={() => {
                                                                const current = getJSON('about_milestones');
                                                                setJSON('about_milestones', current.filter((_: any, idx: number) => idx !== i));
                                                            }}
                                                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <i className="ri-delete-bin-line"></i>
                                                        </button>
                                                        <div className="grid md:grid-cols-4 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Year</label>
                                                                <input type="text" value={m.year} onChange={e => {
                                                                    const current = getJSON('about_milestones');
                                                                    current[i].year = e.target.value;
                                                                    setJSON('about_milestones', [...current]);
                                                                }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                                            </div>
                                                            <div className="md:col-span-3">
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                                                                <input type="text" value={m.title} onChange={e => {
                                                                    const current = getJSON('about_milestones');
                                                                    current[i].title = e.target.value;
                                                                    setJSON('about_milestones', [...current]);
                                                                }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                                            </div>
                                                            <div className="md:col-span-4">
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                                                <textarea value={m.description} onChange={e => {
                                                                    const current = getJSON('about_milestones');
                                                                    current[i].description = e.target.value;
                                                                    setJSON('about_milestones', [...current]);
                                                                }} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                            <h3 className="font-bold text-gray-900 mb-4">Mission & Vision</h3>
                                            <div className="grid gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mission Statement</label>
                                                    <textarea value={getVal('about_mission_text')} onChange={e => setVal('about_mission_text', e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Vision Statement</label>
                                                    <textarea value={getVal('about_vision_text')} onChange={e => setVal('about_vision_text', e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Core Values Editor */}
                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-gray-900">Core Values</h3>
                                                <button
                                                    onClick={() => {
                                                        const current = getJSON('about_core_values');
                                                        setJSON('about_core_values', [...current, { icon: 'ri-heart-line', title: 'New Value', description: 'Description here...', color: 'bg-brand-50 text-brand-600', borderColor: 'border-brand-100' }]);
                                                    }}
                                                    className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
                                                >
                                                    <i className="ri-add-line"></i> Add Value
                                                </button>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {getJSON('about_core_values').map((v: any, i: number) => (
                                                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 relative group">
                                                        <button
                                                            onClick={() => {
                                                                const current = getJSON('about_core_values');
                                                                setJSON('about_core_values', current.filter((_: any, idx: number) => idx !== i));
                                                            }}
                                                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <i className="ri-delete-bin-line"></i>
                                                        </button>
                                                        <div className="grid gap-3">
                                                            <div className="flex gap-3">
                                                                <div className="flex-1">
                                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Icon (Remix Icon)</label>
                                                                    <input type="text" value={v.icon} onChange={e => {
                                                                        const current = getJSON('about_core_values');
                                                                        current[i].icon = e.target.value;
                                                                        setJSON('about_core_values', [...current]);
                                                                    }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="ri-shield-line" />
                                                                </div>
                                                                <div className="w-10 h-10 mt-5 border border-gray-100 rounded-lg flex items-center justify-center bg-gray-50">
                                                                    <i className={`${v.icon} text-lg text-brand-600`}></i>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                                                                <input type="text" value={v.title} onChange={e => {
                                                                    const current = getJSON('about_core_values');
                                                                    current[i].title = e.target.value;
                                                                    setJSON('about_core_values', [...current]);
                                                                }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                                                <textarea value={v.description} onChange={e => {
                                                                    const current = getJSON('about_core_values');
                                                                    current[i].description = e.target.value;
                                                                    setJSON('about_core_values', [...current]);
                                                                }} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                            <h3 className="font-bold text-gray-900 mb-4">Founder Info</h3>
                                            <div className="grid gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Founder Name</label>
                                                    <input type="text" value={getVal('about_founder_name')} onChange={e => setVal('about_founder_name', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Founder Role</label>
                                                    <input type="text" value={getVal('about_founder_role')} onChange={e => setVal('about_founder_role', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Founder Quote</label>
                                                    <textarea value={getVal('about_founder_quote')} onChange={e => setVal('about_founder_quote', e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Services Editor */}
                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-gray-900">Services</h3>
                                                <button
                                                    onClick={() => {
                                                        const current = getJSON('about_services');
                                                        setJSON('about_services', [...current, { icon: 'ri-medicine-bottle-line', title: 'New Service', description: 'Description here...', features: ['Feature 1', 'Feature 2'] }]);
                                                    }}
                                                    className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
                                                >
                                                    <i className="ri-add-line"></i> Add Service
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {getJSON('about_services').map((s: any, i: number) => (
                                                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 relative group">
                                                        <button
                                                            onClick={() => {
                                                                const current = getJSON('about_services');
                                                                setJSON('about_services', current.filter((_: any, idx: number) => idx !== i));
                                                            }}
                                                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <i className="ri-delete-bin-line"></i>
                                                        </button>
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            <div className="grid gap-3">
                                                                <div className="flex gap-3">
                                                                    <div className="flex-1">
                                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Icon</label>
                                                                        <input type="text" value={s.icon} onChange={e => {
                                                                            const current = getJSON('about_services');
                                                                            current[i].icon = e.target.value;
                                                                            setJSON('about_services', [...current]);
                                                                        }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                                                    </div>
                                                                    <div className="w-10 h-10 mt-5 border border-gray-100 rounded-lg flex items-center justify-center bg-gray-50 text-brand-600">
                                                                        <i className={`${s.icon} text-lg`}></i>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                                                                    <input type="text" value={s.title} onChange={e => {
                                                                        const current = getJSON('about_services');
                                                                        current[i].title = e.target.value;
                                                                        setJSON('about_services', [...current]);
                                                                    }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                                                    <textarea value={s.description} onChange={e => {
                                                                        const current = getJSON('about_services');
                                                                        current[i].description = e.target.value;
                                                                        setJSON('about_services', [...current]);
                                                                    }} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Features (one per line)</label>
                                                                <textarea
                                                                    value={(s.features || []).join('\n')}
                                                                    onChange={e => {
                                                                        const current = getJSON('about_services');
                                                                        current[i].features = e.target.value.split('\n').filter(f => f.trim());
                                                                        setJSON('about_services', [...current]);
                                                                    }}
                                                                    rows={8}
                                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono resize-none"
                                                                    placeholder="Prescription Meds&#10;OTC Products..."
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
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

export default function SiteSettingsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-500">
                    <i className="ri-loader-4-line animate-spin text-2xl"></i>
                    <span>Loading...</span>
                </div>
            </div>
        }>
            <SettingsContent />
        </Suspense>
    );
}
