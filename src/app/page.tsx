'use client'

import { useEffect, useRef, useState } from 'react';
import { Stage, Layer } from "react-konva";
import { Layer as KonvaLayer } from 'konva/lib/Layer';


import { Board } from "@/shatra-core/src";
import { CellWidget } from '@/widgets/cell';




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
    setShatraBoard(board);
  }, []);



  return (
    <div className="">

      <div className='flex justify-center items-center w-[100%] h-[100vh]'>
        <div className='w-[280px] h-[560px] max-w-[100%] max-h-[100%]  overflow-hidden'>
          <Stage key={`${windowSize.width}-${windowSize.height}`} width={280} height={560}  >
            <Layer>
              {
                shatraBoard.cells.map(cell => {
                  return <CellWidget key={cell.id} id={cell.id} x={cell.x} y={cell.y} color={cell.color} figureColor={cell.figure?.color} figure={cell.figure?.logo} tempLayerRef={tempLayerRef} />
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