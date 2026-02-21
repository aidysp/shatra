import { Figure } from '@/entities/shatra/figure';
import { ShatraCell as Cell } from '@/entities';


export interface AnimatingFigure {
    figure: Figure;
    fromCell: Cell;
    toCell: Cell;
}


export interface CaptureChainState {
    animatingFigure: AnimatingFigure | null;


    forcedCaptureFigures: number[];


    isChainActive: boolean;
}