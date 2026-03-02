'use client'

import { createContext, ReactNode, useCallback, useContext, useState } from "react";

interface FlipBoardContextType {
    flipKey: number;
    handleFlip: () => void;
}

const FlipBoardContext = createContext<FlipBoardContextType | null>(null);

export const useFlipBoard = () => {
    const context = useContext(FlipBoardContext);

    if (!context) {
        throw new Error('useFlipBoard must be used within FlipBoardProvider');
    }

    return context;
}

export const FlipBoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [flipKey, setFlipKey] = useState(0);

    const handleFlip = useCallback(() => {
        setFlipKey(prev => prev + 1);
    }, []);

    const value = {
        flipKey,
        handleFlip
    }

    return (
        <FlipBoardContext.Provider value={value}>
            {children}
        </FlipBoardContext.Provider>
    )
}