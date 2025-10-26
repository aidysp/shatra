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
    private lastMoves: {
        [Player.WHITE]: { from: Cell; to: Cell; figureId: string; } | null;
        [Player.BLACK]: { from: Cell; to: Cell; figureId: string; } | null;

    } = {
            [Player.WHITE]: null,
            [Player.BLACK]: null
        }

    private reserveState: {
        [Player.WHITE]: {
            nextPosition: { x: number, y: number } | null;
            orderViolated: boolean;
            count: number;
        };
        [Player.BLACK]: {
            nextPosition: { x: number, y: number } | null;
            orderViolated: boolean;
            count: number;

        };
    } = {
            [Player.WHITE]: {
                nextPosition: null,
                orderViolated: false,
                count: 9
            },
            [Player.BLACK]: {
                nextPosition: null,
                orderViolated: false,
                count: 9
            }
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

    private updateReserveOrderState(): void {
        for (const player of [Player.WHITE, Player.BLACK]) {
            const playerState = this.reserveState[player];

            const reservePositions = player === Player.BLACK
                ? [
                    { x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 },
                    { x: 4, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 1 },
                    { x: 4, y: 0 }, { x: 3, y: 0 }, { x: 2, y: 0 }
                ]
                : [
                    { x: 2, y: 11 }, { x: 3, y: 11 }, { x: 4, y: 11 },
                    { x: 2, y: 12 }, { x: 3, y: 12 }, { x: 4, y: 12 },
                    { x: 2, y: 13 }, { x: 3, y: 13 }, { x: 4, y: 13 }
                ];


            playerState.count = reservePositions.filter(pos => {
                const cell = this.getCell(pos.x, pos.y);
                return cell?.figure && cell.figure.color === player;
            }).length;


            if (playerState.count === 0) {
                playerState.orderViolated = false;
                playerState.nextPosition = null;
                continue;
            }

            const { orderViolated, nextPosition } = this.checkReserveOrder(player);

            playerState.orderViolated = orderViolated;
            playerState.nextPosition = nextPosition;
        }
    }



    private handleReserveExtraction(from: Cell, to: Cell): boolean {
        if (!from.figure) return false;

        const player = from.figure.color;
        const playerState = this.reserveState[player];



        if (!playerState.orderViolated && !this.isReserveTurn(from)) {
            return false;
        }

        if (!playerState.nextPosition ||
            playerState.nextPosition.x !== from.x ||
            playerState.nextPosition.y !== from.y) {
            return false;
        }

        const availableExtractionMoves = this.getEmptyMiddleZoneCells(player);
        if (!availableExtractionMoves.some(cell => cell.id === to.id)) {
            return false;
        }

        to.figure = from.figure;
        from.figure = null;

        this.updateReserveOrderState();



        this.lastMoves[this.currentPlayer] = {
            from: from,
            to: to,
            figureId: to.figure.id
        };

        this.switchPlayer();
        return true;
    }

    private isReserveExtractionMove(from: Cell, to: Cell): boolean {
        if (!from.figure) return false;

        const nextPos = this.reserveState[from.figure.color].nextPosition;
        if (!nextPos) return false;

        return nextPos.x === from.x &&
            nextPos.y === from.y &&
            this.getEmptyMiddleZoneCells(from.figure.color).some(cell => cell.id === to.id);
    }



    private isValidCaptureMoveWithMiddle(from: Cell, targetCell: Cell, middleCell: Cell): boolean {
        if (!from.figure) return false;
        if (!middleCell.figure) return false;

        if (this.captureSession?.capturedFigures.includes(middleCell)) return false;

        if (middleCell.figure.color === from.figure.color) return false;
        if (targetCell.figure !== null) return false;

        if (this.isOwnFortress(targetCell, from.figure.color) && !this.isReserveFigure(from)) {
            return false;
        }


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

    private isOwnFortress(cell: Cell, player: Player): boolean {
        if (player === Player.BLACK) {
            return cell.y <= 3;
        } else {
            return cell.y >= 10;
        }
    }

    private isReserveFigure(cell: Cell): boolean {
        if (!cell.figure) return false;
        return this.isOwnFortress(cell, cell.figure.color);
    }

    private checkReserveOrder(player: Player): { orderViolated: boolean; nextPosition: { x: number, y: number } | null } {

        if (this.reserveState[player].count === 0) {
            return { orderViolated: false, nextPosition: null };
        }

        const reservePositions = player === Player.BLACK
            ? [
                { x: 3, y: 3 },
                { x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 },
                { x: 4, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 1 },
                { x: 4, y: 0 }, { x: 3, y: 0 }, { x: 2, y: 0 }
            ]
            : [
                { x: 3, y: 10 },
                { x: 2, y: 11 }, { x: 3, y: 11 }, { x: 4, y: 11 },
                { x: 2, y: 12 }, { x: 3, y: 12 }, { x: 4, y: 12 },
                { x: 2, y: 13 }, { x: 3, y: 13 }, { x: 4, y: 13 }
            ];

        let foundFigure = false;
        let nextPosition: { x: number, y: number } | null = null;

        for (let i = 0; i < reservePositions.length; i++) {
            const pos = reservePositions[i];
            const cell = this.getCell(pos.x, pos.y);

            if (cell?.figure && cell.figure.color === player) {
                if (!foundFigure) {
                    foundFigure = true;
                    nextPosition = { x: pos.x, y: pos.y };
                }
            } else {
                if (foundFigure) {
                    return { orderViolated: true, nextPosition };
                }
            }
        }

        return { orderViolated: false, nextPosition };
    }

    private isEnemyFortress(from: Cell): boolean {
        if (!from.figure) return false;

        return from.figure?.color === Player.WHITE ? from.y <= 3 : from.y >= 10

    }

    private isReserveTurn(cell: Cell): boolean {
        if (!cell.figure) return false;

        const playerState = this.reserveState[cell.figure.color];
        const nextPos = playerState.nextPosition;

        if (!nextPos) return false;

        return cell.figure.color === this.__currentPlayer &&
            nextPos.x === cell.x &&
            nextPos.y === cell.y;
    }

    private getEmptyMiddleZoneCells(color: Player): Cell[] {
        let minY: number, maxY: number;

        if (color === Player.WHITE) {
            minY = 7;
            maxY = 9;
        } else {
            minY = 4;
            maxY = 6;
        }

        return this.cells.filter(cell =>
            cell.y >= minY &&
            cell.y <= maxY &&
            cell.figure === null
        );
    }



    private isValidNormalMove(from: Cell, to: Cell): boolean {
        if (!from.figure) return false;
        if (from === to) return false;
        if (to.figure !== null) return false;
        if (from.figure.color !== this.currentPlayer) return false;

        const playerLastMove = this.lastMoves[this.currentPlayer];


        if (playerLastMove && from.figure.id === playerLastMove.figureId) {
            if (to.id === playerLastMove.from.id) {
                return false;
            }
        }

        const isExtractionMove = this.isEnemyFortress(from) &&
            this.getEmptyMiddleZoneCells(from.figure.color === Player.WHITE ? Player.BLACK : Player.WHITE)
                .some(cell => cell.id === to.id);


        if (isExtractionMove) {
            return true;
        }

        if (this.isOwnFortress(to, from.figure.color)) {
            return false;
        }



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
        });

        this.updateReserveOrderState();
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

        newBoard.reserveState = {
            [Player.WHITE]: {
                nextPosition: this.reserveState[Player.WHITE].nextPosition ?
                    { ...this.reserveState[Player.WHITE].nextPosition! } : null,
                orderViolated: this.reserveState[Player.WHITE].orderViolated,
                count: this.reserveState[Player.WHITE].count
            },
            [Player.BLACK]: {
                nextPosition: this.reserveState[Player.BLACK].nextPosition ?
                    { ...this.reserveState[Player.BLACK].nextPosition! } : null,
                orderViolated: this.reserveState[Player.BLACK].orderViolated,
                count: this.reserveState[Player.BLACK].count
            }
        };

        newBoard.lastMoves = {
            [Player.WHITE]: this.lastMoves[Player.WHITE] ? {
                from: newBoard.getCellById(this.lastMoves[Player.WHITE]!.from.id)!,
                to: newBoard.getCellById(this.lastMoves[Player.WHITE]!.to.id)!,
                figureId: this.lastMoves[Player.WHITE]!.figureId
            } : null,
            [Player.BLACK]: this.lastMoves[Player.BLACK] ? {
                from: newBoard.getCellById(this.lastMoves[Player.BLACK]!.from.id)!,
                to: newBoard.getCellById(this.lastMoves[Player.BLACK]!.to.id)!,
                figureId: this.lastMoves[Player.BLACK]!.figureId
            } : null
        };


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

            if (success && !this.canContinueCapture()) {

                this.finishCaptureChain();
            }

            this.updateReserveOrderState();

            return success;
        }

        if (this.hasForcedCapture()) return false;

        if (this.isReserveExtractionMove(from, to)) {
            const result = this.handleReserveExtraction(from, to);
            this.updateReserveOrderState();
            return result;
        }



        to.figure = from.figure;
        from.figure = null;

        this.lastMoves[this.currentPlayer] = {
            from: from,
            to: to,
            figureId: to.figure!.id
        }

        this.switchPlayer();

        this.updateReserveOrderState();

        return true;
    }

    public setFigure(cellId: number, figure: Figure) {
        const cell = this.cells.find(cell => cell.id == cellId);

        if (cell!.figure) {
            this.removeFigureFromColorArray(cell!);
        }

        cell!.figure = figure;

        this.addFigureToColorArray(cell!);
        this.updateReserveOrderState();
    }

    public isValidMove(from: Cell, to: Cell): boolean {
        if (!from.figure) return false;
        if (from === to) return false;
        if (to.figure !== null) return false;
        if (from.figure.color !== this.currentPlayer) return false;
        if (this.isReserveExtractionMove(from, to)) return true;


        const isNormalMove = to.figure === null && from.figure.canMove(from, to);
        if (isNormalMove) return true;

        const isExtractionMove = this.isEnemyFortress(from) &&
            this.getEmptyMiddleZoneCells(from.figure.color === Player.WHITE ? Player.BLACK : Player.WHITE)
                .some(cell => cell.id === to.id);

        if (isExtractionMove) {
            return true;
        }





        const isCaptureMove = this.isValidCaptureMove(from, to);
        if (isCaptureMove) return true;

        return false;

    }


    public getAvailableMoves(from: Cell): Cell[] {
        if (!from.figure) return [];



        if (this.gameState == GameState.ACTIVE_CAPTURE_CHAIN) {
            if (!this.captureSession) {
                console.warn('No active capture session');
                this.__gameState = GameState.NORMAL;
                return [];
            }


            if (from.id === this.captureSession.activeFigure.id) {
                return this.getCaptureMoves(this.captureSession.activeFigure);
            } else {
                return [];
            }
        }

        if (from.figure.color === this.__currentPlayer && this.hasForcedCapture()) return this.getCaptureMoves(from);



        const hasCaptureForThisFigure = this.getCaptureMoves(from).length > 0;
        const hasAnyForcedCapture = this.getFiguresWithCaptures().length > 0;


        if (hasAnyForcedCapture) {
            if (hasCaptureForThisFigure) {
                return this.getCaptureMoves(from);
            }
            return [];
        }

        const playerState = this.reserveState[from.figure.color];

        if (playerState.orderViolated) {

            if (this.isReserveTurn(from)) {
                const moves = this.getEmptyMiddleZoneCells(from.figure.color);
                return moves;
            }
            return [];
        }



        if (this.isReserveTurn(from)) {
            return this.getEmptyMiddleZoneCells(this.__currentPlayer);
        }

        if (from.figure.color === this.__currentPlayer && this.isEnemyFortress(from)) {
            return this.getEmptyMiddleZoneCells(from.figure.color === Player.WHITE ? Player.BLACK : Player.WHITE).concat(this.getNormalMoves(from));
        }



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


    public canFigureCapture(figureCell: Cell): boolean {
        if (!figureCell.figure) return false;
        if (figureCell.figure.color !== this.currentPlayer) return false;

        return this.getCaptureMoves(figureCell).length > 0;
    }


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

            if (targetCell && middleCell && this.isValidCaptureMoveWithMiddle(from, targetCell, middleCell)) {
                captureMoves.push(targetCell);
            }
        });

        return captureMoves;
    }


    public startCaptureChain(from: Cell): boolean {
        if (!this.canFigureCapture(from)) return false;

        this.captureSession = {
            activeFigure: from,
            capturedFigures: []
        }

        this.__gameState = GameState.ACTIVE_CAPTURE_CHAIN;


        return true;
    }


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

