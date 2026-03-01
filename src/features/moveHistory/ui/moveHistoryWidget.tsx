import { MoveInfo } from "@/entities/shatra/gameHistory/model/ShatraGameHistory";

interface moveHistoryProps {
    moves: MoveInfo[];
}


const MoveHistory: React.FC<moveHistoryProps> = ({ moves }) => {
    return (
        <div style={{
            position: 'absolute',
            top: '70px',
            left: '10px'
        }}>
            <h4>История ходов:</h4>
            <div>
                {moves.map((move, index) => (

                    <div
                        key={index}
                        // onClick={() => handleMoveClick(move.index)}
                        style={{
                            padding: '5px',
                            cursor: 'pointer',
                            // backgroundColor: currentMoveIndex === move.index ? '#e3f2fd' : 'transparent',
                            borderBottom: '1px solid #eee'
                        }}
                    >
                        {Math.ceil((index + 1) / 2)}.
                        {move.notation}
                    </div>
                ))}
            </div>
        </div>
    )
}

export { MoveHistory }