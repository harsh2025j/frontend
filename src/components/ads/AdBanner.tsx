import { Link } from '@/i18n/routing';
import React from 'react';

interface AdBannerProps {
    size?: 'large' | 'medium' | 'small';
    className?: string;
    imageUrl?: string;
    linkUrl?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ size = 'medium', className = '', imageUrl, linkUrl }) => {
    const heightClass = {
        large: 'h-[250px]',
        medium: 'h-[150px]',
        small: 'h-[90px]',
    }[size];

    const Content = () => (
        <>
            {imageUrl ? (

                <img
                    src={imageUrl}
                    alt="Advertisement"
                   
                    className="w-full h-full"
                />
            ) : (
                <>
                    <span className="text-xs font-semibold text-gray-400 absolute top-2 right-2 border border-gray-300 px-1 rounded z-10">AD</span>
                    <div className="text-center p-4">
                        <p className="text-gray-500 font-medium">Advertisement Space</p>
                        <p className="text-gray-400 text-sm mt-1">Place your ad here</p>
                    </div>
                </>
            )}

            {/* Placeholder pattern/gradient - show only if no image */}
            {!imageUrl && (
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>
            )}
        </>
    );

    const containerClasses = `w-full bg-gray-100 border border-gray-200 rounded-lg flex flex-col items-center justify-center overflow-hidden relative ${heightClass} ${className}`;

    if (linkUrl) {

        return (
            <Link href={linkUrl} className={`${containerClasses} block hover:opacity-95 transition-opacity`} target="_blank" rel="noopener noreferrer">
                <Content />
            </Link>
        );
    }

    return (
        <div className={containerClasses}>
            <Content />
        </div>
    );
};

export default AdBanner;
