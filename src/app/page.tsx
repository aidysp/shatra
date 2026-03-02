'use client'


import { ShatraBoard, ShatraCell } from '@/entities';
import { MoveRecord } from '@/entities/shatra/board/model/ShatraBoard';
import { FlipBoardProvider } from '@/features/flipBoard/context/flipBoard.Context';
import { GameShatraBoardWidget } from '@/widgets/GameShatraBoardWidget';
import { useEffect, useState } from 'react';




export default function Home() {

  const [shatraBoard, setShatraBoard] = useState<ShatraBoard>(new ShatraBoard());
  const [moves, setMoves] = useState<MoveRecord[]>([]);

  const [activeCaptureFigure, setActiveCaptureFigure] = useState<ShatraCell | null>(null);

  useEffect(() => {
    const board = new ShatraBoard();
    board.initCells();
    board.initFigures();
    setShatraBoard(board);
  }, []);

  useEffect(() => {
    if (shatraBoard) {
      setMoves(shatraBoard.getMoveHistory?.() || []);
    }
  }, [shatraBoard]);





  return (
    <div className="">
      <FlipBoardProvider>
        <div className='flex justify-center items-center w-[100%] h-[100vh]'>
          <div className='w-[280px] h-[560px] max-w-[100%] max-h-[100%]  overflow-hidden'>

            <GameShatraBoardWidget
              shatraBoard={shatraBoard}
              setShatraBoard={setShatraBoard}
              moves={moves}
              activeCaptureFigure={activeCaptureFigure}
              setActiveCaptureFigure={setActiveCaptureFigure}
            />
          </div>

        </div>
      </FlipBoardProvider>
    </div>
  );
}