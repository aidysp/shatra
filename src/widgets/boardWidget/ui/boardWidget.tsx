'use client'


import { useEffect, useState } from 'react';
import { Stage, Layer } from "react-konva";
import { ShatraBoard as Board, ShatraCell as Cell } from '@/entities';
import { flushSync } from 'react-dom';
import { BoardCell } from '@/shared/ui/board';
import { ShatraGameHistory as GameHistory } from '@/entities';
import { MoveHistoryWidget } from '@/widgets/moveHistoryWidget';
import { FlipBoardButton } from '@/features/flipBoard';
import { MoveInfo } from '@/entities/shatra/gameHistory/model/ShatraGameHistory';
import { useFlipBoard } from '@/features/flipBoard/context/flipBoard.Context';
import { AvailableMove } from '@/shared/types/board';
import { useFigureSelection } from '@/features/figureSelection';
import { useSound } from '@/features/sound';
import { CELL_SIZE } from '@/shared/lib/board';
import { useCaptureChain } from '@/features/captureChain';
import { useDragAndDrop } from '@/features/dragAndDrop';
import { useMoveIndication } from '@/features/moveIndication';
import { useBoardClick } from '@/features/boardClick';
import { useMoveAnimation } from '@/features/moveAnimation';




interface BoardWidgetProps {
    shatraBoard: Board;
    setShatraBoard: (shatraBoard: Board) => void;
    gameHistory: GameHistory | null;
    setGameHistory: (GameHistory: GameHistory) => void;
    moves: MoveInfo[] | [];
    activeCaptureFigure: Cell | null;
    setActiveCaptureFigure: (Cell: Cell | null) => void;
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

    const [captureMoves, setCaptureMoves] = useState<AvailableMove[]>([]);
    const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);
    const { selectedCell, selectFigure, clearSelection } = useFigureSelection();

    const {
        animatingFigure,
        forcedCaptureFigures,
        isChainActive,
        completeAnimation,
        startAnimation,
        updateForcedCaptures,
        endChain
    } = useCaptureChain();

    const { availableMoves, setAvailableMoves } = useMoveIndication({ shatraBoard, setActiveCaptureFigure, setCaptureMoves, selectFigure, updateForcedCaptures })

    const { handleStageClick, getCellsWithDisplay } = useBoardClick({
        shatraBoard,
        gameHistory,
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
    });

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
    });


    const { play: playMoveSound } = useSound('/sounds/move_sound.mp3');


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


    const { handleAnimationComplete } = useMoveAnimation({ shatraBoard, setShatraBoard, animatingFigure, setLastMove, completeAnimation, playMoveSound })





    const { flipKey } = useFlipBoard();


    const {
        createDragStartHandler,
        handleDragEnd,
        handleDragMove,
        handleMouseMove,
        setDraggedPiece,
        tempLayerRef
    } = useDragAndDrop({
        shatraBoard,
        availableMoves,
        setAvailableMoves,
        captureMoves,
        setCaptureMoves,
        setHoveredCell,
        setShatraBoard,
        selectedCell,
        hoveredCell,
        clearSelection,
        setLastMove,
        getCellsWithDisplay,
        playMoveSound
    });



    return (
        <>



            <MoveHistoryWidget moves={moves} />
            <FlipBoardButton
                board={shatraBoard}
                onFlip={(flippedBoard) => {
                    flushSync(() => {
                        clearSelection();
                        setAvailableMoves([]);
                        setCaptureMoves([]);
                        setHoveredCell(null);
                        setDraggedPiece(null);
                        endChain();
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
                                targetX: targetDisplayCoords.x * CELL_SIZE + 5,
                                targetY: targetDisplayCoords.y * CELL_SIZE + 5
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
                                isSelected={selectedCell?.cellId === cell.id}
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