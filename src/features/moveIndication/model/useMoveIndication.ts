import { GameState, ShatraBoard, ShatraCell } from "@/entities";
import { AvailableMove } from "@/shared/types/board";
import { useEffect, useState } from "react";



interface useMoveIndicationReturn {
    availableMoves: AvailableMove[];
    setAvailableMoves: (e: AvailableMove[]) => void;
};

interface useMoveIndicationProps {
    shatraBoard: ShatraBoard;
    setActiveCaptureFigure: (cell: ShatraCell | null) => void;
    setCaptureMoves: (e: AvailableMove[]) => void;
    selectFigure: (cell: ShatraCell, displayCoords: { x: number; y: number; }) => void;
    updateForcedCaptures: (figureIds: number[]) => void;
}


export const useMoveIndication = ({
    shatraBoard,
    setActiveCaptureFigure,
    setCaptureMoves,
    selectFigure,
    updateForcedCaptures
}: useMoveIndicationProps): useMoveIndicationReturn => {
    const [availableMoves, setAvailableMoves] = useState<AvailableMove[]>([]);



    useEffect(() => {
        if (shatraBoard.gameState === GameState.ACTIVE_CAPTURE_CHAIN ||
            shatraBoard.gameState === GameState.BIY_RIGHTS_ACTIVE) {
            const activeFigure = shatraBoard.getActiveCaptureFigure();
            setActiveCaptureFigure(activeFigure);

            if (activeFigure) {
                const moves = shatraBoard.getAvailableMoves(activeFigure);
                const normalMoves: AvailableMove[] = [];
                const captureMovesList: AvailableMove[] = [];

                moves.forEach(moveCell => {
                    const moveInfo: AvailableMove = {
                        cellId: moveCell.id,
                        x: moveCell.x,
                        y: moveCell.y,

                        isCapture: shatraBoard.isValidCaptureMove(activeFigure, moveCell)
                    };

                    if (moveInfo.isCapture) {
                        captureMovesList.push(moveInfo);
                    } else {
                        normalMoves.push(moveInfo);
                    }
                });


                setAvailableMoves(normalMoves);
                setCaptureMoves(captureMovesList);
                const displayCoords = shatraBoard.toDisplayCoords(activeFigure.x, activeFigure.y);
                selectFigure(activeFigure, displayCoords);
            }
        } else {
            setActiveCaptureFigure(null);
        }

        const forcedFigures = shatraBoard.getFiguresWithForcedCapture();
        const forcedFigureIds = forcedFigures.map(cell => cell.id);
        updateForcedCaptures(forcedFigureIds);
    }, [shatraBoard, updateForcedCaptures, setActiveCaptureFigure, setCaptureMoves, selectFigure]);


    return {
        availableMoves,
        setAvailableMoves
    }
}

