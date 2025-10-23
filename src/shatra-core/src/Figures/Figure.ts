
import { Cell } from "../Cell";
import { Figures } from "../config/Figures";
import { Player } from "../config/Player";


export abstract class Figure {
    id: string;
    color: Player;
    logo: Figures | null

    constructor(id: string, color: Player) {
        this.id = id;
        this.color = color;
        this.logo = null;
    }

    abstract canMove(from: Cell, to: Cell): boolean;
    abstract getPossibleMoves(from: Cell): { x: number, y: number }[];

    abstract getCaptureDirections(): { dx: number, dy: number }[];
}