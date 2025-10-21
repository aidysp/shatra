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



    public clone(): Board {
        const newBoard = new Board();
        newBoard.cells = this.cells.map(cell =>
            new Cell(cell.id, cell.x, cell.y, cell.color, cell.figure)
        );
        return newBoard;
    }

    public getCell(x: number, y: number): Cell | null {
        return this.cells.find(cell => cell.x === x && cell.y === y) || null;
    }

    public getCellById(id: number): Cell | null {
        return this.cells.find(cell => cell.id === id) || null;
    }

    public makeMove(from: Cell, to: Cell): boolean {
        if (!this.isValidMove(from, to)) {
            return false;
        }

        to.figure = from.figure;
        from.figure = null;

        return true;
    }

    isValidMove(from: Cell, to: Cell): boolean {
        if (!from.figure) return false;
        if (from === to) return false;


        if (!from.figure.canMove(from, to)) {
            return false;
        }

        if (to.figure !== null) {
            return false;
        }

        return true;
    }


    public getAvailableMoves(from: Cell): Cell[] {
        if (!from.figure) return [];

        const availableMoves: Cell[] = [];
        const possibleCoords = from.figure.getPossibleMoves(from);


        possibleCoords.forEach(coord => {
            const targetCell = this.getCell(coord.x, coord.y);
            if (targetCell && this.isValidMove(from, targetCell)) {
                availableMoves.push(targetCell);
            }
        });


        return availableMoves;
    }

}

