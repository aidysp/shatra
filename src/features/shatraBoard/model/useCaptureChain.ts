'use client'

import { useState, useCallback } from 'react';
import { CaptureChainState } from './useCaptureChain.types';
import { ShatraCell as Cell } from '@/entities';
import { Figure } from '@/entities/shatra/figure';

export const useCaptureChain = () => {
    const [state, setState] = useState<CaptureChainState>({
        animatingFigure: null,
        forcedCaptureFigures: [],
    });

    const startAnimation = useCallback((
        figure: Figure,
        fromCell: Cell,
        toCell: Cell
    ) => {
        setState(prev => ({
            ...prev,
            animatingFigure: { figure, fromCell, toCell },
            isChainActive: true
        }));
    }, []);


    const completeAnimation = useCallback(() => {
        setState(prev => ({
            ...prev,
            animatingFigure: null
        }));
    }, []);


    const updateForcedCaptures = useCallback((figureIds: number[]) => {
        setState(prev => ({
            ...prev,
            forcedCaptureFigures: figureIds
        }));
    }, []);



    const canFigureCapture = useCallback((cellId: number): boolean => {
        return state.forcedCaptureFigures.includes(cellId);
    }, [state.forcedCaptureFigures]);

    return {
        animatingFigure: state.animatingFigure,
        forcedCaptureFigures: state.forcedCaptureFigures,

        startAnimation,
        completeAnimation,
        updateForcedCaptures,
        canFigureCapture
    };
};