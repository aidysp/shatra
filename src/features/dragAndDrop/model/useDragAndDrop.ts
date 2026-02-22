import { useRef, useState } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import { Layer as KonvaLayer } from 'konva/lib/Layer';

import { GameState, ShatraBoard, ShatraCell } from "@/entities";
import { Biy, Figure } from "@/entities/shatra/figure";
import { SelectedFigure } from "@/features/figureSelection";
import { CELL_SIZE, findNearestCellId } from "@/shared/lib/board";
import { AvailableMove } from "@/shared/types/board";



interface UseDragAndDropProps {
    shatraBoard: ShatraBoard;
    availableMoves: AvailableMove[];
    setAvailableMoves: (e: AvailableMove[]) => void;
    captureMoves: AvailableMove[];
    setCaptureMoves: (e: AvailableMove[]) => void;
    setShatraBoard: (board: ShatraBoard) => void;
    selectedCell: SelectedFigure | null;
    hoveredCell: { x: number, y: number } | null;
    setHoveredCell: (cell: { x: number, y: number } | null) => void;
    clearSelection: () => void;
    setLastMove: (move: { from: ShatraCell | null; to: ShatraCell | null }) => void;
    getCellsWithDisplay: () => {
        id: number,
        x: number,
        y: number,
        displayX: number,
        displayY: number
    }[];
    playMoveSound: () => void;
}

interface UseDragAndDropReturn {
    createDragStartHandler: (cellId: number, figure: Figure | null | undefined, logicalX: number, logicalY: number) => (e: KonvaEventObject<DragEvent>) => void;
    handleDragEnd: (e: KonvaEventObject<MouseEvent>) => void;
    handleDragMove: (e: KonvaEventObject<DragEvent>) => void;
    handleMouseMove: (e: KonvaEventObject<MouseEvent>) => void;
    setDraggedPiece: (e: DraggedPiece | null) => void;
    tempLayerRef: React.RefObject<KonvaLayer | null>;
    hoveredCell: { x: number; y: number } | null;
}

interface DraggedPiece {
    cellId: number;
    figure: Figure | null | undefined;
    originalX: number;
    originalY: number;
}




export const useDragAndDrop = ({
    shatraBoard,
    availableMoves,
    setAvailableMoves,
    captureMoves,
    setCaptureMoves,
    setShatraBoard,
    selectedCell,
    hoveredCell,
    setHoveredCell,
    clearSelection,
    setLastMove,
    getCellsWithDisplay,
    playMoveSound
}: UseDragAndDropProps): UseDragAndDropReturn => {

    const tempLayerRef = useRef<KonvaLayer>(null);

    const [draggedPiece, setDraggedPiece] = useState<DraggedPiece | null>(null);


    const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {

        if (!selectedCell) return;

        const stage = e.target.getStage();
        const pos = stage?.getPointerPosition();

        if (!pos) return;

        const cellsWithDisplay = getCellsWithDisplay();
        const cellId = findNearestCellId(pos.x, pos.y, cellsWithDisplay);
        const nearestCell = shatraBoard.getCellById(cellId!);

        if (nearestCell) {

            const isAvailable = availableMoves.some(move =>
                move.x === nearestCell.x && move.y === nearestCell.y
            );
            const isCapture = captureMoves.some(move =>
                move.x === nearestCell.x && move.y === nearestCell.y
            );

            if (isAvailable || isCapture) {
                setHoveredCell({ x: nearestCell.x, y: nearestCell.y });
            } else {
                setHoveredCell(null);
            }
        } else {
            setHoveredCell(null);
        }
    };

    const createDragStartHandler = (cellId: number, figure: Figure | null | undefined, logicalX: number, logicalY: number) => {


        return (e: KonvaEventObject<DragEvent>) => {
            const stage = e.target.getStage();
            if (stage && stage.container()) {
                stage.container().style.cursor = 'grabbing';
            }

            const shape = e.target;
            if (tempLayerRef.current) {
                shape.moveTo(tempLayerRef.current);
            }

            const displayCoords = shatraBoard.toDisplayCoords(logicalX, logicalY);

            setDraggedPiece({ cellId, figure, originalX: displayCoords.x * CELL_SIZE + 5, originalY: displayCoords.y * CELL_SIZE + 5 });


            const fromCell = shatraBoard.getCellById(cellId);
            if (fromCell && fromCell.figure) {
                const moves = shatraBoard.getAvailableMoves(fromCell);
                const normalMoves: AvailableMove[] = [];
                const captureMovesList: AvailableMove[] = [];

                moves.forEach(moveCell => {
                    const moveInfo: AvailableMove = {
                        cellId: moveCell.id,
                        x: moveCell.x,
                        y: moveCell.y,
                        isCapture: shatraBoard.isValidCaptureMove(fromCell, moveCell)
                    };

                    if (moveInfo.isCapture) {
                        captureMovesList.push(moveInfo);
                    } else {
                        normalMoves.push(moveInfo);
                    }
                });

                setAvailableMoves(normalMoves);

                setCaptureMoves(captureMovesList);
                clearSelection();
                setHoveredCell(null);
            }
        }
    }

    const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
        const stage = e.target.getStage();
        const pos = stage?.getPointerPosition();

        if (!pos) return;

        const cellsWithDisplay = getCellsWithDisplay();
        const cellId = findNearestCellId(pos.x, pos.y, cellsWithDisplay);
        const nearestCell = shatraBoard.getCellById(cellId!);


        if (nearestCell) {
            const isAvailable = availableMoves.some(move =>
                move.x === nearestCell.x && move.y === nearestCell.y
            );
            const isCapture = captureMoves.some(move =>
                move.x === nearestCell.x && move.y === nearestCell.y
            );


            if (isAvailable || isCapture) {
                setHoveredCell({ x: nearestCell.x, y: nearestCell.y });
            } else {
                setHoveredCell(null);
            }
        }
    }



    const handleDragEnd = (e: KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;

        if (stage.container()) {
            stage.container().style.cursor = 'grab';
        }


        const shape = e.target;
        const mainLayer = shape.getLayer()?.getParent()?.findOne('Layer');
        if (mainLayer) {
            shape.moveTo(mainLayer);
        }


        if (!draggedPiece) {

            return;
        }

        const cellsWithDisplay = getCellsWithDisplay();
        const cellId = findNearestCellId(pos.x, pos.y, cellsWithDisplay);
        const nearestCell = shatraBoard.getCellById(cellId!);

        const fromCell = shatraBoard.getCellById(draggedPiece.cellId);

        if (!fromCell) {
            e.target.position({
                x: draggedPiece.originalX,
                y: draggedPiece.originalY
            });
            return;
        }

        if (nearestCell && nearestCell.id === fromCell.id) {
            if (shatraBoard.gameState === GameState.BIY_RIGHTS_ACTIVE ||
                (fromCell.figure instanceof Biy)) {
                const tempBoard = shatraBoard.clone();
                const tempFrom = tempBoard.getCellById(fromCell.id)!;

                if (tempBoard.makeMove(tempFrom, tempFrom)) {
                    setShatraBoard(tempBoard);
                    setLastMove({
                        from: fromCell,
                        to: fromCell
                    });

                    playMoveSound();
                } else {
                    e.target.position({
                        x: draggedPiece.originalX,
                        y: draggedPiece.originalY
                    });
                }
            } else {
                e.target.position({
                    x: draggedPiece.originalX,
                    y: draggedPiece.originalY
                });
            }
        }
        else if (nearestCell) {
            const isAvailableMove = availableMoves.some(move =>
                move.x === nearestCell.x && move.y === nearestCell.y
            );
            const isCaptureMove = captureMoves.some(move =>
                move.x === nearestCell.x && move.y === nearestCell.y
            );

            if (isAvailableMove || isCaptureMove) {
                const toCell = nearestCell;
                if (fromCell) {
                    const isAvailable = availableMoves.some(move =>
                        move.x === toCell.x && move.y === toCell.y
                    );
                    const isCapture = captureMoves.some(move =>
                        move.x === toCell.x && move.y === toCell.y
                    );

                    if (isAvailable || isCapture) {
                        let moveSuccess = false;
                        const tempBoard = shatraBoard.clone();
                        const tempFrom = tempBoard.getCellById(fromCell.id)!;
                        const tempTo = tempBoard.getCellById(toCell.id)!;

                        if (isAvailable) {
                            moveSuccess = tempBoard.makeNormalMove(tempFrom, tempTo);
                        } else {
                            moveSuccess = tempBoard.makeMove(tempFrom, tempTo);
                        }

                        if (moveSuccess) {
                            setShatraBoard(tempBoard);
                            const finalDisplayCoords = shatraBoard.toDisplayCoords(toCell.x, toCell.y);

                            e.target.position({
                                x: finalDisplayCoords.x * CELL_SIZE + 5,
                                y: finalDisplayCoords.y * CELL_SIZE + 5
                            });
                            setLastMove({
                                from: fromCell,
                                to: toCell
                            });
                            playMoveSound();
                        } else {
                            e.target.position({
                                x: draggedPiece.originalX,
                                y: draggedPiece.originalY
                            });
                        }
                    }
                }
            }

        }


        const displayCoords = shatraBoard.toDisplayCoords(fromCell.x, fromCell.y);

        e.target.position({
            x: displayCoords.x * CELL_SIZE + 5,
            y: displayCoords.y * CELL_SIZE + 5
        });



        setHoveredCell(null);
        setAvailableMoves([]);
        setCaptureMoves([]);
        setDraggedPiece(null);
        clearSelection();
    };



    return {
        createDragStartHandler,
        handleDragEnd,
        handleDragMove,
        handleMouseMove,
        setDraggedPiece,
        tempLayerRef,
        hoveredCell
    }
}