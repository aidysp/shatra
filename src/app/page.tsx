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
    }
  }


  const handleDragEnd = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    if (stage && stage.container()) {
      stage.container().style.cursor = 'grab';
    }

    const shape = e.target;
    const mainLayer = shape.getLayer()?.getParent()?.findOne('Layer');
    if (mainLayer) {
      shape.moveTo(mainLayer);
    }



    const nearestCell = findNearestCell(pos.x, pos.y);

    if (!draggedPiece) {
      e.target.position({ x: 5, y: 5 });
      setDraggedPiece(null);
      return;
    }

    if (nearestCell) {
      e.target.position({
        x: nearestCell.x * 40 + 5,
        y: nearestCell.y * 40 + 5
      });
    } else {
      e.target.position({
        x: draggedPiece.originalX,
        y: draggedPiece.originalY
      });
    }


    setDraggedPiece(null);
  };

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();

    if (!pos) return;

    const nearestCell = findNearestCell(pos.x, pos.y);

    if (nearestCell) {
      const newX = nearestCell.x * 40 + 5;
      const newY = nearestCell.y * 40 + 5;

      e.target.position({ x: newX, y: newY })
    }
  }



  const findNearestCell = (x: number, y: number): Cell | null => {
    let nearestCell: Cell | null = null;
    let minDistance = Infinity;

    shatraBoard.cells.forEach(cell => {
      const cellCenterX = cell.x * 40 + 5;
      const cellCenterY = cell.y * 40 + 5;
      const distance = Math.sqrt(Math.pow(x - cellCenterX, 2) + Math.pow(y - cellCenterY, 2));

      if (distance < minDistance) {
        minDistance = distance;
        nearestCell = cell;
      }
    });

    return nearestCell;
  }


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