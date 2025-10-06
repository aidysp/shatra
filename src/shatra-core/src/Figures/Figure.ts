
import { Cell } from "../Cell";
import { Colors } from "../config/Colors";
import { Figures } from "../config/Figures";


export class Figure {
    id: string;
    color: Colors;
    logo: Figures | null

    constructor(id: string, color: Colors) {
        this.id = id;
        this.color = color;
        this.logo = null;
    }


    canMove(from: Cell, to: Cell): boolean {
        return to !== null && from != to;
    }
}