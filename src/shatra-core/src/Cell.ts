import { Colors } from "./config/Colors";
import { Player } from "./config/Player";

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

    public isOwnFortress(player: Player): boolean {
        if (player === Player.BLACK) {
            return this.y <= 3;
        } else {
            return this.y >= 10;
        }
    }

    public isReserveFigure(): boolean {
        if (!this.figure) return false;
        return this.isOwnFortress(this.figure.color);
    }

    public isEnemyFortress(): boolean {
        if (!this.figure) return false;

        return this.figure?.color === Player.WHITE ? this.y <= 3 : this.y >= 10

    }

}