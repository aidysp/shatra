'use client'


import { ShatraBoard as Board, ShatraCell as Cell } from '@/entities';
import { ShatraGameHistory as GameHistory } from '@/entities';
import { MoveInfo } from '@/entities/shatra/gameHistory/model/ShatraGameHistory';
import { FlipBoardButton } from '@/features/flipBoard';
import { useFlipBoard } from '@/features/flipBoard/context/flipBoard.Context';
import { MoveHistory } from '@/features/moveHistory';
import { ShatraBoard } from "@/features/shatraBoard";






interface GameShatraBoardWidgetProps {
    shatraBoard: Board;
    setShatraBoard: (shatraBoard: Board) => void;
    gameHistory: GameHistory | null;
    setGameHistory: (GameHistory: GameHistory) => void;
    moves: MoveInfo[] | [];
    activeCaptureFigure: Cell | null;
    setActiveCaptureFigure: (Cell: Cell | null) => void;
}


const GameShatraBoardWidget: React.FC<GameShatraBoardWidgetProps> = ({
    shatraBoard,
    setShatraBoard,
    gameHistory,
    setGameHistory,
    moves,
    activeCaptureFigure,
    setActiveCaptureFigure
}) => {

    const { flipKey } = useFlipBoard();

    return (
        <>
            <MoveHistory moves={moves} />
            <FlipBoardButton
                board={shatraBoard}
                onFlip={(flippedBoard) => {
                    setShatraBoard(flippedBoard);
                }}
            />

            <ShatraBoard shatraBoard={shatraBoard}
                setShatraBoard={setShatraBoard}
                gameHistory={gameHistory}
                setGameHistory={setGameHistory}
                moves={moves}
                activeCaptureFigure={activeCaptureFigure}
                setActiveCaptureFigure={setActiveCaptureFigure}
                flipKey={flipKey}
            />



        </>
    );
}

export { GameShatraBoardWidget }