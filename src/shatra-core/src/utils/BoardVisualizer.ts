// src/utils/BoardVisualizer.ts
import { Board } from "../Board";
import { Colors } from "../config/Colors";
import { Shatra } from "../Figures/Shatra";
import { Biy } from "../Figures/Biy";

export class BoardVisualizer {
    static printBoard(board: Board, forPlayer: Colors = Colors.BLACK): void {
        console.log('=== ДОСКА ШАТРА ===');
        console.log(`Вид для: ${forPlayer === Colors.BLACK ? 'ЧЕРНЫХ (снизу)' : 'БЕЛЫХ (снизу)'}`);


        const rowOrder = forPlayer === Colors.BLACK
            ? Array.from({ length: 14 }, (_, i) => i)
            : Array.from({ length: 14 }, (_, i) => 13 - i);

        for (const y of rowOrder) {
            let row = `Y=${y.toString().padStart(2)}: `;

            for (let x = 0; x <= 6; x++) {
                const cell = board.getCell(x, y);

                if (!cell) {
                    row += '[ ] ';
                } else if (cell.figure instanceof Shatra) {

                    const symbol = cell.figure.color === Colors.BLACK ? 'B' : 'W';
                    row += `[${symbol}] `;
                } else if (cell.figure instanceof Biy) {
                    const symbol = cell.figure.color === Colors.BLACK ? 'K' : 'Q';
                    row += `[${symbol}] `;
                } else if (cell.figure === null) {
                    row += '[•] ';
                } else {
                    row += '[?] ';
                }
            }

            console.log(row);
        }

        console.log('     X=0 X=1 X=2 X=3 X=4 X=5 X=6');
        console.log('Легенда: [B] - твоя шатра, [W] - вражеская шатра, [K] - твой бий, [Q] - вражеский бий');
    }


    static printBoardForWhite(board: Board): void {
        this.printBoard(board, Colors.WHITE);
    }


    static printBoardForBlack(board: Board): void {
        this.printBoard(board, Colors.BLACK);
    }
}