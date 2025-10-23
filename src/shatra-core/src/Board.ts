import { Cell } from "./Cell";
import { Colors } from "./config/Colors";
import { GameState } from "./config/GameState";
import { Player } from "./config/Player";
// import { Biy } from "./Figures/Biy";
import { Figure } from "./Figures/Figure";
import { Shatra } from "./Figures/Shatra";


export class Board {
    protected cells: Cell[] = [];
    protected whiteFigures: Cell[] = [];
    protected blackFigures: Cell[] = [];
    private __currentPlayer: Player = Player.WHITE;
    private __gameState: GameState = GameState.NORMAL;
    private captureSession?: {
        activeFigure: Cell;
        capturedFigures: Cell[];
    }

    private addFigureToColorArray(cell: Cell): void {
        if (!cell.figure) return;

        if (cell.figure.color === Player.WHITE) {
            this.whiteFigures.push(cell);
        } else {
            this.blackFigures.push(cell);
        }
    }

    private removeFigureFromColorArray(cell: Cell): void {
        if (!cell.figure) return;

        const array = cell.figure.color === Player.WHITE ? this.whiteFigures : this.blackFigures;
        const index = array.findIndex(c => c.id === cell.id);
        if (index !== -1) array.splice(index, 1);
    }



    private isValidCaptureMoveWithMiddle(from: Cell, targetCell: Cell, middleCell: Cell): boolean {
        if (!from.figure) return false;
        if (!middleCell.figure) return false;

        if (this.captureSession?.capturedFigures.includes(middleCell)) return false;

        if (middleCell.figure.color === from.figure.color) return false;
        if (targetCell.figure !== null) return false;

        return true;
    }

    private isValidCaptureMove(from: Cell, to: Cell): boolean {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const middleX = from.x + dx / 2;
        const middleY = from.y + dy / 2;

        const middleCell = this.getCell(middleX, middleY);

        return middleCell ? this.isValidCaptureMoveWithMiddle(from, to, middleCell) : false;
    }


    private isValidNormalMove(from: Cell, to: Cell): boolean {
        if (!from.figure) return false;
        if (from === to) return false;
        if (to.figure !== null) return false;
        if (from.figure.color !== this.currentPlayer) return false;

        return from.figure.canMove(from, to);
    }

    public get currentPlayer(): Player {
        return this.__currentPlayer;
    }

    public get gameState(): GameState {
        return this.__gameState;
    }

    public get getCells(): Cell[] {
        return this.cells;
    }



    public switchPlayer(): void {


        this.__currentPlayer = this.__currentPlayer === Player.BLACK ? Player.WHITE : Player.BLACK;

        console.log('New current:', this.__currentPlayer);
    }



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

    public printCells() {
        console.log(this.cells);
    }

    public initFigures() {
        this.whiteFigures = [];
        this.blackFigures = [];

        this.cells.map(cell => {
            if (cell.id < 25 && cell.id != 10) {
                cell.figure = new Shatra((cell.x + "_" + cell.y), Player.BLACK);
                this.addFigureToColorArray(cell);
            }
            if (cell.id > 38 && cell.id != 53) {
                cell.figure = new Shatra((cell.x + "_" + cell.y), Player.WHITE);
                this.addFigureToColorArray(cell);
            }
            // if (cell.id == 10) cell.figure = new Biy((cell.x + "_" + cell.y), Player.BLACK);
            // if (cell.id == 53) cell.figure = new Biy((cell.x + "_" + cell.y), Player.WHITE);
        })
    }



    public clone(): Board {
        const newBoard = new Board();
        newBoard.cells = this.cells.map(cell =>
            new Cell(cell.id, cell.x, cell.y, cell.color, cell.figure)
        );

        newBoard.whiteFigures = [];
        newBoard.blackFigures = [];


        newBoard.cells.forEach(cell => {
            if (cell.figure?.color === Player.WHITE) {
                newBoard.whiteFigures.push(cell);
            } else if (cell.figure?.color === Player.BLACK) {
                newBoard.blackFigures.push(cell);
            }
        });

        newBoard.__currentPlayer = this.__currentPlayer;
        newBoard.__gameState = this.__gameState;

        if (this.captureSession) {
            newBoard.captureSession = {
                activeFigure: newBoard.getCellById(this.captureSession.activeFigure.id)!,
                capturedFigures: this.captureSession.capturedFigures.map(cell =>
                    newBoard.getCellById(cell.id)!
                )
            };
        }


        return newBoard;
    }

    public getCell(x: number, y: number): Cell | null {
        return this.cells.find(cell => cell.x === x && cell.y === y) || null;
    }

    public getCellById(id: number): Cell | null {
        return this.cells.find(cell => cell.id === id) || null;
    }

    public makeMove(from: Cell, to: Cell): boolean {
        if (!this.isValidMove(from, to)) return false;


        if (this.isValidCaptureMove(from, to)) {
            if (this.gameState !== GameState.ACTIVE_CAPTURE_CHAIN) {
                const chainStarted = this.startCaptureChain(from);
                if (!chainStarted) return false;
            }

            const success = this.continueCaptureChain(to);

            if (success && !this.canContinueCapture()) this.finishCaptureChain();

            return success;
        }

        if (this.hasForcedCapture()) return false;

        to.figure = from.figure;
        from.figure = null;
        this.switchPlayer();

        return true;
    }

    public setFigure(cellId: number, figure: Figure) {
        const cell = this.cells.find(cell => cell.id == cellId);
        cell!.figure = figure;
    }

    isValidMove(from: Cell, to: Cell): boolean {
        if (!from.figure) return false;
        if (from === to) return false;
        if (to.figure !== null) return false;

        if (from.figure.color !== this.currentPlayer) return false;


        const isNormalMove = to.figure === null && from.figure.canMove(from, to);
        if (isNormalMove) return true;

        const isCaptureMove = this.isValidCaptureMove(from, to);
        if (isCaptureMove) return true;

        return false;

    }


    public getAvailableMoves(from: Cell): Cell[] {
        if (!from.figure) return [];



        if (this.gameState == GameState.ACTIVE_CAPTURE_CHAIN) {
            if (!this.captureSession) {
                console.warn('No active capture session');
                this.__gameState = GameState.NORMAL; // Восстанавливаем состояние
                return [];
            }

            // Показываем ходы только если это активная фигура из цепочки захвата
            if (from.id === this.captureSession.activeFigure.id) {
                return this.getCaptureMoves(this.captureSession.activeFigure);
            } else {
                return []; // Для других фигур - нет доступных ходов
            }
        }

        if (from.figure.color === this.__currentPlayer && this.hasForcedCapture()) return this.getCaptureMoves(from);

        return this.getNormalMoves(from);
    }

    public getNormalMoves(from: Cell): Cell[] {
        if (!from.figure) return [];

        const normalMoves: Cell[] = [];
        const possibleCoords = from.figure.getPossibleMoves(from);


        possibleCoords.forEach(coord => {
            const targetCell = this.getCell(coord.x, coord.y);
            if (targetCell && this.isValidNormalMove(from, targetCell)) {
                normalMoves.push(targetCell);
            }
        });


        return normalMoves;
    }

    public hasForcedCapture(): boolean {
        if (this.gameState === GameState.ACTIVE_CAPTURE_CHAIN) {
            return false;
        }

        const result = this.getFiguresWithCaptures().length > 0;
        return result;
    }

    // Checking one figure that can capture
    public canFigureCapture(figureCell: Cell): boolean {
        if (!figureCell.figure) return false;



        if (figureCell.figure.color !== this.currentPlayer) return false;





        return this.getCaptureMoves(figureCell).length > 0;
    }

    // get all figures that can capture 
    public getFiguresWithCaptures(): Cell[] {
        const figuresWithCapture: Cell[] = [];

        const currentPlayerFigures = this.currentPlayer === Player.WHITE ? this.whiteFigures : this.blackFigures;

        currentPlayerFigures.forEach(cell => {
            if (this.canFigureCapture(cell)) {
                figuresWithCapture.push(cell);
            }
        });

        return figuresWithCapture;
    }

    // get the ability to jump over a figure
    public getCaptureMoves(from: Cell): Cell[] {
        if (!from.figure) return [];


        const captureMoves: Cell[] = [];
        const directions = from.figure.getCaptureDirections();



        directions.forEach(({ dx, dy }) => {
            const targetX = from.x + dx;
            const targetY = from.y + dy;
            const middleX = from.x + dx / 2;
            const middleY = from.y + dy / 2;

            const targetCell = this.getCell(targetX, targetY);
            const middleCell = this.getCell(middleX, middleY);

            // const isMiddleCellCaptured = middleCell && this.captureSession?.capturedFigures.includes(middleCell);




            if (targetCell && middleCell && this.isValidCaptureMoveWithMiddle(from, targetCell, middleCell)) {
                captureMoves.push(targetCell);
            }
        });




        return captureMoves;
    }

    // // start a capture chain
    public startCaptureChain(from: Cell): boolean {
        if (!this.canFigureCapture(from)) return false;

        this.captureSession = {
            activeFigure: from,
            capturedFigures: []
        }

        this.__gameState = GameState.ACTIVE_CAPTURE_CHAIN;


        return true;
    }

    // // continue the chain of capture
    public continueCaptureChain(to: Cell): boolean {
        if (!this.captureSession) {
            console.error('No capture session in continueCaptureChain');
            return false;
        }

        const from = this.captureSession.activeFigure;

        if (!this.isValidCaptureMove(from, to)) {
            console.log('Invalid capture move in continueCaptureChain');
            return false;
        }

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const middleX = from.x + dx / 2;
        const middleY = from.y + dy / 2;
        const middleCell = this.getCell(middleX, middleY);

        if (!middleCell?.figure) return false;

        this.captureSession.capturedFigures.push(middleCell);

        to.figure = from.figure;
        from.figure = null;

        this.captureSession.activeFigure = to;

        return true;
    }

    public canContinueCapture(): boolean {
        if (!this.captureSession) return false;

        const currentPosition = this.captureSession.activeFigure;

        return this.getCaptureMoves(currentPosition).length > 0;
    }

    public finishCaptureChain(): void {
        if (!this.captureSession) return;

        this.captureSession.capturedFigures.forEach(cell => {
            if (cell.figure) {
                this.removeFigureFromColorArray(cell);
            }
            cell.figure = null;
        }
        );

        this.captureSession = undefined;

        this.__gameState = GameState.NORMAL;
        this.switchPlayer();
    }
}

