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

    public isEnemyBiyPosition(color: Player): boolean {
        if (color === Player.WHITE) {
            const result = this.x === 3 && this.y === 3;
            return result;
        } else {
            const result = this.x === 3 && this.y === 10;
            return result;
        }
    }

    public isBiyStartingPosition(color: Player): boolean {
        if (color === Player.WHITE) {
            return this.x === 3 && this.y === 10;
        } else {
            return this.x === 3 && this.y === 3;
        }
    }

    public isGate() {
        if (this.y === 10 && this.x === 3) return true;
        if (this.y === 3 && this.x === 3) return true;

        return false;
    }

}