import { ShatraBoard, ShatraCell } from "@/entities";
import { Figure } from "@/entities/shatra/figure";
import { SelectedFigure } from "./useFigureSelection.types";
import { findNearestCellId } from "@/shared/lib/board";
import { AvailableMove } from "@/shared/types/board";
import { KonvaEventObject } from "konva/lib/Node";


interface useBoardClickReturn {
    handleStageClick: (e: KonvaEventObject<MouseEvent>) => void;
    getCellsWithDisplay: () => Array<{ id: number; x: number; y: number; displayX: number; displayY: number }>;
}

interface useBoardClickProps {
    shatraBoard: ShatraBoard;
    startAnimation: (figure: Figure, fromCell: ShatraCell, toCell: ShatraCell) => void;
    setAvailableMoves: (e: AvailableMove[]) => void;
    setCaptureMoves: (e: AvailableMove[]) => void;
    clearSelection: () => void;
    setHoveredCell: (e: { x: number, y: number } | null) => void;
    activeCaptureFigure: ShatraCell | null;
    captureMoves: AvailableMove[];
    selectedCell: SelectedFigure | null;
    selectFigure: (cell: ShatraCell, displayCoords: { x: number; y: number }) => void;
    availableMoves: AvailableMove[];

}

export const useBoardClick = ({
    shatraBoard,
    startAnimation,
    setAvailableMoves,
    setCaptureMoves,
    clearSelection,
    setHoveredCell,
    activeCaptureFigure,
    captureMoves,
    selectedCell,
    selectFigure,
    availableMoves
}: useBoardClickProps): useBoardClickReturn => {

    const getCellsWithDisplay = () => {
        return shatraBoard.getCells.map((cell: ShatraCell) => ({
            id: cell.id,
            x: cell.x,
            y: cell.y,
            displayX: shatraBoard.toDisplayCoords(cell.x, cell.y).x,
            displayY: shatraBoard.toDisplayCoords(cell.x, cell.y).y
        }));
    };



    const performMoveWithAnimation = (from: ShatraCell, to: ShatraCell) => {

        if (!shatraBoard.isValidMove(from, to)) {
            return;
        }

        startAnimation(from.figure!, from, to);
        shatraBoard.recordMove(from, to);

        setAvailableMoves([]);
        setCaptureMoves([]);
        clearSelection();
        setHoveredCell(null);
    }

    const handleCellClick = (cell: ShatraCell) => {

        if (activeCaptureFigure) {
            const isAvailableForActiveFigure = captureMoves.some(move =>
                move.x === cell.x && move.y === cell.y
            );

            if (isAvailableForActiveFigure) {
                performMoveWithAnimation(activeCaptureFigure, cell);
                return;
            }

        }


        if (selectedCell?.cellId === cell.id) {
            clearSelection();
            setHoveredCell(null);
            setAvailableMoves([]);
            setCaptureMoves([]);
            return;
        }


        if (cell.figure && cell.figure.color === shatraBoard.currentPlayer) {

            const displayCoords = shatraBoard.toDisplayCoords(cell.x, cell.y);
            selectFigure(cell, displayCoords);

            const moves = shatraBoard.getAvailableMoves(cell);
            const normalMoves: AvailableMove[] = [];
            const captureMovesList: AvailableMove[] = [];

            moves.forEach(moveCell => {

                const moveInfo: AvailableMove = {
                    cellId: moveCell.id,
                    x: moveCell.x,
                    y: moveCell.y,
                    isCapture: shatraBoard.isValidCaptureMove(cell, moveCell)
                };

                normalMoves.push(moveInfo);
                if (moveInfo.isCapture) {
                    captureMovesList.push(moveInfo);
                }
            });
            setAvailableMoves(normalMoves);
            setCaptureMoves(captureMovesList);




            return;
        }

        if (selectedCell) {
            const isAvailableMove = availableMoves.some(move =>
                move.x === cell.x && move.y === cell.y
            );

            const fromCell = shatraBoard.getCellById(selectedCell.cellId);

            if (isAvailableMove && fromCell) {
                performMoveWithAnimation(fromCell, cell);
                return;
            }
        }


        clearSelection();
        setHoveredCell(null);
        setAvailableMoves([]);
        setCaptureMoves([]);

    };


    const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        const cellsWithDisplay = getCellsWithDisplay();
        const cellId = findNearestCellId(pos.x, pos.y, cellsWithDisplay);
        const clickedCell = shatraBoard.getCellById(cellId!);

        if (!clickedCell) {
            clearSelection();
            setHoveredCell(null);
            setAvailableMoves([]);
            setCaptureMoves([]);
            return;
        }

        handleCellClick(clickedCell);
    };

    return {
        handleStageClick,
        getCellsWithDisplay
    }
}