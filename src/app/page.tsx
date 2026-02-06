'use client'


import { ShatraBoard, ShatraCell, ShatraGameHistory } from '@/entities';
import { FlipBoardProvider } from '@/features/flipBoard/context/flipBoard.Context';
import { BoardWidget } from '@/widgets/boardWidget';
import { useEffect, useState } from 'react';




export default function Home() {

  const [shatraBoard, setShatraBoard] = useState<ShatraBoard>(new ShatraBoard());
  const [gameHistory, setGameHistory] = useState<ShatraGameHistory | null>(null);
  const moves = gameHistory?.getAllMoves() || [];
  const [activeCaptureFigure, setActiveCaptureFigure] = useState<ShatraCell | null>(null);

  useEffect(() => {
    const board = new ShatraBoard();
    board.initCells();
    board.initFigures();

    const history = new ShatraGameHistory(board);
    setGameHistory(history);
    setShatraBoard(board);
  }, []);





  return (
    <div className="">
      <FlipBoardProvider>
        <div className='flex justify-center items-center w-[100%] h-[100vh]'>
          <div className='w-[280px] h-[560px] max-w-[100%] max-h-[100%]  overflow-hidden'>
            <BoardWidget
              shatraBoard={shatraBoard}
              setShatraBoard={setShatraBoard}
              gameHistory={gameHistory}
              setGameHistory={setGameHistory}
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