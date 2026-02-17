'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface CMSBlock {
    id: string;
    section: string;
    block_key: string;
    title: string | null;
    subtitle: string | null;
    content: string | null;
    image_url: string | null;
    button_text: string | null;
    button_url: string | null;
    metadata: Record<string, any>;
    sort_order: number;
    is_active: boolean;
}

type TabId = 'overview' | 'trust_badges' | 'services' | 'stats' | 'about' | 'cta' | 'sections';

const TABS: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'ri-layout-grid-line' },
    { id: 'trust_badges', label: 'Trust Badges', icon: 'ri-shield-check-line' },
    { id: 'services', label: 'Services', icon: 'ri-service-line' },
    { id: 'stats', label: 'Stats Counter', icon: 'ri-bar-chart-grouped-line' },
    { id: 'about', label: 'About Section', icon: 'ri-information-line' },
    { id: 'cta', label: 'CTA Banner', icon: 'ri-megaphone-line' },
    { id: 'sections', label: 'Section Headers', icon: 'ri-text' },
];

export default function HomepageConfigPage() {
    const [blocks, setBlocks] = useState<CMSBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
    const [editModal, setEditModal] = useState<CMSBlock | null>(null);
    const [formData, setFormData] = useState<Partial<CMSBlock>>({});

    const fetchBlocks = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('cms_content')
                .select('*')
                .eq('section', 'homepage')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            setBlocks(data || []);
        } catch (err) {
            console.error('Error fetching blocks:', err);
            showToast('error', 'Failed to load content');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBlocks();
    }, [fetchBlocks]);

    const showToast = (type: string, message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const getBlocksByPrefix = (prefix: string) =>
        blocks.filter(b => b.block_key.startsWith(prefix)).sort((a, b) => a.sort_order - b.sort_order);

    const openEdit = (block: CMSBlock) => {
        setFormData({ ...block });
        setEditModal(block);
    };

    const saveBlock = async () => {
        if (!editModal) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('cms_content')
                .update({
                    title: formData.title,
                    subtitle: formData.subtitle,
                    content: formData.content,
                    image_url: formData.image_url,
                    button_text: formData.button_text,
                    button_url: formData.button_url,
                    metadata: formData.metadata,
                    is_active: formData.is_active,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', editModal.id);

            if (error) throw error;

            showToast('success', 'Content updated successfully!');
            setEditModal(null);
            fetchBlocks();
        } catch (err: any) {
            console.error('Error saving:', err);
            showToast('error', err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (block: CMSBlock) => {
        try {
            const { error } = await supabase
                .from('cms_content')
                .update({ is_active: !block.is_active, updated_at: new Date().toISOString() })
                .eq('id', block.id);

            if (error) throw error;
            fetchBlocks();
            showToast('success', `${block.title || block.block_key} ${block.is_active ? 'hidden' : 'shown'}`);
        } catch (err) {
            console.error(err);
        }
    };

    const updateMetadataField = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            metadata: { ...(prev.metadata || {}), [key]: value },
        }));
    };

    // Reusable block card component
    const BlockCard = ({ block, showContent = true }: { block: CMSBlock; showContent?: boolean }) => (
        <div className={`bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md ${block.is_active ? 'border-gray-200' : 'border-red-200 opacity-60'}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {block.metadata?.icon && <i className={`${block.metadata.icon} text-xl text-blue-600`}></i>}
                    <h4 className="font-bold text-gray-900 text-sm">{block.title || block.block_key}</h4>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(block)} title={block.is_active ? 'Hide' : 'Show'}>
                        <i className={`${block.is_active ? 'ri-eye-line text-green-600' : 'ri-eye-off-line text-red-500'} text-lg`}></i>
                    </button>
                    <button
                        onClick={() => openEdit(block)}
                        className="w-8 h-8 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors"
                    >
                        <i className="ri-edit-line text-blue-600"></i>
                    </button>
                </div>
            </div>
            {block.subtitle && <p className="text-xs text-gray-500 mb-1">{block.subtitle}</p>}
            {showContent && block.content && <p className="text-xs text-gray-400 line-clamp-2">{block.content}</p>}
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-500">
                    <i className="ri-loader-4-line animate-spin text-2xl"></i>
                    <span>Loading homepage config...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl text-white font-medium flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    <i className={toast.type === 'success' ? 'ri-check-line text-lg' : 'ri-error-warning-line text-lg'}></i>
                    {toast.message}
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Homepage Config</h1>
                        <p className="text-gray-500 mt-1">Manage every section of your homepage</p>
                    </div>
                    <Link
                        href="/admin/hero"
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-600/20"
                    >
                        <i className="ri-slideshow-line"></i> Manage Hero Slides
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <i className={tab.icon}></i> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                                <h2 className="text-2xl font-bold mb-2">Homepage Content Manager</h2>
                                <p className="text-white/70 mb-6">Control every section of your homepage from here. Click on any tab to edit the content.</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Trust Badges', count: getBlocksByPrefix('trust_badge_').length, tab: 'trust_badges' as TabId },
                                        { label: 'Services', count: getBlocksByPrefix('service_').length, tab: 'services' as TabId },
                                        { label: 'Stats', count: getBlocksByPrefix('stat_').length, tab: 'stats' as TabId },
                                        { label: 'About Items', count: getBlocksByPrefix('about_value_').length, tab: 'about' as TabId },
                                    ].map(item => (
                                        <button key={item.label} onClick={() => setActiveTab(item.tab)} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left hover:bg-white/20 transition-all border border-white/10">
                                            <p className="text-3xl font-black">{item.count}</p>
                                            <p className="text-sm text-white/70">{item.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quick sections overview */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    { title: 'Hero Slides', desc: 'Manage hero carousel', icon: 'ri-slideshow-line', link: '/admin/hero', color: 'purple' },
                                    { title: 'Site Settings', desc: 'Branding, contact, social', icon: 'ri-settings-3-line', link: '/admin/settings', color: 'blue' },
                                ].map(card => (
                                    <Link key={card.title} href={card.link} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 bg-${card.color}-100 rounded-xl flex items-center justify-center`}>
                                                <i className={`${card.icon} text-2xl text-${card.color}-600`}></i>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900">{card.title}</h3>
                                                <p className="text-sm text-gray-500">{card.desc}</p>
                                            </div>
                                            <i className="ri-arrow-right-line text-gray-400 group-hover:text-blue-600 transition-colors"></i>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trust Badges */}
                    {activeTab === 'trust_badges' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">Trust Badges</h2>
                            <p className="text-sm text-gray-500 mb-6">The trust badges shown below the hero section</p>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {getBlocksByPrefix('trust_badge_').map(block => (
                                    <BlockCard key={block.id} block={block} showContent={false} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Services */}
                    {activeTab === 'services' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">Services Section</h2>
                            <p className="text-sm text-gray-500 mb-6">The four service cards on the homepage</p>

                            {/* Section Header */}
                            {blocks.find(b => b.block_key === 'services_header') && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Section Header</h3>
                                    <BlockCard block={blocks.find(b => b.block_key === 'services_header')!} />
                                </div>
                            )}

                            <h3 className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Service Cards</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {getBlocksByPrefix('service_').filter(b => b.block_key !== 'services_header').map(block => (
                                    <BlockCard key={block.id} block={block} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    {activeTab === 'stats' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">Stats / Counter Section</h2>
                            <p className="text-sm text-gray-500 mb-6">The statistics counter section with numbers</p>

                            {blocks.find(b => b.block_key === 'stats_header') && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Section Header</h3>
                                    <BlockCard block={blocks.find(b => b.block_key === 'stats_header')!} />
                                </div>
                            )}

                            <h3 className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Stat Items</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {getBlocksByPrefix('stat_').filter(b => b.block_key !== 'stats_header').map(block => (
                                    <div key={block.id} className="bg-white rounded-xl border-2 border-gray-200 p-5 text-center hover:shadow-md transition-all">
                                        <p className="text-3xl font-black text-blue-600 mb-1">{block.title}{block.metadata?.suffix || ''}</p>
                                        <p className="text-sm text-gray-600 mb-3">{block.subtitle}</p>
                                        <button onClick={() => openEdit(block)} className="text-xs text-blue-600 font-semibold hover:underline">
                                            <i className="ri-edit-line"></i> Edit
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* About Section */}
                    {activeTab === 'about' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">About / Why Choose Us</h2>
                            <p className="text-sm text-gray-500 mb-6">The &ldquo;Why Choose WIDAMA&rdquo; section</p>

                            {blocks.find(b => b.block_key === 'about_header') && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Section Header</h3>
                                    <BlockCard block={blocks.find(b => b.block_key === 'about_header')!} />
                                </div>
                            )}
                            {blocks.find(b => b.block_key === 'about_card') && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Feature Card</h3>
                                    <BlockCard block={blocks.find(b => b.block_key === 'about_card')!} />
                                </div>
                            )}

                            <h3 className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Value Propositions</h3>
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                {getBlocksByPrefix('about_value_').map(block => (
                                    <BlockCard key={block.id} block={block} />
                                ))}
                            </div>

                            {blocks.find(b => b.block_key === 'about_testimonial') && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Testimonial</h3>
                                    <BlockCard block={blocks.find(b => b.block_key === 'about_testimonial')!} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* CTA Banner */}
                    {activeTab === 'cta' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">Call-to-Action Banner</h2>
                            <p className="text-sm text-gray-500 mb-6">The bottom CTA section before the newsletter</p>
                            {blocks.find(b => b.block_key === 'cta_banner') && (
                                <BlockCard block={blocks.find(b => b.block_key === 'cta_banner')!} />
                            )}
                        </div>
                    )}

                    {/* Section Headers */}
                    {activeTab === 'sections' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">Section Headers</h2>
                            <p className="text-sm text-gray-500 mb-6">Manage the titles and subtitles for each homepage section</p>
                            <div className="grid gap-4">
                                {['products_header', 'categories_header', 'newsletter'].map(key => {
                                    const block = blocks.find(b => b.block_key === key);
                                    return block ? <BlockCard key={block.id} block={block} /> : null;
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">
                                Edit: {editModal.title || editModal.block_key}
                            </h3>
                            <button onClick={() => setEditModal(null)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center">
                                <i className="ri-close-line text-lg"></i>
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title || ''}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Subtitle</label>
                                <input
                                    type="text"
                                    value={formData.subtitle || ''}
                                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Content / Description</label>
                                <textarea
                                    value={formData.content || ''}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Button Text</label>
                                    <input
                                        type="text"
                                        value={formData.button_text || ''}
                                        onChange={e => setFormData({ ...formData, button_text: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Button URL</label>
                                    <input
                                        type="text"
                                        value={formData.button_url || ''}
                                        onChange={e => setFormData({ ...formData, button_url: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Icon Class (Remix Icon)</label>
                                <input
                                    type="text"
                                    value={formData.metadata?.icon || ''}
                                    onChange={e => updateMetadataField('icon', e.target.value)}
                                    placeholder="e.g. ri-shield-check-line"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Browse icons at <a href="https://remixicon.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">remixicon.com</a>
                                </p>
                            </div>

                            {(editModal.block_key.startsWith('stat_') && !editModal.block_key.includes('header')) && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Suffix (e.g. &quot;+&quot;)</label>
                                    <input
                                        type="text"
                                        value={formData.metadata?.suffix || ''}
                                        onChange={e => updateMetadataField('suffix', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            )}

                            {editModal.block_key.includes('header') && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tag / Label</label>
                                    <input
                                        type="text"
                                        value={formData.metadata?.tag || ''}
                                        onChange={e => updateMetadataField('tag', e.target.value)}
                                        placeholder="e.g. What We Do"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_active ? 'bg-green-600' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm text-gray-700 font-medium">{formData.is_active ? 'Visible' : 'Hidden'}</span>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
                            <button onClick={() => setEditModal(null)} className="px-5 py-2.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={saveBlock}
                                disabled={saving}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
                            >
                                {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-line"></i>}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
