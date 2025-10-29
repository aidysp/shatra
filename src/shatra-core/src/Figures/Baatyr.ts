import { Cell } from "../Cell";
import { Colors } from "../config/Colors";
import { Figures } from "../config/Figures";
import { Player } from "../config/Player";
import { DirectionUtils } from "../utils/DirectionUtils";
import { Figure } from "./Figure";





export class Baatyr extends Figure {
    logo: Figures;

    constructor(id: string, color: Player) {
        super(id, color);
        this.logo = Figures.Baatyr;
    }

    canMove(from: Cell, to: Cell): boolean {
        const possibleMoves = this.getPossibleMoves(from);
        return possibleMoves.some(move => move.x === to.x && move.y === to.y);
    }

    getPossibleMoves(from: Cell): { x: number, y: number }[] {
        const direction = DirectionUtils.getPlayerDirection(this.color);

        return [
            // Forward
            { x: from.x, y: from.y + direction },
            // Left-forward
            { x: from.x - 1, y: from.y + direction },
            // Right-forward
            { x: from.x + 1, y: from.y + direction },
            // Left
            { x: from.x - 1, y: from.y },
            // Right
            { x: from.x + 1, y: from.y }
        ];
    }

    getCaptureDirections(): { dx: number, dy: number }[] {
        const forwardDirection = DirectionUtils.getPlayerDirection(this.color);
        const backwardDirection = -forwardDirection;

        return [
            // Вперед через фигуру
            { dx: 0, dy: forwardDirection * 2 },
            // Влево-вперед через фигуру  
            { dx: -2, dy: forwardDirection * 2 },
            // Вправо-вперед через фигуру
            { dx: 2, dy: forwardDirection * 2 },

            // Назад через фигуру
            { dx: 0, dy: backwardDirection * 2 },
            // Влево-назад через фигуру
            { dx: -2, dy: backwardDirection * 2 },
            // Вправо-назад через фигуру
            { dx: 2, dy: backwardDirection * 2 },

            // Влево через фигуру (горизонтально)
            { dx: -2, dy: 0 },
            // Вправо через фигуру (горизонтально)
            { dx: 2, dy: 0 }
        ]
    }
}