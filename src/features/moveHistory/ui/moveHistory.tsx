import { MoveRecord } from "@/entities/shatra/board/model/ShatraBoard";
import { useEffect, useRef, useState } from "react";

interface MoveHistoryProps {
    moves: MoveRecord[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
    const [isMobile, setIsMobile] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const movePairs = [];
    for (let i = 0; i < moves.length; i += 2) {
        movePairs.push({
            number: Math.floor(i / 2) + 1,
            white: moves[i],
            black: moves[i + 1]
        });
    }

    if (isMobile) {
        return (
            <div className="absolute top-0 left-0 right-0 px-0 z-50">
                <div className="bg-white/95 backdrop-blur-sm  shadow-lg border border-gray-200 py-0">


                    <div
                        ref={scrollContainerRef}
                        className="overflow-x-auto scrollbar-hide px-2"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <div className="flex gap-0 min-w-min">
                            {movePairs.map((pair) => (
                                <div key={pair.number} className="flex gap-2 bg-white  p-0 min-w-[140px] border border-gray-100">

                                    {/* <span className="text-gray-400 font-medium text-xs">
                                        {pair.number}.
                                    </span> */}

                                    {pair.white && (
                                        <div className="flex items-center gap-0.5">
                                            <span className={`text-sm font-medium ${pair.white.isChain ? 'text-purple-600' : 'text-gray-900'
                                                }`}>
                                                {pair.white.notation}
                                            </span>
                                            {pair.white.isChain && (
                                                <span className="text-purple-500 text-xs">⚡</span>
                                            )}
                                        </div>
                                    )}

                                    <span className="text-gray-300">/</span>


                                    {pair.black && (
                                        <div className="flex items-center gap-0">
                                            <span className={`text-sm font-medium ${pair.black.isChain ? 'text-purple-600' : 'text-gray-900'
                                                }`}>
                                                {pair.black.notation}
                                            </span>
                                            {pair.black.isChain && (
                                                <span className="text-purple-500 text-xs">⚡</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {moves.length === 0 && (
                                <div className="text-sm text-gray-400 italic py-2 px-3">
                                    Ходов пока нет
                                </div>
                            )}
                        </div>
                    </div>


                </div>
            </div>
        );
    }

    return (
        <div className="absolute top-[10px] right-30 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">
                История ходов
            </div>

            <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-[50px_1fr_1fr] px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                    <div>№</div>
                    <div>Белые</div>
                    <div>Чёрные</div>
                </div>

                <div className="divide-y divide-gray-100">
                    {movePairs.map((pair) => (
                        <div
                            key={pair.number}
                            className="grid grid-cols-[50px_1fr_1fr] px-3 py-2 hover:bg-gray-50"
                        >
                            <div className="text-gray-500">{pair.number}.</div>

                            {pair.white && (
                                <div className="px-1 py-0.5 rounded text-gray-900 flex items-center gap-1">
                                    <span>{pair.white.notation}</span>
                                    {pair.white.isChain && (
                                        <span className="text-purple-500 text-sm">⚡</span>
                                    )}
                                </div>
                            )}

                            {pair.black && (
                                <div className="px-1 py-0.5 rounded text-gray-900 flex items-center gap-1">
                                    <span>{pair.black.notation}</span>
                                    {pair.black.isChain && (
                                        <span className="text-purple-500 text-sm">⚡</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {moves.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                    Всего ходов: {Math.ceil(moves.length / 2)}
                </div>
            )}
        </div>
    )
}

export { MoveHistory };