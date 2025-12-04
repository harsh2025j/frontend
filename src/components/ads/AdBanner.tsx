import React from 'react';

interface AdBannerProps {
    size?: 'large' | 'medium' | 'small';
    className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ size = 'medium', className = '' }) => {
    const heightClass = {
        large: 'h-[250px]',
        medium: 'h-[150px]',
        small: 'h-[90px]',
    }[size];

    return (
        <div className={`w-full bg-gray-100 border border-gray-200 rounded-lg flex flex-col items-center justify-center overflow-hidden relative ${heightClass} ${className}`}>
            <span className="text-xs font-semibold text-gray-400 absolute top-2 right-2 border border-gray-300 px-1 rounded">AD</span>
            <div className="text-center p-4">
                <p className="text-gray-500 font-medium">Advertisement Space</p>
                <p className="text-gray-400 text-sm mt-1">Place your ad here</p>
            </div>
            {/* Placeholder pattern/gradient */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
        </div>
    );
};

export default AdBanner;
