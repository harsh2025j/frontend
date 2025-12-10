import { Link } from '@/i18n/routing';
import NextImage from 'next/image';
import React from 'react';

interface AdSidebarProps {
    className?: string;
    imageUrl?: string;
    linkUrl?: string;
}

const AdSidebar: React.FC<AdSidebarProps> = ({ className = '', imageUrl, linkUrl }) => {

    const Content = () => (
        <>
            {imageUrl ? (
                <NextImage
                    src={imageUrl}
                    alt="Sidebar Advertisement"
                    fill
                className="object-cover"
                />
            ) : (
                <>
                    <span className="text-xs font-semibold text-gray-400 absolute top-2 right-2 border border-gray-300 px-1 rounded z-10">AD</span>
                    <div className="text-center p-4">
                        <p className="text-gray-500 font-medium">Sidebar Ad</p>
                        <p className="text-gray-400 text-sm mt-1">300x250</p>
                    </div>
                </>
            )}

            {/* Placeholder pattern/gradient - show only if no image */}
            {!imageUrl && (
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}>
                </div>
            )}
        </>
    );

    const containerClasses = `w-full aspect-square bg-gray-100 border border-gray-200 rounded-lg flex flex-col items-center justify-center overflow-hidden relative ${className}`;

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

export default AdSidebar;
