import { Cell } from "./Cell";
import { Colors } from "./config/Colors";
import { GameState } from "./config/GameState";
import { Player } from "./config/Player";
import { Baatyr } from "./Figures/Baatyr";
import { Biy } from "./Figures/Biy";
import { Figure } from "./Figures/Figure";
import { Shatra } from "./Figures/Shatra";


export class Board {
    protected cells: Cell[] = [];
    protected whiteFigures: Cell[] = [];
    protected blackFigures: Cell[] = [];
    public __currentPlayer: Player = Player.WHITE;
    private __gameState: GameState = GameState.NORMAL;
    private activeWhiteBiyFigure: Cell | null = null;
    private activeBlackBiyFigure: Cell | null = null;
    private captureSession?: {
        activeFigure: Cell;
        capturedFigures: Cell[];
        reachedBiyPosition: boolean;
        biyRightsActivated: boolean;
    }
    private getActiveBiyFigure(color: Player): Cell | null {
        const result = color === Player.WHITE ? this.activeWhiteBiyFigure : this.activeBlackBiyFigure;
        return result;
    }
    private setActiveBiyFigure(color: Player, cell: Cell | null): void {
        if (color === Player.WHITE) {
            this.activeWhiteBiyFigure = cell;
        } else {
            this.activeBlackBiyFigure = cell;
        }
    }
    private clearActiveBiyFigure(color: Player): void {
        this.setActiveBiyFigure(color, null);
    }
    private finishBiyRightsSession(): void {
        if (!this.captureSession) return;

        this.captureSession.capturedFigures.forEach(cell => {
            if (cell.figure) {
                this.removeFigureFromColorArray(cell);
            }
            cell.figure = null;
        });


        const activeFigure = this.captureSession.activeFigure;
        this.setActiveBiyFigure(activeFigure.figure!.color, activeFigure);
        this.captureSession = undefined;
        this.__gameState = GameState.NORMAL;
        this.switchPlayer();
    }
    private checkForcedBiyMove(): void {
        if (this.__gameState !== GameState.NORMAL) return;



        const currentPlayer = this.__currentPlayer;
        const currentPlayerFigures = currentPlayer === Player.WHITE ? this.whiteFigures : this.blackFigures;
        const figuresOnEnemyBiyPosition = currentPlayerFigures.filter(cell => {
            return cell.isEnemyBiyPosition(currentPlayer) && cell.figure
        });


        if (figuresOnEnemyBiyPosition.length > 0) {
            const activeBiyFigure = figuresOnEnemyBiyPosition[0];
            const hasCaptureMoves = this.getCaptureMoves(activeBiyFigure).length > 0;

            if (hasCaptureMoves) {
                this.__gameState = GameState.BIY_FORCED_MOVE;
                this.setActiveBiyFigure(currentPlayer, activeBiyFigure);
                this.getActiveBiyFigure(currentPlayer);
            }
        }
    }
    private handleBiyRightsMove(from: Cell, to: Cell): boolean {

        if (!this.captureSession) {
            this.__gameState = GameState.NORMAL;
            return false;
        }

        if (from.id !== this.captureSession.activeFigure.id) {
            return false;
        }

        if (!from.figure) {
            return false;
        }

        if (from === to) {
            if (from.isEnemyBiyPosition(from.figure.color) || from.isGate()) {
                this.finishBiyRightsSession();
                return true;
            } else {
                return false;
            }
        }

        if (this.isValidCaptureMove(from, to)) {
            const success = this.continueCaptureChain(to);
            return success;
        }

        const extractionMoves = this.getEmptyMiddleZoneCells(from.figure.color === Player.WHITE ? Player.BLACK : Player.WHITE);
        if (extractionMoves.some(cell => cell.id === to.id)) {
            to.figure = from.figure;
            from.figure = null;

            this.lastMoves[this.currentPlayer] = {
                from: from,
                to: to,
                figureId: to.figure!.id
            };

            this.captureSession = undefined;
            this.__gameState = GameState.NORMAL;
            this.switchPlayer();
            return true;
        }

        return false;
    }
    private handleBiyForcedMove(from: Cell, to: Cell): boolean {

        const activeBiyFigure = this.getActiveBiyFigure(this.__currentPlayer);

        if (activeBiyFigure && from.id === activeBiyFigure.id) {
            if (!this.isValidMove(from, to)) {
                return false;
            }

            let moveSuccess = false;

            if (this.isValidCaptureMove(from, to)) {
                if (this.gameState !== GameState.ACTIVE_CAPTURE_CHAIN) {
                    const chainStarted = this.startCaptureChain(from);
                    if (!chainStarted) return false;
                }

                moveSuccess = this.continueCaptureChain(to);

                if (moveSuccess && !this.canContinueCapture()) {
                    this.finishCaptureChain();
                }
            }
            else {
                to.figure = from.figure;
                from.figure = null;

                this.lastMoves[this.currentPlayer] = {
                    from: from,
                    to: to,
                    figureId: to.figure!.id
                };

                this.clearActiveBiyFigure(this.__currentPlayer);
                this.__gameState = GameState.NORMAL;
                this.switchPlayer();
                moveSuccess = true;
            }

            this.updateReserveOrderState();
            return moveSuccess;
        }

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



        return false;
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
                return cell?.figure && cell.figure.color === player &&
                    cell.figure instanceof Shatra;;
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

    private hasReservesInFortress(color: Player): boolean {

        const fortressPositions = color === Player.WHITE
            ? [
                { x: 2, y: 11 }, { x: 3, y: 11 }, { x: 4, y: 11 },
                { x: 2, y: 12 }, { x: 3, y: 12 }, { x: 4, y: 12 },
                { x: 2, y: 13 }, { x: 3, y: 13 }, { x: 4, y: 13 }
            ]
            : [
                { x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 },
                { x: 4, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 1 },
                { x: 4, y: 0 }, { x: 3, y: 0 }, { x: 2, y: 0 }
            ];

        const hasReserves = fortressPositions.some(pos => {
            const cell = this.getCell(pos.x, pos.y);
            const result = cell?.figure &&
                cell.figure.color === color &&
                cell.figure instanceof Shatra;

            return result;
        });


        return hasReserves;
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

    private checkPromotion(cell: Cell): boolean {
        if (!cell.figure || !(cell.figure instanceof Shatra)) return false;

        if (cell.figure.color === Player.WHITE && cell.y === 0) return true;
        if (cell.figure.color === Player.BLACK && cell.y === 13) return true;

        return false;
    }

    private promoteToBaatyr(cell: Cell): void {
        if (!cell.figure) return;

        const newBaatyr = new Baatyr(cell.figure.id, cell.figure.color);
        cell.figure = newBaatyr;


        this.removeFigureFromColorArray(cell);
        this.addFigureToColorArray(cell);
    }

    private isReserveExtractionMove(from: Cell, to: Cell): boolean {
        if (!from.figure) return false;

        const nextPos = this.reserveState[from.figure.color].nextPosition;
        if (!nextPos) return false;

        return nextPos.x === from.x &&
            nextPos.y === from.y &&
            this.getEmptyMiddleZoneCells(from.figure.color).some(cell => cell.id === to.id);
    }

    private isBiyInOwnFortress(cell: Cell): boolean {
        if (!cell.figure || !(cell.figure instanceof Biy)) return false;
        return cell.isOwnFortress(cell.figure.color);
    }



    private isValidCaptureMoveWithMiddle(from: Cell, targetCell: Cell, middleCell: Cell): boolean {

        if (!from.figure) {
            return false;
        }



        if (!middleCell.figure) {
            return false;
        }

        if (this.captureSession?.capturedFigures.includes(middleCell)) {
            return false;
        }

        if (middleCell.figure.color === from.figure.color) {
            return false;
        }
        if (targetCell.figure !== null) {
            return false;
        }


        const isReserve = from.isReserveFigure();

        if (isReserve) {
            return true;
        }


        if (from.figure instanceof Shatra && targetCell.isOwnFortress(from.figure.color)) {
            return false;
        }

        if (from.figure instanceof Biy && targetCell.isOwnFortress(from.figure.color)) {
            if (targetCell.isGate()) {
                return true;
            }

            else {
                const hasReserves = this.hasReservesInFortress(from.figure.color);
                return !hasReserves;
            }
        }

        if (from.figure instanceof Baatyr && from.isOwnFortress(from.figure.color)) {
            if (from.isOwnFortress(from.figure.color)) {
                return true;
            }
            const hasReserves = this.hasReservesInFortress(from.figure.color);
            return !hasReserves;
        }


        return true;
    }

    private isValidBaatyrCaptureMove(from: Cell, to: Cell): boolean {
        if (!from.figure) return false;

        const availableCaptureMoves = this.getBaatyrCaptureMoves(from);
        const isValidMove = availableCaptureMoves.some(cell => cell.x === to.x && cell.y === to.y);



        if (!isValidMove) return false;

        const dx = to.x - from.x;
        const dy = to.y - from.y;

        const dirX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
        const dirY = dy === 0 ? 0 : dy > 0 ? 1 : -1;

        let distance = 1;
        while (true) {
            const checkX = from.x + dirX * distance;
            const checkY = from.y + dirY * distance;
            const checkCell = this.getCell(checkX, checkY);

            if (!checkCell || checkCell === to) break;

            if (checkCell.figure) {
                if (this.captureSession?.capturedFigures.includes(checkCell)) {
                    distance++;
                    continue;
                }
                if (checkCell.figure.color !== from.figure.color) {
                    const result = this.isValidCaptureMoveWithMiddle(from, to, checkCell);
                    return result;
                } else {
                    return false;
                }
            }
            distance++;
        }

        return false;
    }

    public isValidCaptureMove(from: Cell, to: Cell): boolean {


        if (from.figure instanceof Baatyr) {
            const result = this.isValidBaatyrCaptureMove(from, to);
            return result;

        }


        const dx = to.x - from.x;
        const dy = to.y - from.y;


        if (from.figure instanceof Biy || from.figure instanceof Shatra) {
            const isExactlyTwoCells =
                (Math.abs(dx) === 2 && Math.abs(dy) === 0) ||  // horizontally by 2
                (Math.abs(dx) === 0 && Math.abs(dy) === 2) ||  // vertically by 2
                (Math.abs(dx) === 2 && Math.abs(dy) === 2);    // diagonally by 2

            if (!isExactlyTwoCells) {
                return false;
            }
        }


        const middleX = from.x + dx / 2;
        const middleY = from.y + dy / 2;

        const middleCell = this.getCell(middleX, middleY);
        const result = middleCell ? this.isValidCaptureMoveWithMiddle(from, to, middleCell) : false;

        return result;
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

            if (cell?.figure && cell.figure.color === player && !(cell.figure instanceof Biy) && !(cell.figure instanceof Baatyr)) {
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


    private isReserveTurn(cell: Cell): boolean {
        if (!cell.figure) return false;

        const playerState = this.reserveState[cell.figure.color];
        const nextPos = playerState.nextPosition;

        if (!nextPos) return false;
        return cell.figure.color === this.__currentPlayer && nextPos.x === cell.x && nextPos.y === cell.y && cell.figure instanceof Shatra;
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



    public isValidNormalMove(from: Cell, to: Cell): boolean {


        if (!from.figure) return false;
        if (from === to) return false;
        if (to.figure !== null) return false;
        if (from.figure.color !== this.currentPlayer) return false;

        if (from.figure instanceof Baatyr) {
            if (this.isValidBaatyrCaptureMove(from, to)) {
                return false;
            }
        }

        const playerLastMove = this.lastMoves[this.currentPlayer];


        if (playerLastMove && from.figure.id === playerLastMove.figureId) {
            if (from.figure instanceof Shatra) {
                if (to.id === playerLastMove.from.id && to.y === from.y) {
                    return false;
                }
            }
        }


        if (from.figure instanceof Baatyr &&
            to.isOwnFortress(from.figure.color) &&
            !from.isOwnFortress(from.figure.color)) {

            const hasReserves = this.hasReservesInFortress(from.figure.color);
            if (hasReserves) {
                return to.isGate();
            }
        }


        if (from.isOwnFortress(from.figure.color) && from.figure instanceof Baatyr) {
            const extractionMoves = this.getEmptyMiddleZoneCells(from.figure.color);
            const isExtractionMove = extractionMoves.some(cell => cell.id === to.id);
            const isNormalMove = from.figure.getPossibleMoves(from, this).some(move => move.x === to.x && move.y === to.y);
            if (isExtractionMove || isNormalMove) {
                return true;
            }

        }


        const isExtractionMove = from.isEnemyFortress() &&
            this.getEmptyMiddleZoneCells(from.figure.color === Player.WHITE ? Player.BLACK : Player.WHITE)
                .some(cell => cell.id === to.id);


        if (isExtractionMove) {
            return true;
        }

        if (to.isOwnFortress(from.figure.color) && !from.isOwnFortress(from.figure.color)) {
            if (from.figure instanceof Biy) {
                if (to.isGate()) {
                    return true;
                }
                else {
                    return !this.hasReservesInFortress(from.figure.color);
                }
            }
            else if (from.figure instanceof Baatyr) {
                return !this.hasReservesInFortress(from.figure.color);
            }
            return false;
        }


        const result = from.figure.getPossibleMoves(from, this).some(move => move.x === to.x && move.y === to.y);
        return result;
    }

    private hasBaatyrCaptureMoves(): boolean {
        const currentPlayerFigures = this.currentPlayer === Player.WHITE ? this.whiteFigures : this.blackFigures;

        return currentPlayerFigures.some(cell =>
            cell.figure instanceof Baatyr && this.getBaatyrCaptureMoves(cell).length > 0
        );
    }

    private getBaatyrCaptureMoves(from: Cell): Cell[] {
        const captureMoves: Cell[] = [];

        const directions = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
            { dx: -1, dy: -1 }, { dx: 1, dy: -1 },
            { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
        ];

        for (const direction of directions) {
            let distance = 1;

            while (true) {
                const checkX = from.x + direction.dx * distance;
                const checkY = from.y + direction.dy * distance;
                const checkCell = this.getCell(checkX, checkY);

                if (!checkCell) break;

                if (checkCell.figure) {
                    if (this.captureSession?.capturedFigures.includes(checkCell)) {
                        break;
                    }

                    if (this.captureSession?.capturedFigures.includes(checkCell)) {
                        distance++;
                        continue;
                    }
                    if (checkCell.figure.color !== from.figure!.color) {
                        let captureDistance = distance + 1;
                        const possibleMoves: Cell[] = [];
                        const continuingMoves: Cell[] = [];

                        while (true) {
                            const targetX = from.x + direction.dx * captureDistance;
                            const targetY = from.y + direction.dy * captureDistance;
                            const targetCell = this.getCell(targetX, targetY);

                            if (!targetCell || targetCell.figure) break;

                            if (targetCell.isOwnFortress(from.figure!.color)) {
                                const hasReserves = this.hasReservesInFortress(from.figure!.color);
                                if (hasReserves && !targetCell.isGate()) {
                                    captureDistance++;
                                    continue;
                                }
                            }

                            possibleMoves.push(targetCell);
                            captureDistance++;
                        }

                        if (possibleMoves.length > 0) {
                            for (const moveCell of possibleMoves) {
                                const tempBoard = this.clone();
                                const tempFrom = tempBoard.getCell(from.x, from.y)!;
                                const tempTo = tempBoard.getCell(moveCell.x, moveCell.y)!;

                                const enemyX = from.x + direction.dx * distance;
                                const enemyY = from.y + direction.dy * distance;
                                const tempEnemy = tempBoard.getCell(enemyX, enemyY)!;

                                tempBoard.removeFigureFromColorArray(tempEnemy);
                                tempEnemy.figure = null;
                                tempTo.figure = tempFrom.figure;
                                tempFrom.figure = null;

                                if (tempTo.isGate()) {
                                    captureMoves.push(moveCell);
                                }

                                const canContinue = tempBoard.getCaptureMoves(tempTo).length > 0;

                                if (canContinue) {
                                    continuingMoves.push(moveCell);
                                }

                            }

                            if (continuingMoves.length > 0) {
                                captureMoves.push(...continuingMoves);
                            } else {
                                captureMoves.push(...possibleMoves);
                            }
                        }
                    }
                    break;
                }
                distance++;
            }
        }

        return captureMoves;
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

        this.checkForcedBiyMove();
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
            if (cell.id == 10) cell.figure = new Biy((cell.x + "_" + cell.y), Player.BLACK);
            if (cell.id == 53) cell.figure = new Biy((cell.x + "_" + cell.y), Player.WHITE);
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


        newBoard.activeWhiteBiyFigure = this.activeWhiteBiyFigure ?
            newBoard.getCellById(this.activeWhiteBiyFigure.id)! : null;
        newBoard.activeBlackBiyFigure = this.activeBlackBiyFigure ?
            newBoard.getCellById(this.activeBlackBiyFigure.id)! : null;

        if (this.captureSession) {
            newBoard.captureSession = {
                activeFigure: newBoard.getCellById(this.captureSession.activeFigure.id)!,
                capturedFigures: this.captureSession.capturedFigures.map(cell =>
                    newBoard.getCellById(cell.id)!
                ),
                reachedBiyPosition: this.captureSession.reachedBiyPosition,
                biyRightsActivated: this.captureSession.biyRightsActivated
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


    private hasBaatyrMoveIntersection(from: Cell, to: Cell): boolean {
        if (!from.figure || !(from.figure instanceof Baatyr)) {
            return false;
        }

        const isCaptureMove = this.isValidCaptureMove(from, to);
        if (!isCaptureMove) {
            return false;
        }

        if (from.isGate() && from.figure instanceof Baatyr) {
            let hasEnemyFigureOnPath = false;
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dirX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
            const dirY = dy === 0 ? 0 : dy > 0 ? 1 : -1;

            let distance = 1;
            while (true) {
                const checkX = from.x + dirX * distance;
                const checkY = from.y + dirY * distance;
                const checkCell = this.getCell(checkX, checkY);

                if (!checkCell || checkCell === to) break;

                if (checkCell.figure && checkCell.figure.color !== from.figure.color) {
                    hasEnemyFigureOnPath = true;
                    break;
                }
                distance++;
            }


            let extractionMoves: Cell[];
            if (from.isOwnFortress(from.figure.color)) {

                extractionMoves = this.getEmptyMiddleZoneCells(from.figure.color);
            } else if (from.isEnemyFortress()) {

                const enemyColor = from.figure.color === Player.WHITE ? Player.BLACK : Player.WHITE;
                extractionMoves = this.getEmptyMiddleZoneCells(enemyColor);
            } else {
                extractionMoves = [];
            }

            const isExtractionCell = extractionMoves.some(cell => cell.id === to.id);

            return hasEnemyFigureOnPath && isExtractionCell;
        }


        return false;
    }

    public hasMoveIntersection(from: Cell, to: Cell): boolean {

        if (this.gameState === GameState.ACTIVE_CAPTURE_CHAIN || this.gameState === GameState.BIY_RIGHTS_ACTIVE) {
            return false;
        }

        const figuresWithCaptures = this.getFiguresWithCaptures();
        if (figuresWithCaptures.length >= 2) {
            return false;
        }

        if (!this.isValidMove(from, to)) {
            return false;
        }

        if (from.figure instanceof Baatyr) {
            return this.hasBaatyrMoveIntersection(from, to);
        }


        const isNormalMove = this.isValidNormalMove(from, to);
        const isCaptureMove = this.isValidCaptureMove(from, to);

        return isNormalMove && isCaptureMove;
    }

    public makeNormalMove(from: Cell, to: Cell): boolean {
        if (!from.figure) {
            return false;
        }
        to.figure = from.figure;
        from.figure = null;

        if (!to.figure) {
            return false;
        }

        if (this.checkPromotion(to)) {
            this.promoteToBaatyr(to);
        }

        this.lastMoves[this.currentPlayer] = {
            from: from,
            to: to,
            figureId: to.figure.id
        };

        this.switchPlayer();
        this.updateReserveOrderState();
        return true;
    }



    public makeMove(from: Cell, to: Cell): boolean {

        if (!from.figure) {
            return false;
        }

        if (!this.isValidMove(from, to)) {
            return false;
        }


        if (this.gameState === GameState.BIY_RIGHTS_ACTIVE) {
            return this.handleBiyRightsMove(from, to);
        }

        if (this.gameState === GameState.BIY_FORCED_MOVE) {
            const result = this.handleBiyForcedMove(from, to);
            if (result !== false) {
                return result;
            }
        }



        if (this.gameState === GameState.ACTIVE_CAPTURE_CHAIN &&
            from === to &&
            from.figure instanceof Biy &&
            this.captureSession?.activeFigure.id === from.id) {
            this.lastMoves[this.currentPlayer] = {
                from: from,
                to: from,
                figureId: from.figure.id
            };

            if (this.checkPromotion(to)) {
                this.promoteToBaatyr(to);
            }


            this.finishCaptureChain();
            return true;
        }






        if (this.isValidCaptureMove(from, to)) {
            if (this.gameState !== GameState.ACTIVE_CAPTURE_CHAIN) {
                const chainStarted = this.startCaptureChain(from);
                if (!chainStarted) return false;
            }

            const success = this.continueCaptureChain(to);

            if (success) {
                if (!this.canContinueCapture()) {

                    if (this.checkPromotion(to)) {
                        this.promoteToBaatyr(to);
                    }

                    this.finishCaptureChain();
                }

                this.updateReserveOrderState();
                return true;
            }


            return success;
        }

        if (from.figure instanceof Baatyr &&
            from.isOwnFortress(from.figure.color) &&
            from.figure.color === this.currentPlayer) {

            const extractionMoves = this.getEmptyMiddleZoneCells(from.figure.color);
            const isExtractionMove = extractionMoves.some(cell => cell.id === to.id);
            const hasReserves = this.hasReservesInFortress(from.figure.color);

            if (isExtractionMove) {
                if (hasReserves) {
                    to.figure = from.figure;
                    from.figure = null;

                    this.lastMoves[this.currentPlayer] = {
                        from: from,
                        to: to,
                        figureId: to.figure!.id
                    };

                    this.switchPlayer();
                    this.updateReserveOrderState();
                    return true;
                }
            } else {
                const isNormalMove = from.figure.getPossibleMoves(from, this).some(move => move.x === to.x && move.y === to.y);
                if (isNormalMove) {
                    to.figure = from.figure;
                    from.figure = null;

                    this.lastMoves[this.currentPlayer] = {
                        from: from,
                        to: to,
                        figureId: to.figure!.id
                    };

                    this.switchPlayer();
                    this.updateReserveOrderState();
                    return true;
                }
            }
        }

        if (from.figure instanceof Baatyr && from.isGate()) {
            const hasReserves = this.hasReservesInFortress(from.figure.color);

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
            } else {
                if (hasReserves) {
                    const isNormalMove = from.figure.getPossibleMoves(from, this).some(move => move.x === to.x && move.y === to.y);
                    const isExtractionMove = from.isEnemyFortress()
                        ? this.getEmptyMiddleZoneCells(from.figure.color === Player.WHITE ? Player.BLACK : Player.WHITE).some(cell => cell.id === to.id)
                        : this.getEmptyMiddleZoneCells(from.figure.color).some(cell => cell.id === to.id);

                    if (isNormalMove || isExtractionMove) {
                        to.figure = from.figure;
                        from.figure = null;

                        if (this.checkPromotion(to)) {
                            this.promoteToBaatyr(to);
                        }

                        this.lastMoves[this.currentPlayer] = {
                            from: from,
                            to: to,
                            figureId: to.figure!.id
                        }

                        this.switchPlayer();
                        this.updateReserveOrderState();
                        return true;
                    }

                } else {
                    to.figure = from.figure;
                    from.figure = null;

                    if (this.checkPromotion(to)) {
                        this.promoteToBaatyr(to);
                    }

                    this.lastMoves[this.currentPlayer] = {
                        from: from,
                        to: to,
                        figureId: to.figure!.id
                    }

                    this.switchPlayer();
                    this.updateReserveOrderState();
                    return true;
                }
            }
        }


        if (this.isReserveExtractionMove(from, to)) {
            const result = this.handleReserveExtraction(from, to);
            this.updateReserveOrderState();

            return result;
        }

        if (from.figure instanceof Biy && this.isBiyInOwnFortress(from) && from.figure.color === this.currentPlayer) {
            const extractionMoves = this.getEmptyMiddleZoneCells(from.figure.color);
            if (extractionMoves.some(cell => cell.id === to.id)) {
                to.figure = from.figure;
                from.figure = null;

                this.lastMoves[this.currentPlayer] = {
                    from: from,
                    to: to,
                    figureId: to.figure!.id
                };

                this.switchPlayer();
                this.updateReserveOrderState();
                return true;
            }
        }



        to.figure = from.figure;
        from.figure = null;

        if (this.checkPromotion(to)) {
            this.promoteToBaatyr(to);
        }

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
        const availableMoves = this.getAvailableMoves(from);
        return availableMoves.some(cell => cell.id === to.id);

    }

    public getAvailableMoves(from: Cell): Cell[] {
        this.updateReserveOrderState();
        if (this.__gameState === GameState.NORMAL) {
            this.checkForcedBiyMove();
        }

        if (!from.figure) return [];

        if (this.gameState == GameState.ACTIVE_CAPTURE_CHAIN) {
            if (!this.captureSession) {
                this.__gameState = GameState.NORMAL;
                return [];
            }

            if (from.id === this.captureSession.activeFigure.id) {
                const captureMoves = this.getCaptureMoves(this.captureSession.activeFigure);
                if (this.captureSession.activeFigure.figure instanceof Biy) {
                    return [this.captureSession.activeFigure, ...captureMoves];
                }
                return captureMoves;
            } else {
                return [];
            }


        }

        if (this.gameState === GameState.BIY_RIGHTS_ACTIVE) {
            if (!this.captureSession) {
                console.warn('No active capture session in BIY_RIGHTS_ACTIVE');
                this.__gameState = GameState.NORMAL;
                return [];
            }


            if (from.id !== this.captureSession.activeFigure.id || from.figure.color !== this.__currentPlayer) {
                return [];
            }

            const currentCell = this.captureSession.activeFigure;
            const captureMoves = this.getCaptureMoves(currentCell);





            if (currentCell.figure instanceof Baatyr || currentCell.figure instanceof Shatra) {
                return [currentCell, ...captureMoves];
            }

            return [currentCell, ...captureMoves];
        }


        if (from.figure instanceof Baatyr) {
            return this.getBaatyrMoves(from);
        } else if (from.figure instanceof Biy) {
            return this.getBiyMoves(from);
        } else if (from.figure instanceof Shatra) {
            return this.getShatraMoves(from);
        }

        return [];
    }



    private getBaatyrMoves(from: Cell): Cell[] {
        if (from.figure!.color !== this.__currentPlayer) return [];
        const hasBaatyrCapture = this.hasBaatyrForcedCapture();
        const hasAnyCapture = this.hasForcedCapture();

        if (hasAnyCapture) {

            if (hasBaatyrCapture && from.isGate()) {
                const captureMoves = this.getCaptureMoves(from);
                const extractionMoves = from.isEnemyFortress()
                    ? this.getEmptyMiddleZoneCells(from.figure!.color === Player.WHITE ? Player.BLACK : Player.WHITE)
                    : this.getEmptyMiddleZoneCells(from.figure!.color);
                const normalMoves = this.getNormalMoves(from);

                if (!this.getCaptureMoves(from).length) {
                    return [...captureMoves];
                }

                const figuresWithCaptures = this.getFiguresWithCaptures();
                if (figuresWithCaptures.length >= 2 && from.isGate()) {
                    if (this.canFigureCapture(from)) {
                        return this.getCaptureMoves(from);
                    }
                }

                return [...captureMoves, ...extractionMoves, ...normalMoves];
            }
            else if (hasBaatyrCapture) {
                if (this.canFigureCapture(from)) {
                    return this.getCaptureMoves(from);
                }
            } else {
                return [];
            }

            return [];
        }

        const playerState = this.reserveState[from.figure!.color];
        if (playerState.orderViolated) {
            return [];
        }

        if (from.isGate()) {
            const captureMoves = this.getCaptureMoves(from);
            const normalMoves = this.getNormalMoves(from);
            const extractionMoves = from.isEnemyFortress()
                ? this.getEmptyMiddleZoneCells(from.figure!.color === Player.WHITE ? Player.BLACK : Player.WHITE)
                : this.getEmptyMiddleZoneCells(from.figure!.color);

            const hasReserves = this.hasReservesInFortress(from.figure!.color);

            if (hasReserves) {
                return [...captureMoves, ...normalMoves, ...extractionMoves];
            } else {
                return [...captureMoves, ...normalMoves, ...extractionMoves];
            }
        }

        if (from.isEnemyFortress()) {

            const captureMoves = this.getCaptureMoves(from);
            const extractionMoves = from.isEnemyFortress()
                ? this.getEmptyMiddleZoneCells(from.figure!.color === Player.WHITE ? Player.BLACK : Player.WHITE)
                : this.getEmptyMiddleZoneCells(from.figure!.color);
            const normalMoves = this.getNormalMoves(from);

            return [...captureMoves, ...extractionMoves, ...normalMoves];
        }

        if (from.isOwnFortress(from.figure!.color)) {

            const extractionMoves = this.getEmptyMiddleZoneCells(from.figure!.color);
            const normalMoves = this.getNormalMoves(from);

            const hasReserves = this.hasReservesInFortress(from.figure!.color);
            if (hasReserves) {
                return extractionMoves;
            } else {
                return [...extractionMoves, ...normalMoves];
            }
        }

        if (!from.isOwnFortress(from.figure!.color)) {

            const captureMoves = this.getCaptureMoves(from);
            const normalMoves = this.getNormalMoves(from);

            const filteredNormalMoves = normalMoves.filter(targetCell => {
                if (targetCell.isOwnFortress(from.figure!.color)) {
                    const hasReserves = this.hasReservesInFortress(from.figure!.color);
                    if (hasReserves) {
                        return targetCell.isGate();
                    }
                    return true;
                }
                return true;
            });

            return [...captureMoves, ...filteredNormalMoves];
        }

        return this.getNormalMoves(from);
    }

    private getBiyMoves(from: Cell): Cell[] {
        if (from.figure!.color !== this.__currentPlayer) return [];

        const hasShatraCapture = this.hasShatraForcedCapture();
        const hasBaatyrCapture = this.hasBaatyrForcedCapture();
        const hasBiyCapture = this.getFiguresWithCaptures('biy').length > 0;
        const hasAnyCapture = this.hasForcedCapture();


        if (hasAnyCapture) {

            if (hasBiyCapture && (!hasBaatyrCapture && !hasShatraCapture) && from.isFortress()) {
                const captureMoves = this.getCaptureMoves(from);
                const extractionMoves = from.isEnemyFortress()
                    ? this.getEmptyMiddleZoneCells(from.figure!.color === Player.WHITE ? Player.BLACK : Player.WHITE)
                    : this.getEmptyMiddleZoneCells(from.figure!.color);
                const normalMoves = this.getNormalMoves(from);

                return [...captureMoves, ...extractionMoves, ...normalMoves];
            }
            if (hasBiyCapture && (!hasBaatyrCapture && !hasShatraCapture)) {
                if (this.canFigureCapture(from)) {
                    return [...this.getCaptureMoves(from), ...this.getNormalMoves(from)];
                }
            } else if (hasBiyCapture && (hasBaatyrCapture || hasShatraCapture)) {
                if (this.canFigureCapture(from)) {
                    return this.getCaptureMoves(from);
                }
            } else {
                return [];
            }
        }

        const playerState = this.reserveState[from.figure!.color];
        if (playerState.orderViolated) {
            return [];
        }

        if (from.figure instanceof Biy && this.isBiyInOwnFortress(from) && from.figure.color === this.__currentPlayer) {
            const extractionMoves = this.getEmptyMiddleZoneCells(from.figure.color);
            const normalMoves = this.getNormalMoves(from);


            return [...extractionMoves, ...normalMoves];
        }

        if (from.isEnemyFortress()) {
            return this.getEmptyMiddleZoneCells(from.figure!.color === Player.WHITE ? Player.BLACK : Player.WHITE).concat(this.getNormalMoves(from));
        }

        return this.getNormalMoves(from);
    }

    private getShatraMoves(from: Cell): Cell[] {
        if (from.figure!.color !== this.__currentPlayer) return [];
        const hasShatraCapture = this.hasShatraForcedCapture();
        const hasAnyCapture = this.hasForcedCapture();


        if (hasAnyCapture) {

            if (hasShatraCapture && from.isGate()) {
                const captureMoves = this.getCaptureMoves(from);
                const extractionMoves = from.isEnemyFortress()
                    ? this.getEmptyMiddleZoneCells(from.figure!.color === Player.WHITE ? Player.BLACK : Player.WHITE)
                    : this.getEmptyMiddleZoneCells(from.figure!.color);
                const normalMoves = this.getNormalMoves(from);

                if (!this.getCaptureMoves(from).length) {
                    return [...captureMoves];
                }

                const figuresWithCaptures = this.getFiguresWithCaptures();
                if (figuresWithCaptures.length >= 2 && from.isGate()) {
                    if (this.canFigureCapture(from)) {
                        return this.getCaptureMoves(from);
                    }
                }


                return [...captureMoves, ...extractionMoves, ...normalMoves];
            }
            else if (hasShatraCapture) {
                if (this.canFigureCapture(from)) {
                    return this.getCaptureMoves(from);
                }
            }

            return [];

        }

        const playerState = this.reserveState[from.figure!.color];
        if (playerState.orderViolated) {
            if (this.isReserveTurn(from)) {
                const moves = this.getEmptyMiddleZoneCells(from.figure!.color);
                return moves;
            }
            return [];
        }


        if (from.figure instanceof Shatra && from.isOwnFortress(from.figure.color) && from.figure.color === this.__currentPlayer) {
            if (this.isReserveTurn(from)) {
                return this.getEmptyMiddleZoneCells(this.__currentPlayer);
            }
            return [];
        }

        if (from.figure instanceof Shatra && from.isEnemyFortress()) {

            const captureMoves = this.getCaptureMoves(from);
            const extractionMoves = from.isEnemyFortress()
                ? this.getEmptyMiddleZoneCells(from.figure!.color === Player.WHITE ? Player.BLACK : Player.WHITE)
                : this.getEmptyMiddleZoneCells(from.figure!.color);
            const normalMoves = this.getNormalMoves(from);

            return [...captureMoves, ...extractionMoves, ...normalMoves];
        }


        return this.getNormalMoves(from);
    }



    public getNormalMoves(from: Cell): Cell[] {
        if (!from.figure) return [];
        if (from.figure!.color !== this.__currentPlayer) return [];

        const normalMoves: Cell[] = [];
        const possibleCoords = from.figure.getPossibleMoves(from, this);

        possibleCoords.forEach(coord => {
            const targetCell = this.getCell(coord.x, coord.y);

            if (targetCell && this.isValidNormalMove(from, targetCell) && from.figure!.color === this.__currentPlayer) {
                if (from.figure instanceof Biy && targetCell.isOwnFortress(from.figure.color)) {
                    const hasReserves = this.hasReservesInFortress(from.figure.color);
                    if (!targetCell.isGate() && hasReserves) {
                        return;
                    }
                }

                if (from.figure instanceof Baatyr && targetCell.isOwnFortress(from.figure.color)) {
                    const hasReserves = this.hasReservesInFortress(from.figure.color);
                    if (hasReserves && !targetCell.isGate()) {
                        return;
                    }

                }
                normalMoves.push(targetCell);
            }
        });



        return normalMoves;
    }

    public hasForcedCapture(): boolean {
        if (this.gameState === GameState.ACTIVE_CAPTURE_CHAIN) {
            return false;
        }

        const reservesWithCaptures = this.getFiguresWithCaptures().filter(cell =>
            cell.isReserveFigure()
        );


        if (reservesWithCaptures.length > 0) {
            return true;
        }

        return this.getFiguresWithCaptures().length > 0;
    }

    public hasShatraForcedCapture(): boolean {
        return this.getFiguresWithCaptures('shatra').length > 0;
    }

    public hasBaatyrForcedCapture(): boolean {
        return this.getFiguresWithCaptures('baatyr').length > 0;
    }

    public canFigureCapture(figureCell: Cell): boolean {
        if (!figureCell.figure) return false;
        if (figureCell.figure.color !== this.currentPlayer) return false;

        return this.getCaptureMoves(figureCell).length > 0;
    }


    public getFiguresWithCaptures(figureType?: 'shatra' | 'biy' | 'baatyr'): Cell[] {
        const currentPlayerFigures = this.currentPlayer === Player.WHITE ? this.whiteFigures : this.blackFigures;

        const figuresWithCapture = currentPlayerFigures.filter(cell => {
            if (!this.canFigureCapture(cell)) return false;

            if (figureType === 'shatra') {
                return cell.figure instanceof Shatra;
            } else if (figureType === 'biy') {
                return cell.figure instanceof Biy;
            } else if (figureType === 'baatyr') {
                return cell.figure instanceof Baatyr
            }

            return true;
        });


        return figuresWithCapture;
    }

    public getActiveCaptureFigure(): Cell | null {
        if (this.captureSession &&
            (this.gameState === GameState.ACTIVE_CAPTURE_CHAIN ||
                this.gameState === GameState.BIY_RIGHTS_ACTIVE)) {
            return this.captureSession.activeFigure;
        }
        return null;
    }

    public getFiguresWithForcedCapture(): Cell[] {
        if (this.gameState === GameState.ACTIVE_CAPTURE_CHAIN ||
            this.gameState === GameState.BIY_RIGHTS_ACTIVE) {
            return [];
        }

        return this.getFiguresWithCaptures();
    }


    public getCaptureMoves(from: Cell): Cell[] {
        if (!from.figure) return [];
        if (from.figure!.color !== this.__currentPlayer) return [];

        if (from.figure instanceof Baatyr) {
            return this.getBaatyrCaptureMoves(from);
        }


        const captureMoves: Cell[] = [];
        const directions = from.figure.getCaptureDirections();





        directions.forEach(({ dx, dy }) => {
            const targetX = from.x + dx;
            const targetY = from.y + dy;
            const middleX = from.x + dx / 2;
            const middleY = from.y + dy / 2;

            const targetCell = this.getCell(targetX, targetY);
            const middleCell = this.getCell(middleX, middleY);

            if (from.figure?.color === this.__currentPlayer && targetCell && middleCell && this.isValidCaptureMoveWithMiddle(from, targetCell, middleCell)) {
                captureMoves.push(targetCell);
            }
        });

        return captureMoves;
    }


    public startCaptureChain(from: Cell): boolean {

        if (!this.canFigureCapture(from)) return false;

        this.captureSession = {
            activeFigure: from,
            capturedFigures: [],
            reachedBiyPosition: false,
            biyRightsActivated: false
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




        if (from === to && from.figure instanceof Biy) {
            this.lastMoves[this.currentPlayer] = {
                from: from,
                to: from,
                figureId: from.figure.id
            };

            this.finishCaptureChain();
            return true;
        }

        if (!this.isValidCaptureMove(from, to)) {
            return false;
        }

        let middleCell: Cell | null = null;

        if (from.figure instanceof Baatyr) {
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dirX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
            const dirY = dy === 0 ? 0 : dy > 0 ? 1 : -1;

            let distance = 1;
            while (true) {
                const checkX = from.x + dirX * distance;
                const checkY = from.y + dirY * distance;
                const checkCell = this.getCell(checkX, checkY);

                if (!checkCell || checkCell === to) break;

                if (checkCell.figure && checkCell.figure.color !== from.figure.color) {
                    if (!this.captureSession.capturedFigures.includes(checkCell)) {
                        middleCell = checkCell;
                        break;
                    }
                }
                distance++;
            }
        } else {
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const middleX = from.x + dx / 2;
            const middleY = from.y + dy / 2;
            middleCell = this.getCell(middleX, middleY);
        }



        if (!middleCell?.figure) {
            return false
        };

        this.captureSession.capturedFigures.push(middleCell);

        to.figure = from.figure;
        from.figure = null;


        this.captureSession.activeFigure = to;

        if (to.isEnemyBiyPosition(to.figure!.color) || to.isGate()) {
            this.captureSession.reachedBiyPosition = true;
            this.captureSession.biyRightsActivated = true;
            this.__gameState = GameState.BIY_RIGHTS_ACTIVE;
            this.setActiveBiyFigure(to.figure!.color, to);
            return true;
        }

        if (this.__gameState === GameState.BIY_RIGHTS_ACTIVE &&
            !to.isEnemyBiyPosition(to.figure!.color)) {
            this.__gameState = GameState.ACTIVE_CAPTURE_CHAIN;
            this.clearActiveBiyFigure(to.figure!.color);
        }

        if (to.isEnemyBiyPosition(to.figure!.color)) {
            this.captureSession.reachedBiyPosition = true;
            this.captureSession.biyRightsActivated = true;
            this.__gameState = GameState.BIY_RIGHTS_ACTIVE;
            this.setActiveBiyFigure(to.figure!.color, to);
            return true;
        }

        if (!this.canContinueCapture()) {
            this.finishCaptureChain();
            return true;
        }

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

        if (this.captureSession.activeFigure.figure) {
            this.clearActiveBiyFigure(this.captureSession.activeFigure.figure.color);
        }



        this.captureSession = undefined;

        this.__gameState = GameState.NORMAL;
        this.switchPlayer();
    }
}

