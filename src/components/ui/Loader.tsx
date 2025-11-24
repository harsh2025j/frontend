import React from 'react';
import { Scale } from 'lucide-react';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullScreen?: boolean;
}

export default function Loader({ size = 'md', text, fullScreen = false }: LoaderProps) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };

    const iconSizes = {
        sm: 16,
        md: 24,
        lg: 32,
    };

    const content = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
                {/* Outer rotating ring */}
                <div className="absolute inset-0 border-4 border-[#0A2342]/20 border-t-[#0A2342] rounded-full animate-spin"></div>

                {/* Inner Scale Icon */}
                <div className="relative z-10 text-orange-500 animate-pulse">
                    <Scale size={iconSizes[size]} strokeWidth={2.5} />
                </div>
            </div>

            {text && (
                <p className="text-[#0A2342] font-medium text-sm animate-pulse tracking-wide">
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                {content}
            </div>
        );
    }

    return content;
}
