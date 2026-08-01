"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Margins {
    marginLeft: number;
    marginRight: number;
    textIndent: number;
}

interface DocumentRulerProps {
    marginLeft: number;
    marginRight: number;
    textIndent: number;
    onChange: (margins: Partial<Margins>) => void;
}

const DocumentRuler: React.FC<DocumentRulerProps> = ({ marginLeft, marginRight, textIndent, onChange }) => {
    const rulerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState<string | null>(null);
    const [localMargins, setLocalMargins] = useState<Margins | null>(null);
    const localMarginsRef = useRef<Margins | null>(null);

    const activeMargins = isDragging && localMargins ? localMargins : { marginLeft, marginRight, textIndent };

    const handlePointerDown = (e: React.PointerEvent, type: string) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(type);
        const initial = { marginLeft, marginRight, textIndent };
        setLocalMargins(initial);
        localMarginsRef.current = initial;
    };

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!isDragging || !rulerRef.current || !localMarginsRef.current) return;

        const rect = rulerRef.current.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let percent = (x / rect.width) * 100;

        percent = Math.max(0, Math.min(100, percent));

        const currentMargins = localMarginsRef.current;
        const newMargins = { ...currentMargins };

        if (isDragging === 'marginLeft') {
            // Cap left margin to a maximum of 60%, and ensure it doesn't overlap the right margin
            const newMl = Math.min(percent, 60, 100 - currentMargins.marginRight - 1);
            newMargins.marginLeft = newMl;
            setLocalMargins(newMargins);
            localMarginsRef.current = newMargins;
            onChange({ marginLeft: newMl });
        } else if (isDragging === 'marginRight') {
            const newMr = Math.min(100 - percent, 100 - currentMargins.marginLeft - 1);
            newMargins.marginRight = newMr;
            setLocalMargins(newMargins);
            localMarginsRef.current = newMargins;
            onChange({ marginRight: newMr });
        } else if (isDragging === 'textIndent') {
            // Cap top arrow's absolute position to a maximum of 60%, and ensure it doesn't overlap the right margin
            const absolutePercent = Math.min(percent, 60, 100 - currentMargins.marginRight - 1);
            const newTi = absolutePercent - currentMargins.marginLeft;
            newMargins.textIndent = newTi;
            setLocalMargins(newMargins);
            localMarginsRef.current = newMargins;
            onChange({ textIndent: newTi });
        }
    }, [isDragging, onChange]);

    const handlePointerUp = useCallback(() => {
        setIsDragging(null);
        setLocalMargins(null);
        localMarginsRef.current = null;
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
        }
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isDragging, handlePointerMove, handlePointerUp]);

    const renderTicks = () => {
        const ticks = [];
        for (let i = 0; i <= 100; i++) {
            const isMajor = i % 10 === 0;
            const isMedium = i % 5 === 0 && !isMajor;
            ticks.push(
                <div
                    key={i}
                    className={`absolute bottom-0 border-l border-[#c4c7c5] ${isMajor ? 'h-3' : isMedium ? 'h-2' : 'h-1.5'}`}
                    style={{ left: `${i}%` }}
                >
                    {isMajor && i > 0 && i < 100 && (
                        <span className="absolute -top-4 -translate-x-1/2 text-[10px] text-[#444746] font-sans select-none pointer-events-none">
                            {i}
                        </span>
                    )}
                </div>
            );
        }
        return ticks;
    };

    return (
        <div
            ref={rulerRef}
            className="w-full h-6 relative bg-white touch-none"
            style={{ cursor: isDragging ? 'ew-resize' : 'default' }}
        >
            {renderTicks()}

            {/* Right Margin Marker (Triangle pointing down) */}
            <div
                className="absolute top-0 w-3 h-3 -translate-x-1/2 cursor-ew-resize z-10"
                style={{ left: `${100 - activeMargins.marginRight}%` }}
                onPointerDown={(e) => handlePointerDown(e, 'marginRight')}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full fill-blue-500 drop-shadow-sm">
                    <polygon points="0,0 100,0 50,100" />
                </svg>
            </div>

            {/* First Line Indent (Top Triangle pointing down) */}
            <div
                className="absolute top-0 w-3 h-3 -translate-x-1/2 cursor-ew-resize z-10"
                style={{ left: `${activeMargins.marginLeft + activeMargins.textIndent}%` }}
                onPointerDown={(e) => handlePointerDown(e, 'textIndent')}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full fill-blue-500 drop-shadow-sm">
                    <polygon points="0,0 100,0 50,100" />
                </svg>
            </div>

            {/* Left Margin (Bottom Triangle pointing up) */}
            <div
                className="absolute bottom-0 w-3 h-3 -translate-x-1/2 cursor-ew-resize z-10"
                style={{ left: `${activeMargins.marginLeft}%` }}
                onPointerDown={(e) => handlePointerDown(e, 'marginLeft')}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full fill-blue-500 drop-shadow-sm">
                    <polygon points="50,0 100,100 0,100" />
                </svg>
            </div>
        </div>
    );
};

export default DocumentRuler;
