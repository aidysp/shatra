import { Cell } from "../Cell";
import { Colors } from "../config/Colors";
import { Figures } from "../config/Figures";
import { Figure } from "./Figure";


export class Shatra extends Figure {
    logo: Figures;

    constructor(id: string, color: Colors) {
        super(id, color);
        this.logo = Figures.Shatra;
    }

    canMove(from: Cell, to: Cell): boolean {
        const possibleMoves = this.getPossibleMoves(from);
        return possibleMoves.some(move => move.x === to.x && move.y === to.y);
    }

    getPossibleMoves(from: Cell): { x: number, y: number }[] {
        const direction = this.color === Colors.BLACK ? 1 : -1;

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
}