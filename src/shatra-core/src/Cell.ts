import { Colors } from "./config/Colors";

import { Figure } from "./Figures/Figure";



export class Cell {
    id: number;
    x: number;
    y: number;
    color: Colors;
    figure: Figure | null;

    constructor(
        id: number,
        x: number,
        y: number,
        color: Colors,
        figure: Figure | null,
    ) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.color = color;
        this.figure = figure;
    }
}