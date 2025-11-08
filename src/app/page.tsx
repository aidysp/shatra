'use client'

import { useEffect, useRef, useState } from 'react';
import { Stage, Layer } from "react-konva";
import { Layer as KonvaLayer } from 'konva/lib/Layer';
import { Board } from "@/shatra-core/src";
import { CellWidget } from '@/widgets/cell';
import { KonvaEventObject } from 'konva/lib/Node';
import { Figure } from '@/shatra-core/src/Figures/Figure';
import { Cell } from '@/shatra-core/src/Cell';
import { flushSync } from 'react-dom';
import { BoardVisualizer } from '@/shatra-core/src/utils/BoardVisualizer';
import { Player } from '@/shatra-core/src/config/Player';
import { GameState } from '@/shatra-core/src/config/GameState';




export default function Home() {

  const [shatraBoard, setShatraBoard] = useState<Board>(new Board());
  const [activeCaptureFigure, setActiveCaptureFigure] = useState<Cell | null>(null);


  useEffect(() => {
    if (shatraBoard.gameState === GameState.ACTIVE_CAPTURE_CHAIN ||
      shatraBoard.gameState === GameState.BIY_RIGHTS_ACTIVE) {
      const activeFigure = shatraBoard.getActiveCaptureFigure();
      setActiveCaptureFigure(activeFigure);

      if (activeFigure) {
        const moves = shatraBoard.getAvailableMoves(activeFigure);
        const normalMoves: number[] = [];
        const captureMovesList: number[] = [];

        moves.forEach(moveCell => {
          if (shatraBoard.isValidCaptureMove(activeFigure, moveCell)) {
            captureMovesList.push(moveCell.id);
          } else {
            normalMoves.push(moveCell.id);
          }
        });

        setAvailableMoves(normalMoves);
        setCaptureMoves(captureMovesList);
        setSelectedCell(activeFigure);
      }
    } else {
      setActiveCaptureFigure(null);
    }
  }, [shatraBoard]);


  const [forcedCaptureFigures, setForcedCaptureFigures] = useState<number[]>([]);
  useEffect(() => {
    if (shatraBoard.gameState === GameState.ACTIVE_CAPTURE_CHAIN ||
      shatraBoard.gameState === GameState.BIY_RIGHTS_ACTIVE) {
      const activeFigure = shatraBoard.getActiveCaptureFigure();
      setActiveCaptureFigure(activeFigure);

      if (activeFigure) {
        const moves = shatraBoard.getAvailableMoves(activeFigure);
        const normalMoves: number[] = [];
        const captureMovesList: number[] = [];

        moves.forEach(moveCell => {
          if (shatraBoard.isValidCaptureMove(activeFigure, moveCell)) {
            captureMovesList.push(moveCell.id);
          } else {
            normalMoves.push(moveCell.id);
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
  }, [shatraBoard]);

  const [moveChoice, setMoveChoice] = useState<{
    show: boolean;
    from: Cell | null;
    to: Cell | null;
  }>({
    show: false,
    from: null,
    to: null
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
    BoardVisualizer.printBoard(board, Player.BLACK);
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
  const [captureMoves, setCaptureMoves] = useState<number[]>([]);
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

    shatraBoard.getCells.forEach(cell => {
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
    });

    playMoveSound();

  }

  const handleCellClick = (cell: Cell) => {
    if ((shatraBoard.gameState === GameState.ACTIVE_CAPTURE_CHAIN ||
      shatraBoard.gameState === GameState.BIY_RIGHTS_ACTIVE) &&
      selectedCell && selectedCell.id === cell.id) {

      const tempBoard = shatraBoard.clone();
      const tempFrom = tempBoard.getCellById(selectedCell.id)!;

      if (tempBoard.makeMove(tempFrom, tempFrom)) {
        setShatraBoard(tempBoard);
        setLastMove({
          from: selectedCell,
          to: selectedCell
        });
        playMoveSound();
      }

      setSelectedCell(null);
      setHoveredCell(null);
      setAvailableMoves([]);
      setCaptureMoves([]);
      return;
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
      const normalMoves: number[] = [];
      const captureMovesList: number[] = [];

      moves.forEach(moveCell => {
        normalMoves.push(moveCell.id);
        if (shatraBoard.isValidCaptureMove(cell, moveCell)) {
          captureMovesList.push(moveCell.id);
        }
      });
      setAvailableMoves(normalMoves);
      setCaptureMoves(captureMovesList);
      return;
    }

    if (selectedCell) {
      const isAvailableMove = availableMoves.includes(cell.id) || captureMoves.includes(cell.id);

      if (isAvailableMove) {


        if (shatraBoard.hasMoveIntersection(selectedCell, cell)) {
          setMoveChoice({
            show: true,
            from: selectedCell,
            to: cell
          });
        } else {
          performMoveWithAnimation(selectedCell, cell);
        }
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

    if (nearestCell && (availableMoves.includes(nearestCell.id) || captureMoves.includes(nearestCell.id))) {
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
        const normalMoves: number[] = [];
        const captureMovesList: number[] = [];

        moves.forEach(moveCell => {
          if (shatraBoard.isValidCaptureMove(fromCell, moveCell)) {
            captureMovesList.push(moveCell.id);
          } else {
            normalMoves.push(moveCell.id);
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


    if (nearestCell && (availableMoves.includes(nearestCell.id) || captureMoves.includes(nearestCell.id))) {
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
      if (shatraBoard.gameState === GameState.BIY_RIGHTS_ACTIVE) {
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
    else if (nearestCell && (availableMoves.includes(nearestCell.id) || captureMoves.includes(nearestCell.id))) {

      const toCell = nearestCell;

      if (fromCell) {
        if (shatraBoard.hasMoveIntersection(fromCell, toCell)) {
          setMoveChoice({
            show: true,
            from: fromCell,
            to: toCell
          });

          e.target.position({
            x: draggedPiece.originalX,
            y: draggedPiece.originalY
          });

          return;
        }
        else if (availableMoves.includes(toCell.id) || captureMoves.includes(toCell.id)) {
          let moveSuccess = false;
          const tempBoard = shatraBoard.clone();
          const tempFrom = tempBoard.getCellById(fromCell.id)!;
          const tempTo = tempBoard.getCellById(toCell.id)!;

          if (availableMoves.includes(toCell.id)) {
            moveSuccess = tempBoard.makeNormalMove(tempFrom, tempTo);
          } else {
            moveSuccess = tempBoard.makeMove(tempFrom, tempTo);
          }

          if (moveSuccess) {
            setShatraBoard(tempBoard);
            e.target.position({
              x: toCell.x * 40 + 5,
              y: toCell.y * 40 + 5
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

    e.target.position({
      x: draggedPiece.originalX,
      y: draggedPiece.originalY
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


  const handleNormalMove = () => {
    if (moveChoice.from && moveChoice.to) {
      const tempBoard = shatraBoard.clone();
      const tempFrom = tempBoard.getCellById(moveChoice.from.id)!;
      const tempTo = tempBoard.getCellById(moveChoice.to.id)!;

      if (tempBoard.makeNormalMove(tempFrom, tempTo)) {
        setShatraBoard(tempBoard);
        setLastMove({
          from: moveChoice.from,
          to: moveChoice.to
        });
        playMoveSound();
      }
    }

    setMoveChoice({ show: false, from: null, to: null });
    setSelectedCell(null);
    setHoveredCell(null);
    setAvailableMoves([]);
    setCaptureMoves([]);
  };

  const handleCaptureMove = () => {
    if (moveChoice.from && moveChoice.to) {
      const tempBoard = shatraBoard.clone();
      const tempFrom = tempBoard.getCellById(moveChoice.from.id)!;
      const tempTo = tempBoard.getCellById(moveChoice.to.id)!;

      if (tempBoard.makeMove(tempFrom, tempTo)) {
        setShatraBoard(tempBoard);
        setLastMove({
          from: moveChoice.from,
          to: moveChoice.to
        });
        playMoveSound();
      }
    }

    setMoveChoice({ show: false, from: null, to: null });
    setSelectedCell(null);
    setHoveredCell(null);
    setAvailableMoves([]);
    setCaptureMoves([]);
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
            onTap={handleStageClick}
          >
            <Layer>
              {
                shatraBoard.getCells.map(cell => {
                  const isAnimating = animatingFigure?.fromCell.id === cell.id;
                  const hasForcedCapture = forcedCaptureFigures.includes(cell.id);
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
                    isLastMove={lastMove.from?.id === cell.id || lastMove.to?.id === cell.id}
                    isCaptureMove={captureMoves.includes(cell.id)}
                    isHovered={hoveredCell === cell.id}
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
          </Stage>
        </div>
      </div>

      {moveChoice.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-80"
            onClick={() => setMoveChoice({ show: false, from: null, to: null })}
          ></div>

          <div className="bg-white rounded-lg relative z-10">
            {/* Кнопка закрытия */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
              onClick={() => setMoveChoice({ show: false, from: null, to: null })}
            >
              ×
            </button>
            <div className="bg-white p-6 rounded-lg">



              <h3 className="text-black text-lg font-bold mb-4">Выберите тип хода</h3>
              <div className="flex gap-4">

                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
                  onClick={handleNormalMove}
                >
                  Обычный ход
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer"
                  onClick={handleCaptureMove}
                >
                  Взять фигуру
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}