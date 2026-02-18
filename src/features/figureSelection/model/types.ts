import { Figures, Player } from "@/entities";

export interface SelectedFigure {
    cellId: number;
    logicalX: number;
    logicalY: number;
    displayX: number;
    displayY: number;
    figureType: Figures | null;
    figureColor: Player;
}