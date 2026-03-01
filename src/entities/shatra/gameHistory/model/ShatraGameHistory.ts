import { ShatraBoard } from "@/entities/shatra";
import { ShatraCell } from "@/entities/shatra";
import { Player } from "@/entities/shatra";




export interface MoveInfo {
    index: number;
    player: Player;
    from: ShatraCell;
    to: ShatraCell;
    notation: string;
}

export class ShatraGameHistory {
    private boardStates: ShatraBoard[] = [];
    private moves: MoveInfo[] = [];
    private currentIndex: number = 0;

    constructor(initialBoard: ShatraBoard) {
        this.saveState(initialBoard);
    }

    public getCurrentBoard(): ShatraBoard {
        return this.boardStates[this.currentIndex].clone();
    }

    public goToMove(moveIndex: number) {
        if (moveIndex >= 0 && moveIndex < this.boardStates.length) {
            return this.boardStates[moveIndex].clone();
        }
    }

    public getCurrentMoveInfo(): MoveInfo {
        return this.moves[this.currentIndex];
    }

    public getAllMoves(): MoveInfo[] {
        console.log(this.moves);
        return this.moves;
    }

    public canMakeNewMove(): boolean {
        return this.currentIndex === this.boardStates.length - 1;
    }

    public saveState(board: ShatraBoard) {
        this.boardStates.push(board.clone());
    }

    private generateNotation(from: ShatraCell, to: ShatraCell): string {
        return `${from.id}-${to.id}`;
    }

    public addMove(from: ShatraCell, to: ShatraCell) {
        const currentBoard = this.boardStates[this.currentIndex];
        const newBoard = currentBoard.clone();

        this.boardStates.push(newBoard);

        const move = {
            index: this.boardStates.length - 1,
            player: currentBoard.currentPlayer,
            from: from,
            to: to,
            notation: this.generateNotation(from, to),
            isSpecialMove: false,
        }

        this.moves.push(move);
        this.currentIndex = this.boardStates.length - 1;
    }

    public goBack(): ShatraBoard | null {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            return this.boardStates[this.currentIndex].clone();
        }
        return null;
    }

    public goForward(): ShatraBoard | null {
        if (this.currentIndex < this.boardStates.length - 1) {
            this.currentIndex++;
            return this.boardStates[this.currentIndex].clone();
        }
        return null;
    }
}