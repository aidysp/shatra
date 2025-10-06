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
    console.log("This is new board", board.showBoard());

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
      e.target.position({ x: 5, y: 5 });
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
        console.log("Ход выполнен успешно!");
      } else {
        e.target.position({
          x: draggedPiece.originalX,
          y: draggedPiece.originalY
        });
        console.log("Неверный ход!");
      }
    } else {
      e.target.position({
        x: draggedPiece.originalX,
        y: draggedPiece.originalY
      });
    }

    setHoveredCell(null);
    setAvailableMoves([]);
    setDraggedPiece(null);
  };


  return (
    <div className="">

      <div className='flex justify-center items-center w-[100%] h-[100vh]'>
        <div className='w-[280px] h-[560px] max-w-[100%] max-h-[100%]  overflow-hidden'>
          <Stage key={`${windowSize.width}-${windowSize.height}`} width={280} height={560}  >
            <Layer>
              {
                shatraBoard.cells.map(cell => {
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
                    isAvailableMove={availableMoves.includes(cell.id)}
                    isHovered={hoveredCell === cell.id}
                  />
                })
              }
            </Layer>
            <Layer ref={tempLayerRef} />
          </Stage>
        </div>
      </div>
    </div>
  );
}