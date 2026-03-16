'use client'

import { FlipBoardButton } from '@/features/flipBoard';
import { useFlipBoard } from '@/features/flipBoard/context/flipBoard.Context';
import { MoveHistory } from '@/features/moveHistory';
import { ShatraBoard } from "@/features/shatraBoard";


import { ShatraBoard as Board, ShatraCell as Cell } from '@/entities';
import { MoveRecord } from '@/entities/shatra/board/model/ShatraBoard';


interface GameShatraBoardWidgetProps {
    shatraBoard: Board;
    setShatraBoard: (shatraBoard: Board) => void;
    moves: MoveRecord[] | [];
    activeCaptureFigure: Cell | null;
    setActiveCaptureFigure: (Cell: Cell | null) => void;
}


const GameShatraBoardWidget: React.FC<GameShatraBoardWidgetProps> = ({
    shatraBoard,
    setShatraBoard,
    moves,
    activeCaptureFigure,
    setActiveCaptureFigure
}) => {

    const { flipKey } = useFlipBoard();



    return (
        <>
            <div className='grid grid-cols-[1fr_1fr_1fr] gap-15 items-center'>

                <div></div>
                {/* 
                <FlipBoardButton
                    board={shatraBoard}
                    onFlip={(flippedBoard) => {
                        setShatraBoard(flippedBoard);
                    }}
                /> */}
                <ShatraBoard shatraBoard={shatraBoard}
                    setShatraBoard={setShatraBoard}
                    activeCaptureFigure={activeCaptureFigure}
                    setActiveCaptureFigure={setActiveCaptureFigure}
                    flipKey={flipKey}
                />

                <MoveHistory moves={moves} />
            </div>


        </>
    );
}

export { GameShatraBoardWidget }