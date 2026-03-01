import { ShatraBoard, ShatraCell } from "@/entities";
import { Figure } from "@/entities/shatra/figure";
import { flushSync } from "react-dom";

interface useMoveAnimationReturn {
    handleAnimationComplete: () => void;
}

interface useMoveAnimationProps {
    shatraBoard: ShatraBoard;
    setShatraBoard: (board: ShatraBoard) => void;
    animatingFigure: { figure: Figure, fromCell: ShatraCell, toCell: ShatraCell } | null;
    setLastMove: (e: {
        from: ShatraCell | null;
        to: ShatraCell | null;
    }) => void;
    completeAnimation: () => void;
    playMoveSound: () => void;
}


export const useMoveAnimation = ({
    shatraBoard,
    setShatraBoard,
    animatingFigure,
    setLastMove,
    completeAnimation,
    playMoveSound
}: useMoveAnimationProps): useMoveAnimationReturn => {


    const handleAnimationComplete = () => {
        if (!animatingFigure) return;



        flushSync(() => {
            shatraBoard.makeMove(animatingFigure.fromCell, animatingFigure.toCell);

            setShatraBoard(shatraBoard.clone());

            setLastMove({
                from: animatingFigure.fromCell,
                to: animatingFigure.toCell
            });
            completeAnimation();


            const newBoard = shatraBoard.clone();

            setShatraBoard(newBoard);
        });

        playMoveSound();

    }


    return {
        handleAnimationComplete
    }
}