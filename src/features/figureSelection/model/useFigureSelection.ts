'use client'

import { useState, useCallback } from 'react';
import { SelectedFigure } from './types';
import { ShatraCell as Cell } from '@/entities';

export const useFigureSelection = () => {
    const [selectedCell, setSelectedCell] = useState<SelectedFigure | null>(null);

    const selectFigure = useCallback((cell: Cell, displayCoords: { x: number; y: number }) => {
        if (!cell.figure) return null;

        const selected: SelectedFigure = {
            cellId: cell.id,
            logicalX: cell.x,
            logicalY: cell.y,
            displayX: displayCoords.x,
            displayY: displayCoords.y,
            figureType: cell.figure.logo,
            figureColor: cell.figure.color
        };

        setSelectedCell(selected);
        return selected;
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedCell(null);
    }, []);

    return {
        selectedCell,
        selectFigure,
        clearSelection
    };
};