'use client'

import { useEffect, useRef, useState } from 'react';
import { Stage, Layer } from "react-konva";
import { Layer as KonvaLayer } from 'konva/lib/Layer';
import { ShatraBoard as Board, ShatraCell as Cell } from '@/entities';
import { KonvaEventObject } from 'konva/lib/Node';
import { Figure } from '@/entities/shatra/figure';
import { flushSync } from 'react-dom';
import { GameState } from '@/entities/shatra/config/GameState';
import { Biy } from '@/entities/shatra/figure/model/Biy';
import { BoardCell } from '@/shared/ui/board';
import { ShatraGameHistory as GameHistory } from '@/entities';
import { MoveHistoryWidget } from '@/widgets/moveHistoryWidget';
import { FlipBoardButton } from '@/features/flipBoard';
import { MoveInfo } from '@/entities/shatra/gameHistory/model/ShatraGameHistory';
import { useFlipBoard } from '@/features/flipBoard/context/flipBoard.Context';

interface BoardWidgetProps {
    shatraBoard: Board;
    setShatraBoard: (shatraBoard: Board) => void;
    gameHistory: GameHistory | null;
    setGameHistory: (GameHistory: GameHistory) => void;
    moves: MoveInfo[] | [];
    activeCaptureFigure: Cell | null;
    setActiveCaptureFigure: (Cell: Cell | null) => void;
}

interface AvailableMove {
    cellId: number;
    x: number;
    y: number;

    isCapture: boolean;
}


const BoardWidget: React.FC<BoardWidgetProps> = ({
    shatraBoard,
    setShatraBoard,
    gameHistory,
    setGameHistory,
    moves,
    activeCaptureFigure,
    setActiveCaptureFigure
}) => {





    const [forcedCaptureFigures, setForcedCaptureFigures] = useState<number[]>([]);

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
                setSelectedCell(activeFigure);
            }
        } else {
            setActiveCaptureFigure(null);
        }

        const forcedFigures = shatraBoard.getFiguresWithForcedCapture();
        const forcedFigureIds = forcedFigures.map(cell => cell.id);
        setForcedCaptureFigures(forcedFigureIds);
    }, [shatraBoard, setActiveCaptureFigure]);


    const [lastMove, setLastMove] = useState<{
        from: Cell | null;
        to: Cell | null;
    }>({
        from: null,
        to: null
    });

    const [windowSize, setWindowSize] = useState({
        width: 0,
        height: 0,
    })

    const tempLayerRef = useRef<KonvaLayer>(null);

    const moveSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        moveSoundRef.current = new Audio('/sounds/move_sound.mp3');
    }, []);

    const playMoveSound = () => {
        if (moveSoundRef.current) {
            moveSoundRef.current.currentTime = 0;
            moveSoundRef.current.play().catch(error => {
                console.warn("Error playMoveSound", error)
            });
        }
    };


    useEffect(() => {
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight
        });

        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize)
    }, []);


    interface DraggedPiece {
        cellId: number;
        figure: Figure | null | undefined;
        originalX: number;
        originalY: number;
    }


    const [draggedPiece, setDraggedPiece] = useState<DraggedPiece | null>(null);
    const [availableMoves, setAvailableMoves] = useState<AvailableMove[]>([]);
    const [captureMoves, setCaptureMoves] = useState<AvailableMove[]>([]);
    const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);


    const [selectedCell, setSelectedCell] = useState<Cell | null>(null);

    const [animatingFigure, setAnimatingFigure] = useState<{
        figure: Figure;
        fromCell: Cell;
        toCell: Cell;
    } | null>(null);




    const findNearestCell = (displayX: number, displayY: number): Cell | null => {
        let nearestCell: Cell | null = null;
        let minDistance = Infinity;
        const MAGNET_THRESHOLD = 30;

        shatraBoard.getCells.forEach(cell => {
            const displayCoords = shatraBoard.toDisplayCoords(cell.x, cell.y);

            const cellCenterX = displayCoords.x * 40 + 20;
            const cellCenterY = displayCoords.y * 40 + 20;

            const distance = Math.sqrt(Math.pow(displayX - cellCenterX, 2) + Math.pow(displayY - cellCenterY, 2));

            if (distance < minDistance && distance < MAGNET_THRESHOLD) {
                minDistance = distance;
                nearestCell = cell;
            }
        });

        return nearestCell;
    }



    const performMoveWithAnimation = (from: Cell, to: Cell) => {

        if (!shatraBoard.isValidMove(from, to)) {
            return;
        }

        const animatingFigure = {
            figure: from.figure!,
            fromCell: from,
            toCell: to
        };

        gameHistory!.addMove(animatingFigure.fromCell, animatingFigure.toCell);

        setAnimatingFigure(animatingFigure);
        setAvailableMoves([]);
        setCaptureMoves([]);
        setSelectedCell(null);
        setHoveredCell(null);
    }


    const handleAnimationComplete = () => {
        if (!animatingFigure) return;



        flushSync(() => {
            shatraBoard.makeMove(animatingFigure.fromCell, animatingFigure.toCell);

            setShatraBoard(shatraBoard.clone());

            setLastMove({
                from: animatingFigure.fromCell,
                to: animatingFigure.toCell
            });
            setAnimatingFigure(null);


            const newBoard = shatraBoard.clone();

            setShatraBoard(newBoard);
        });

        playMoveSound();

    }

    const handleCellClick = (cell: Cell) => {

        if (activeCaptureFigure) {
            const isAvailableForActiveFigure = captureMoves.some(move =>
                move.x === cell.x && move.y === cell.y
            );

            if (isAvailableForActiveFigure) {
                performMoveWithAnimation(activeCaptureFigure, cell);
                return;
            }

        }

        if (selectedCell?.id === cell.id) {
            setSelectedCell(null);
            setHoveredCell(null);
            setAvailableMoves([]);
            setCaptureMoves([]);
            return;
        }


        if (cell.figure && cell.figure.color === shatraBoard.currentPlayer) {

            setSelectedCell(cell);

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

            if (isAvailableMove) {
                performMoveWithAnimation(selectedCell, cell);
                return;
            }
        }

        setSelectedCell(null);
        setHoveredCell(null);
        setAvailableMoves([]);
        setCaptureMoves([]);

    };

    const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {

        if (!selectedCell) return;

        const stage = e.target.getStage();
        const pos = stage?.getPointerPosition();

        if (!pos) return;

        const nearestCell = findNearestCell(pos.x, pos.y);

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

            setDraggedPiece({ cellId, figure, originalX: displayCoords.x * 40 + 5, originalY: displayCoords.y * 40 + 5 });


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
                setSelectedCell(null);
                setHoveredCell(null);
            }
        }
    }

    const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
        const stage = e.target.getStage();
        const pos = stage?.getPointerPosition();

        if (!pos) return;

        const nearestCell = findNearestCell(pos.x, pos.y);


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

        const nearestCell = findNearestCell(pos.x, pos.y);
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

                // !!!
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
                                x: finalDisplayCoords.x * 40 + 5,
                                y: finalDisplayCoords.y * 40 + 5
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
            x: displayCoords.x * 40 + 5,
            y: displayCoords.y * 40 + 5
        });



        setHoveredCell(null);
        setAvailableMoves([]);
        setCaptureMoves([]);
        setDraggedPiece(null);
        setSelectedCell(null);
    };



    const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;


        const clickedCell = findNearestCell(pos.x, pos.y);

        if (!clickedCell) {
            setSelectedCell(null);
            setHoveredCell(null);
            setAvailableMoves([]);
            setCaptureMoves([]);
            return;
        }

        handleCellClick(clickedCell);
    };


    const { flipKey } = useFlipBoard();



    return (
        <>



            <MoveHistoryWidget moves={moves} />
            <FlipBoardButton
                board={shatraBoard}
                onFlip={(flippedBoard) => {
                    flushSync(() => {
                        setSelectedCell(null);
                        setAvailableMoves([]);
                        setCaptureMoves([]);
                        setHoveredCell(null);
                        setDraggedPiece(null);
                        setAnimatingFigure(null);
                    });

                    setShatraBoard(flippedBoard);
                }}
            />


            <Stage
                key={`${flipKey}`}
                width={280}
                height={560}
                onClick={handleStageClick}
                onTap={handleStageClick}
            >
                <Layer>
                    {
                        shatraBoard.getCells.map(cell => {

                            const displayCoords = shatraBoard.toDisplayCoords(cell.x, cell.y);


                            const isAnimating = animatingFigure?.fromCell.id === cell.id;
                            const hasForcedCapture = forcedCaptureFigures.includes(cell.id);

                            const targetDisplayCoords = isAnimating && shatraBoard.toDisplayCoords(
                                animatingFigure.toCell.x,
                                animatingFigure.toCell.y
                            );

                            const targetPos = targetDisplayCoords ? {
                                targetX: targetDisplayCoords.x * 40 + 5,
                                targetY: targetDisplayCoords.y * 40 + 5
                            } : {};



                            return <BoardCell
                                key={`${cell.id}`}

                                id={cell.id}
                                x={displayCoords.x}
                                y={displayCoords.y}
                                color={cell.color}
                                figureColor={cell.figure?.color}
                                figure={cell.figure?.logo}
                                handleDragStart={createDragStartHandler(cell.id, cell.figure, cell.x, cell.y)}
                                handleDragEnd={handleDragEnd}
                                handleDragMove={handleDragMove}
                                onMouseMove={handleMouseMove}
                                isAvailableMove={availableMoves.some(move =>
                                    move.x === cell.x && move.y === cell.y
                                )}
                                isLastMove={lastMove.from?.id === cell.id || lastMove.to?.id === cell.id}
                                isCaptureMove={captureMoves.some(move =>
                                    move.x === cell.x && move.y === cell.y
                                )}
                                isHovered={hoveredCell !== null &&
                                    hoveredCell.x === cell.x &&
                                    hoveredCell.y === cell.y}
                                isSelected={selectedCell?.id === cell.id}
                                isActiveCaptureFigure={activeCaptureFigure}
                                hasForcedCapture={hasForcedCapture}
                                isAnimating={isAnimating}
                                onAnimationComplete={handleAnimationComplete}
                                {...targetPos}
                            />
                        })
                    }
                </Layer>


                <Layer ref={tempLayerRef} id="temp-layer" />
            </Stage >



        </>
    );
}

export { BoardWidget }