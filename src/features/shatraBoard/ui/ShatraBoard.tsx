'use client'


import { useState } from 'react';
import { Stage, Layer } from "react-konva";
import { ShatraBoard as Board, ShatraCell as Cell } from '@/entities';
import { BoardCell } from '@/shared/ui/board';
import { AvailableMove } from '@/shared/types/board';
import { useFigureSelection } from '../model/useFigureSelection';
import { useSound } from '../model/useSound';
import { CELL_SIZE } from '@/shared/lib/board';
import { useCaptureChain } from '../model/useCaptureChain';
import { useDragAndDrop } from '../model/useDragAndDrop';
import { useMoveIndication } from '../model/useMoveIndication';
import { useBoardClick } from '../model/useBoardClick';
import { useMoveAnimation } from '../model/useMoveAnimation';





interface ShatraBoardProps {
    shatraBoard: Board;
    setShatraBoard: (shatraBoard: Board) => void;
    activeCaptureFigure: Cell | null;
    setActiveCaptureFigure: (Cell: Cell | null) => void;
    flipKey: number;
}


const ShatraBoard: React.FC<ShatraBoardProps> = ({
    shatraBoard,
    setShatraBoard,
    activeCaptureFigure,
    setActiveCaptureFigure,
    flipKey
}) => {

    const [captureMoves, setCaptureMoves] = useState<AvailableMove[]>([]);
    const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);
    const { selectedCell, selectFigure, clearSelection } = useFigureSelection();

    const {
        animatingFigure,
        forcedCaptureFigures,
        completeAnimation,
        startAnimation,
        updateForcedCaptures,
    } = useCaptureChain();

    const { availableMoves, setAvailableMoves } = useMoveIndication({ shatraBoard, setActiveCaptureFigure, setCaptureMoves, selectFigure, updateForcedCaptures })

    const { handleStageClick, getCellsWithDisplay } = useBoardClick({
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
    });

    const [lastMove, setLastMove] = useState<{
        from: Cell | null;
        to: Cell | null;
    }>({
        from: null,
        to: null
    });

    // const [windowSize, setWindowSize] = useState({
    //     width: 0,
    //     height: 0,
    // });


    const { play: playMoveSound } = useSound('/sounds/move_sound.mp3');


    // useEffect(() => {
    //     setWindowSize({
    //         width: window.innerWidth,
    //         height: window.innerHeight
    //     });

    //     const handleResize = () => {
    //         setWindowSize({
    //             width: window.innerWidth,
    //             height: window.innerHeight,
    //         })
    //     }

    //     window.addEventListener('resize', handleResize);
    //     return () => window.removeEventListener('resize', handleResize)
    // }, []);


    const { handleAnimationComplete } = useMoveAnimation({
        shatraBoard,
        setShatraBoard,
        animatingFigure,
        setLastMove,
        completeAnimation,
        playMoveSound
    })




    const {
        createDragStartHandler,
        handleDragEnd,
        handleDragMove,
        handleMouseMove,
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
        playMoveSound,
        // gameHistory
    });


    return (
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
    );
}

export { ShatraBoard }