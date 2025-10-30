import { Cell } from "../Cell";
import { Figures } from "../config/Figures";
import { Player } from "../config/Player";
import { DirectionUtils } from "../utils/DirectionUtils";
import { Figure } from "./Figure";



export class Biy extends Figure {
    logo: Figures;

    constructor(id: string, color: Player) {
        super(id, color);
        this.logo = Figures.Biy;
    }

    // canMove(from: Cell, to: Cell): boolean {
    //     const possibleMoves = this.getPossibleMoves(from);
    //     return possibleMoves.some(move => move.x === to.x && move.y === to.y);
    // }

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
            { x: from.x + 1, y: from.y },
            // Bottom
            { x: from.x, y: from.y - direction },
            // Left-bottom
            { x: from.x - 1, y: from.y - direction },
            // Right-bottom
            { x: from.x + 1, y: from.y - direction },
        ];
    }

    getCaptureDirections(): { dx: number, dy: number }[] {
        const forwardDirection = DirectionUtils.getPlayerDirection(this.color);
        const backwardDirection = -forwardDirection;

        return [
            // Forward through the shape
            { dx: 0, dy: forwardDirection * 2 },
            // Left-forward through the shape 
            { dx: -2, dy: forwardDirection * 2 },
            // Right-forward through the shape
            { dx: 2, dy: forwardDirection * 2 },
            // Backward through the shape
            { dx: 0, dy: backwardDirection * 2 },
            // Left-backward through the 
            { dx: -2, dy: backwardDirection * 2 },
            // Right-back through the shape
            { dx: 2, dy: backwardDirection * 2 },
            // Left through the shape 
            { dx: -2, dy: 0 },
            // Right through the shape 
            { dx: 2, dy: 0 }
        ]
    }

}