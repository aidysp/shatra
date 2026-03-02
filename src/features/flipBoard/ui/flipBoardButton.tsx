import { ShatraBoard } from "@/entities";
import { useFlipBoard } from "../context/flipBoard.Context";

interface FlipBoardButtonProps {
    board: ShatraBoard;
    onFlip?: (flippedBoard: ShatraBoard) => void;
}

const FlipBoardButton: React.FC<FlipBoardButtonProps> = ({ board, onFlip }) => {

    const { handleFlip } = useFlipBoard();

    const handleClick = () => {
        const newBoard = board.clone();
        newBoard.flip();

        handleFlip();

        onFlip?.(newBoard);
    }

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-15 right-55 z-50 px-4 py-2  text-black rounded  transition-colors cursor-pointer"
        >
            {board.isFlipped ? '🔄Вид за белых' : '🔄Вид за чёрных'}
        </button>
    );
};

export { FlipBoardButton };