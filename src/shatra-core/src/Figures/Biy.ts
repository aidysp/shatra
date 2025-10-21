import { Cell } from "../Cell";
import { Colors } from "../config/Colors";
import { Figures } from "../config/Figures";
import { Figure } from "./Figure";





export class Biy extends Figure {
    logo: Figures;

    constructor(id: string, color: Colors) {
        super(id, color);
        this.logo = Figures.Biy;
    }

    canMove(from: Cell, to: Cell): boolean {
        return false;
    }

    getPossibleMoves(from: Cell): { x: number; y: number; }[] {
        return [{ x: 1, y: 1 }];
    }
}