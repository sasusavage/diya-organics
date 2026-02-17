'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface SiteSettings {
    site_name: string;
    site_tagline: string;
    site_logo: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    social_facebook: string;
    social_instagram: string;
    social_twitter: string;
    social_tiktok: string;
    social_snapchat: string;
    social_youtube: string;
    social_whatsapp: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    currency: string;
    currency_symbol: string;
    footer_copyright: string;
    footer_description: string;
    footer_cta_title: string;
    footer_cta_subtitle: string;
    payment_methods: string;
    [key: string]: string;
}

interface CMSContent {
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

interface Banner {
    id: string;
    name: string;
    type: string;
    title: string | null;
    subtitle: string | null;
    image_url: string | null;
    background_color: string;
    text_color: string;
    button_text: string | null;
    button_url: string | null;
    is_active: boolean;
    position: string;
    start_date: string | null;
    end_date: string | null;
}

interface CMSContextType {
    settings: SiteSettings;
    content: CMSContent[];
    banners: Banner[];
    loading: boolean;
    getContent: (section: string, blockKey: string) => CMSContent | undefined;
    getContentList: (section: string, blockKeyPrefix: string) => CMSContent[];
    getSetting: (key: string) => string;
    getSettingJSON: (key: string) => any;
    getActiveBanners: (position?: string) => Banner[];
    refreshCMS: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
    site_name: 'WIDAMA Pharmacy',
    site_tagline: 'Quality Medicines & Healthcare Services Since 2004',
    site_logo: '/logo.png',
    contact_email: 'info@widamapharmacy.com',
    contact_phone: '+233 XX XXX XXXX',
    contact_address: 'WIDAMA Towers, Ashaiman Lebanon, Ghana',
    social_facebook: '',
    social_instagram: '',
    social_twitter: '',
    social_tiktok: '',
    social_snapchat: '',
    social_youtube: '',
    social_whatsapp: '',
    primary_color: '#0D6B4E',
    secondary_color: '#D4A853',
    accent_color: '#1a8f6e',
    currency: 'GHS',
    currency_symbol: 'GH₵',
    footer_copyright: 'All rights reserved. Licensed Pharmacy — WIDAMA Towers, Ashaiman Lebanon, Ghana.',
    footer_description: 'Your trusted healthcare partner since 2004. Quality medicines, wholesale distribution, manufacturing, and professional training — all under one roof.',
    footer_cta_title: 'Need Pharmaceutical Advice?',
    footer_cta_subtitle: 'Our licensed pharmacists are here to help.',
    payment_methods: '["Mobile Money", "Card"]',
};

const CMSContext = createContext<CMSContextType>({
    settings: defaultSettings,
    content: [],
    banners: [],
    loading: true,
    getContent: () => undefined,
    getContentList: () => [],
    getSetting: () => '',
    getSettingJSON: () => null,
    getActiveBanners: () => [],
    refreshCMS: async () => { },
});

export function CMSProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [content, setContent] = useState<CMSContent[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCMSData = useCallback(async () => {
        try {
            // Fetch site settings
            const { data: settingsData, error: settingsError } = await supabase
                .from('site_settings')
                .select('key, value');

            if (settingsError) {
                console.error('CMS: Error fetching settings:', settingsError);
            } else if (settingsData && settingsData.length > 0) {
                const settingsObj: Record<string, string> = {};
                settingsData.forEach((row: any) => {
                    // value is stored as JSONB, so it might be a string, array, etc.
                    const val = row.value;
                    settingsObj[row.key] = typeof val === 'string' ? val : JSON.stringify(val);
                });
                setSettings(prev => ({ ...prev, ...settingsObj }));
            }

            // Fetch CMS content blocks
            const { data: contentData, error: contentError } = await supabase
                .from('cms_content')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            if (contentError) {
                console.error('CMS: Error fetching content:', contentError);
            } else if (contentData) {
                setContent(contentData);
            }

            // Fetch banners
            const { data: bannersData, error: bannersError } = await supabase
                .from('banners')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            if (bannersError) {
                console.error('CMS: Error fetching banners:', bannersError);
            } else if (bannersData) {
                setBanners(bannersData);
            }

        } catch (err) {
            console.error('CMS: Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCMSData();
    }, [fetchCMSData]);

    const getContent = (section: string, blockKey: string): CMSContent | undefined => {
        return content.find(c => c.section === section && c.block_key === blockKey);
    };

    const getContentList = (section: string, blockKeyPrefix: string): CMSContent[] => {
        return content
            .filter(c => c.section === section && c.block_key.startsWith(blockKeyPrefix))
            .sort((a, b) => a.sort_order - b.sort_order);
    };

    const getSetting = (key: string): string => {
        const val = settings[key] || defaultSettings[key] || '';
        // Strip surrounding quotes if JSONB stored as a quoted string
        if (typeof val === 'string' && val.startsWith('"') && val.endsWith('"')) {
            return val.slice(1, -1);
        }
        return val;
    };

    const getSettingJSON = (key: string): any => {
        const val = settings[key] || defaultSettings[key] || '';
        try {
            return JSON.parse(val);
        } catch {
            return val;
        }
    };

    const getActiveBanners = (position?: string): Banner[] => {
        const now = new Date();
        return banners.filter(b => {
            if (position && b.position !== position) return false;
            if (b.start_date && new Date(b.start_date) > now) return false;
            if (b.end_date && new Date(b.end_date) < now) return false;
            return b.is_active;
        });
    };

    return (
        <CMSContext.Provider
            value={{
                settings,
                content,
                banners,
                loading,
                getContent,
                getContentList,
                getSetting,
                getSettingJSON,
                getActiveBanners,
                refreshCMS: fetchCMSData,
            }}
        >
            {children}
        </CMSContext.Provider>
    );
}

export function useCMS() {
    const context = useContext(CMSContext);
    if (!context) {
        throw new Error('useCMS must be used within a CMSProvider');
    }
    return context;
}

export default CMSContext;
