import React from 'react';

interface AdSidebarProps {
    className?: string;
}

const AdSidebar: React.FC<AdSidebarProps> = ({ className = '' }) => {
    return (
        <div className={`w-full aspect-square bg-gray-100 border border-gray-200 rounded-lg flex flex-col items-center justify-center overflow-hidden relative ${className}`}>
            <span className="text-xs font-semibold text-gray-400 absolute top-2 right-2 border border-gray-300 px-1 rounded">AD</span>
            <div className="text-center p-4">
                <p className="text-gray-500 font-medium">Sidebar Ad</p>
                <p className="text-gray-400 text-sm mt-1">300x250</p>
            </div>
            {/* Placeholder pattern/gradient */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}>
            </div>
        </div>
    );
};

export default AdSidebar;
