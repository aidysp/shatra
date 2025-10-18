'use client'

import { useEffect, useRef, useState } from 'react';
import { Stage, Layer } from "react-konva";
import { Layer as KonvaLayer } from 'konva/lib/Layer';
import { Board } from "@/shatra-core/src";
import { CellWidget } from '@/widgets/cell';
import { KonvaEventObject } from 'konva/lib/Node';
import { Figure } from '@/shatra-core/src/Figures/Figure';
import { Cell } from '@/shatra-core/src/Cell';


export default function Home() {

  const [shatraBoard, setShatraBoard] = useState<Board>(new Board())

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
        console.log('Autoplay sound is blocked:', error);
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


  useEffect(() => {
    const board = new Board();
    board.initCells();
    board.initFigures();
    board.consoleBoard();
    setShatraBoard(board);
  }, []);

  interface DraggedPiece {
    cellId: number;
    figure: Figure | null | undefined;
    originalX: number;
    originalY: number;
  }


  const [draggedPiece, setDraggedPiece] = useState<DraggedPiece | null>(null);
  const [availableMoves, setAvailableMoves] = useState<number[]>([]);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);

  const [animatingFigure, setAnimatingFigure] = useState<{
    figure: Figure;
    fromCell: Cell;
    toCell: Cell;
  } | null>(null);



  const findNearestCell = (x: number, y: number): Cell | null => {
    let nearestCell: Cell | null = null;
    let minDistance = Infinity;
    const MAGNET_THRESHOLD = 30;

    shatraBoard.cells.forEach(cell => {
      const cellCenterX = cell.x * 40 + 20;
      const cellCenterY = cell.y * 40 + 20;
      const distance = Math.sqrt(Math.pow(x - cellCenterX, 2) + Math.pow(y - cellCenterY, 2));

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

    setAnimatingFigure(animatingFigure);
    setAvailableMoves([]);
    setSelectedCell(null);
  };


  const handleAnimationComplete = () => {
    if (animatingFigure) {
      shatraBoard.makeMove(animatingFigure.fromCell, animatingFigure.toCell);
      setShatraBoard(shatraBoard.clone());
      playMoveSound();
      setAnimatingFigure(null);
    }
  }


  const handleCellClick = (cell: Cell) => {
    if (selectedCell?.id === cell.id) {
      return;
    }

    if (!selectedCell && cell.figure) {

      setSelectedCell(cell);

      const moves = shatraBoard.getAvailableMoves(cell);
      setAvailableMoves(moves.map(c => c.id));
    }

    else if (selectedCell && availableMoves.includes(cell.id)) {

      performMoveWithAnimation(selectedCell, cell);
    }

    else {
      setSelectedCell(null);
      setAvailableMoves([]);
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {

    if (!selectedCell) return;

    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();

    if (!pos) return;

    const nearestCell = findNearestCell(pos.x, pos.y);

    if (nearestCell && availableMoves.includes(nearestCell.id)) {
      setHoveredCell(nearestCell.id);
    } else {
      setHoveredCell(null);
    }
  };


  const createDragStartHandler = (cellId: number, figure: Figure | null | undefined, x: number, y: number) => {
    return (e: KonvaEventObject<DragEvent>) => {
      const stage = e.target.getStage();
      if (stage && stage.container()) {
        stage.container().style.cursor = 'grabbing';
      }

      const shape = e.target;
      if (tempLayerRef.current) {
        shape.moveTo(tempLayerRef.current);
      }


      setDraggedPiece({ cellId, figure, originalX: x * 40 + 5, originalY: y * 40 + 5 });


      const fromCell = shatraBoard.getCellById(cellId);
      if (fromCell && fromCell.figure) {
        const moves = shatraBoard.getAvailableMoves(fromCell);
        setAvailableMoves(moves.map(cell => cell.id));
      }
    }
  }

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();

    if (!pos) return;

    const nearestCell = findNearestCell(pos.x, pos.y);


    if (nearestCell && availableMoves.includes(nearestCell.id)) {
      setHoveredCell(nearestCell.id);
    } else {
      setHoveredCell(null);
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
      // e.target.position({ x: 5, y: 5 });
      return;
    }

    const nearestCell = findNearestCell(pos.x, pos.y);

    if (nearestCell && availableMoves.includes(nearestCell.id)) {
      const fromCell = shatraBoard.getCellById(draggedPiece.cellId);
      const toCell = nearestCell;

      if (fromCell && shatraBoard.makeMove(fromCell, toCell)) {

        e.target.position({
          x: nearestCell.x * 40 + 5,
          y: nearestCell.y * 40 + 5
        });

        setShatraBoard(shatraBoard.clone());
        playMoveSound();


        setHoveredCell(null);
        setAvailableMoves([]);
        setDraggedPiece(null);
        setSelectedCell(null);
        return;
      }
    }

    e.target.position({
      x: draggedPiece.originalX,
      y: draggedPiece.originalY
    });

    setHoveredCell(null);
    setAvailableMoves([]);
    setDraggedPiece(null);
    setSelectedCell(null);
  };



  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;


    const clickedCell = findNearestCell(pos.x, pos.y);
    if (!clickedCell) return;
    handleCellClick(clickedCell);
  };

  return (
    <div className="">

      <div className='flex justify-center items-center w-[100%] h-[100vh]'>
        <div className='w-[280px] h-[560px] max-w-[100%] max-h-[100%]  overflow-hidden'>
          <Stage
            key={`${windowSize.width}-${windowSize.height}`}
            width={280}
            height={560}
            onClick={handleStageClick}
          >
            <Layer>
              {
                shatraBoard.cells.map(cell => {
                  const isAnimating = animatingFigure?.fromCell.id === cell.id;

                  const targetPos = isAnimating ? {
                    targetX: animatingFigure.toCell.x * 40 + 5,
                    targetY: animatingFigure.toCell.y * 40 + 5
                  } : {};



                  return <CellWidget
                    key={cell.id}
                    id={cell.id}
                    x={cell.x}
                    y={cell.y}
                    color={cell.color}
                    figureColor={cell.figure?.color}
                    figure={cell.figure?.logo}
                    handleDragStart={createDragStartHandler(cell.id, cell.figure, cell.x, cell.y)}
                    handleDragEnd={handleDragEnd}
                    handleDragMove={handleDragMove}
                    onMouseMove={handleMouseMove}
                    isAvailableMove={availableMoves.includes(cell.id)}
                    isHovered={hoveredCell === cell.id}
                    isSelected={selectedCell?.id === cell.id}
                    isAnimating={isAnimating}
                    onAnimationComplete={handleAnimationComplete}
                    {...targetPos}
                  />
                })
              }
            </Layer>


            <Layer ref={tempLayerRef} id="temp-layer" />
          </Stage>
        </div>
      </div>
    </div>
  );
}