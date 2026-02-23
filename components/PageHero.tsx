import React from 'react';

interface PageHeroProps {
    title: string;
    subtitle?: string;
    backgroundImage?: string | null;
}

export default function PageHero({ title, subtitle, backgroundImage }: PageHeroProps) {
    return (
        <div
            className="relative bg-brand-900 overflow-hidden"
            style={backgroundImage ? {
                backgroundImage: `linear-gradient(rgba(14, 45, 33, 0.85), rgba(14, 45, 33, 0.9)), url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            } : {}}
        >
            <div className="absolute inset-0 opacity-20">
                {!backgroundImage && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>}
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-in slide-in-from-bottom-4 duration-700">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-xl md:text-2xl text-brand-100 max-w-3xl mx-auto leading-relaxed animate-in slide-in-from-bottom-5 duration-700 delay-100">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}
