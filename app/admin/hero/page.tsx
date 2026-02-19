'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface HeroSlide {
    id: string;
    title: string;
    subtitle: string;
    tag: string;
    image_url: string;
    video_url: string | null;
    cta_text: string;
    cta_link: string;
    sort_order: number;
    is_active: boolean;
}

export default function HeroManager() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<HeroSlide>>({
        title: '',
        subtitle: '',
        tag: '',
        image_url: '',
        video_url: '',
        cta_text: 'Shop Now',
        cta_link: '/shop',
        sort_order: 0,
        is_active: true
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const fetchSlides = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('hero_slides')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            console.error('Error fetching slides:', error);
        } else {
            setSlides(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchSlides();
    }, [fetchSlides]);

    const handleOpenModal = (slide?: HeroSlide) => {
        if (slide) {
            setEditingSlide(slide);
            setFormData(slide);
        } else {
            setEditingSlide(null);
            setFormData({
                title: '',
                subtitle: '',
                tag: 'New Arrival',
                image_url: '',
                video_url: '',
                cta_text: 'Shop Now',
                cta_link: '/shop',
                sort_order: slides.length,
                is_active: true
            });
        }
        setImageFile(null);
        setVideoFile(null);
        setIsModalOpen(true);
    };

    const uploadFile = async (file: File, path: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('hero-assets')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage.from('hero-assets').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            let imageUrl = formData.image_url;
            let videoUrl = formData.video_url;

            if (imageFile) {
                imageUrl = await uploadFile(imageFile, 'images');
            }

            if (videoFile) {
                videoUrl = await uploadFile(videoFile, 'videos');
            }

            const slideData = {
                ...formData,
                image_url: imageUrl,
                video_url: videoUrl,
            };

            if (editingSlide) {
                const { error } = await supabase
                    .from('hero_slides')
                    .update(slideData)
                    .eq('id', editingSlide.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('hero_slides')
                    .insert([slideData]);
                if (error) throw error;
            }

            setIsModalOpen(false);
            fetchSlides();
        } catch (error: any) {
            console.error('Error saving slide:', error);
            alert('Failed to save slide: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this slide?')) return;

        try {
            const { error } = await supabase.from('hero_slides').delete().eq('id', id);
            if (error) throw error;
            fetchSlides();
        } catch (error: any) {
            alert('Error deleting slide: ' + error.message);
        }
    };

    const toggleActive = async (slide: HeroSlide) => {
        try {
            const { error } = await supabase
                .from('hero_slides')
                .update({ is_active: !slide.is_active })
                .eq('id', slide.id);
            if (error) throw error;
            fetchSlides();
        } catch (error: any) {
            console.error('Error toggling status:', error);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading slides...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hero Slides</h1>
                    <p className="text-gray-500">Manage the homepage hero carousel</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2"
                >
                    <i className="ri-add-line"></i>
                    Add New Slide
                </button>
            </div>

            {slides.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-slideshow-line text-3xl text-gray-400"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No slides yet</h3>
                    <p className="text-gray-500 mb-6">Create your first slide to get started</p>
                    <button
                        onClick={() => handleOpenModal()}
                        className="text-brand-600 font-medium hover:text-brand-700 hover:underline"
                    >
                        Create Slide
                    </button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {slides.map((slide) => (
                        <div
                            key={slide.id}
                            className={`bg-white rounded-xl border ${slide.is_active ? 'border-gray-200' : 'border-gray-200 bg-gray-50 opacity-75'} shadow-sm overflow-hidden flex flex-col md:flex-row`}
                        >
                            {/* Thumbnail */}
                            <div className="w-full md:w-64 h-48 md:h-auto relative bg-gray-100 flex-shrink-0">
                                {slide.video_url ? (
                                    <video
                                        src={slide.video_url}
                                        className="w-full h-full object-cover"
                                        muted
                                        loop
                                        playsInline
                                    />
                                ) : (
                                    <img
                                        src={slide.image_url || '/placeholder.png'}
                                        alt={slide.title}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                    Order: {slide.sort_order}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-brand-50 text-brand-700 mb-2">
                                            {slide.tag || 'No Tag'}
                                        </span>
                                        <button
                                            onClick={() => toggleActive(slide)}
                                            className={`text-xs font-semibold px-2 py-1 rounded-full border ${slide.is_active
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-gray-100 text-gray-500 border-gray-200'
                                                }`}
                                        >
                                            {slide.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{slide.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{slide.subtitle}</p>
                                </div>

                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleOpenModal(slide)}
                                        className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
                                    >
                                        <i className="ri-edit-line"></i> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(slide.id)}
                                        className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1 ml-auto"
                                    >
                                        <i className="ri-delete-bin-line"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col z-10">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingSlide ? 'Edit Slide' : 'New Slide'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <i className="ri-close-line text-2xl"></i>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                                        <input
                                            type="text"
                                            value={formData.tag || ''}
                                            onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                            placeholder="e.g. New Arrival"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                                        <input
                                            type="number"
                                            value={formData.sort_order || 0}
                                            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                        />
                                    </div>

                                    <div className="col-span-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                                        <input
                                            type="text"
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                            placeholder="Main Heading"
                                            required
                                        />
                                    </div>

                                    <div className="col-span-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                                        <textarea
                                            value={formData.subtitle || ''}
                                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                            rows={3}
                                            placeholder="Supporting text..."
                                        />
                                    </div>

                                    {/* Image Upload */}
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Image (Background)</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) setImageFile(file);
                                                }}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="cursor-pointer"
                                            >
                                                {imageFile ? (
                                                    <div className="text-sm text-green-600 font-medium truncate">
                                                        {imageFile.name}
                                                    </div>
                                                ) : formData.image_url ? (
                                                    <div className="relative h-20 w-full">
                                                        <img src={formData.image_url} alt="Preview" className="h-full w-full object-cover rounded" />
                                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-xs opacity-0 hover:opacity-100 transition-opacity">Change</div>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-500">
                                                        <i className="ri-image-add-line text-2xl mb-1 block"></i>
                                                        <span className="text-xs">Click to upload image</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Video Upload */}
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Video (Optional)</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                                            <input
                                                type="file"
                                                ref={videoInputRef}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) setVideoFile(file);
                                                }}
                                                className="hidden"
                                                accept="video/*"
                                            />
                                            <div
                                                onClick={() => videoInputRef.current?.click()}
                                                className="cursor-pointer"
                                            >
                                                {videoFile ? (
                                                    <div className="text-sm text-green-600 font-medium truncate">
                                                        {videoFile.name}
                                                    </div>
                                                ) : formData.video_url ? (
                                                    <div className="relative h-20 w-full bg-black rounded">
                                                        <video src={formData.video_url} className="h-full w-full object-cover opacity-50" />
                                                        <div className="absolute inset-0 flex items-center justify-center text-white text-xs">Change Video</div>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-500">
                                                        <i className="ri-movie-line text-2xl mb-1 block"></i>
                                                        <span className="text-xs">Click to upload video</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                                        <input
                                            type="text"
                                            value={formData.cta_text || ''}
                                            onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                                        <input
                                            type="text"
                                            value={formData.cta_link || ''}
                                            onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                        />
                                    </div>

                                    <div className="col-span-full flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                                        />
                                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active (Visible on homepage)</label>
                                    </div>

                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {saving && <i className="ri-loader-4-line animate-spin"></i>}
                                        {saving ? 'Saving...' : 'Save Slide'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
