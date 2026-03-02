'use client'


import { ShatraBoard as Board, ShatraCell as Cell } from '@/entities';
import { MoveRecord } from '@/entities/shatra/board/model/ShatraBoard';
import { FlipBoardButton } from '@/features/flipBoard';
import { useFlipBoard } from '@/features/flipBoard/context/flipBoard.Context';
import { MoveHistory } from '@/features/moveHistory';
import { ShatraBoard } from "@/features/shatraBoard";






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

            <FlipBoardButton
                board={shatraBoard}
                onFlip={(flippedBoard) => {
                    setShatraBoard(flippedBoard);
                }}
            />
            <MoveHistory moves={moves} />

            <ShatraBoard shatraBoard={shatraBoard}
                setShatraBoard={setShatraBoard}
                activeCaptureFigure={activeCaptureFigure}
                setActiveCaptureFigure={setActiveCaptureFigure}
                flipKey={flipKey}
            />
        </>
    );
}

export { GameShatraBoardWidget }