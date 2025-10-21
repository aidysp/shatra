// src/utils/BoardVisualizer.ts
import { Board } from "../Board";
import { Colors } from "../config/Colors";
import { Shatra } from "../Figures/Shatra";
import { Biy } from "../Figures/Biy";

export class BoardVisualizer {
    static printBoard(board: Board, forPlayer: Colors = Colors.BLACK): void {
        console.log('=== ДОСКА ШАТРА ===');
        console.log(`Вид для: ${forPlayer === Colors.BLACK ? 'ЧЕРНЫХ (снизу)' : 'БЕЛЫХ (снизу)'}`);

        // Определяем порядок строк в зависимости от игрока
        const rowOrder = forPlayer === Colors.BLACK
            ? Array.from({ length: 14 }, (_, i) => i) // Черные видят снизу (Y=0-13)
            : Array.from({ length: 14 }, (_, i) => 13 - i); // Белые видят снизу (Y=13-0)

        for (const y of rowOrder) {
            let row = `Y=${y.toString().padStart(2)}: `;

            for (let x = 0; x <= 6; x++) {
                const cell = board.getCell(x, y);

                if (!cell) {
                    row += '[ ] ';
                } else if (cell.figure instanceof Shatra) {
                    // Для черных: B снизу, W сверху. Для белых: наоборот
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

    // Метод для отображения с белыми снизу
    static printBoardForWhite(board: Board): void {
        this.printBoard(board, Colors.WHITE);
    }

    // Метод для отображения с черными снизу (по умолчанию)
    static printBoardForBlack(board: Board): void {
        this.printBoard(board, Colors.BLACK);
    }
}