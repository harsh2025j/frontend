"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface AdContextType {
    hasSeenAd: boolean;
    markAdAsSeen: () => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider = ({ children }: { children: ReactNode }) => {
    const [hasSeenAd, setHasSeenAd] = useState(false);

    const markAdAsSeen = () => {
        setHasSeenAd(true);
    };

    const value = React.useMemo(() => ({ hasSeenAd, markAdAsSeen }), [hasSeenAd]);

    return (
        <AdContext.Provider value={value}>
            {children}
        </AdContext.Provider>
    );
};

export const useAdContext = () => {
    const context = useContext(AdContext);
    if (!context) {
        throw new Error("useAdContext must be used within an AdProvider");
    }
    return context;
};
