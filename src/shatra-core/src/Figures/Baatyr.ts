import { Board } from "../Board";
import { Cell } from "../Cell";
import { Figures } from "../config/Figures";
import { Player } from "../config/Player";
import { Figure } from "./Figure";


export class Baatyr extends Figure {
    logo: Figures;

    constructor(id: string, color: Player) {
        super(id, color);
        this.logo = Figures.Baatyr;
    }


    getPossibleMoves(from: Cell, board: Board): { x: number, y: number }[] {
        const moves: { x: number, y: number }[] = [];

        const directions = [
            { dx: 0, dy: -1 }, // top
            { dx: 0, dy: 1 }, // bottom
            { dx: -1, dy: 0 }, // left
            { dx: 1, dy: 0 }, // right

            { dx: -1, dy: -1 }, // top-left
            { dx: 1, dy: -1 }, // top-right
            { dx: -1, dy: 1 }, // botton-left
            { dx: 1, dy: 1 }, // bottom-right
        ];

        for (const direction of directions) {
            let distance = 1;

            while (true) {
                const targetX = from.x + direction.dx * distance;
                const targetY = from.y + direction.dy * distance;
                const targetCell = board.getCell(targetX, targetY);

                if (!targetCell) break;

                if (targetCell.figure) break;

                moves.push({ x: targetX, y: targetY });
                distance++;
            }
        }

        return moves;
    }


    getCaptureDirections(): { dx: number, dy: number }[] {
        return [];
    }
}