import { Cell } from "./Cell";
import { Colors } from "./config/Colors";
import { Biy } from "./Figures/Biy";
import { Shatra } from "./Figures/Shatra";


export class Board {
    cells: Cell[] = [];


    public initCells() {
        let id = 1;

        const boardStructure = [[2, 4], [2, 4], [2, 4], [3, 3], [0, 6], [0, 6], [0, 6], [0, 6], [0, 6], [0, 6], [3, 3], [2, 4], [2, 4], [2, 4]];

        boardStructure.forEach(([startX, endX], y) => {
            for (let x = startX; x <= endX; x++) {
                const color = (x + y) % 2 === 0 ? Colors.BLACK : Colors.WHITE;
                this.cells.push(new Cell(id++, x, y, color, null));
            }
        });
    }

    public initFigures() {
        this.cells.map(cell => {
            if (cell.id < 25 && cell.id != 10) cell.figure = new Shatra((cell.x + "_" + cell.y), Colors.BLACK)
            if (cell.id > 38 && cell.id != 53) cell.figure = new Shatra((cell.x + "_" + cell.y), Colors.WHITE)

            if (cell.id == 10) cell.figure = new Biy((cell.x + "_" + cell.y), Colors.BLACK);
            if (cell.id == 53) cell.figure = new Biy((cell.x + "_" + cell.y), Colors.WHITE);
        })
    }


    public showBoard() {
        console.log(this.cells);
        return this.cells;
    }

    public consoleBoard() {

        this.cells.forEach((e) => {
            console.log(e.figure);
        })
    }

    public moveTo(from: Cell, to: Cell) {
        to.figure = from.figure;
    }

}

