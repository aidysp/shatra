interface FlipBoardButtonProps {
    isFlipped: boolean;
    onFlip: () => void;
}

const FlipBoardButton: React.FC<FlipBoardButtonProps> = ({ isFlipped, onFlip }) => {
    return (
        <button
            onClick={onFlip}
            className="fixed top-4 left-4 z-50 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
            {isFlipped ? '◉ Вид за белых' : '◉ Вид за чёрных'}
        </button>
    );
};

export { FlipBoardButton };