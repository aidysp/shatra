
import { ShatraBoard as Board } from "../../board";
import { ShatraCell as Cell } from "../../cell";
import { Figures, Player } from "../../config";


export abstract class Figure {
    id: string;
    color: Player;
    logo: Figures | null

    constructor(id: string, color: Player) {
        this.id = id;
        this.color = color;
        this.logo = null;
    }

    abstract getPossibleMoves(from: Cell, board: Board): { x: number, y: number }[];
    abstract getCaptureDirections(): { dx: number, dy: number }[];


}