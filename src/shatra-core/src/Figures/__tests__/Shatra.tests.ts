import { Cell } from "../../Cell";
import { Colors } from "../../config/Colors"
import { Figures } from "../../config/Figures";
import { Shatra } from "../Shatra";


describe('Shatra', () => {
    describe('getPossibleMoves', () => {
        test('should return correct moves for BLACK shatra', () => {
            const blackShatra = new Shatra('black1', Colors.BLACK);
            const fromCell = new Cell(1, 3, 5, Colors.BLACK, blackShatra);

            const moves = blackShatra.getPossibleMoves(fromCell);

            expect(moves).toEqual([
                { x: 3, y: 6 }, // вперед (вниз)
                { x: 2, y: 6 }, // влево-вперед
                { x: 4, y: 6 }, // вправо-вперед
                { x: 2, y: 5 }, // влево
                { x: 4, y: 5 }  // вправо
            ]);
        });

        test('should return correct moves for WHITE shatra', () => {
            const whiteShatra = new Shatra('white-1', Colors.WHITE);
            const fromCell = new Cell(1, 3, 5, Colors.WHITE, whiteShatra);

            const moves = whiteShatra.getPossibleMoves(fromCell);

            expect(moves).toEqual([
                { x: 3, y: 4 }, // вперед (вверх)
                { x: 2, y: 4 }, // влево-вперед
                { x: 4, y: 4 }, // вправо-вперед
                { x: 2, y: 5 }, // влево
                { x: 4, y: 5 }  // вправо
            ]);
        });

        test('should return moves from edge position', () => {
            const shatra = new Shatra('test', Colors.BLACK);
            const fromCell = new Cell(1, 0, 0, Colors.BLACK, shatra);

            const moves = shatra.getPossibleMoves(fromCell);

            expect(moves).toEqual([
                { x: 0, y: 1 }, // вперед
                { x: -1, y: 1 }, // влево-вперед (может быть за доской)
                { x: 1, y: 1 }, // вправо-вперед
                { x: -1, y: 0 }, // влево (может быть за доской)
                { x: 1, y: 0 }  // вправо
            ]);
        });

        describe('canMove', () => {
            test('should return true for valid moves - BLACK', () => {
                const blackShatra = new Shatra('black-1', Colors.BLACK);
                const fromCell = new Cell(1, 3, 5, Colors.BLACK, blackShatra);

                // Valid moves
                expect(blackShatra.canMove(fromCell, new Cell(2, 3, 6, Colors.WHITE, null))).toBe(true); // вперед
                expect(blackShatra.canMove(fromCell, new Cell(2, 2, 6, Colors.WHITE, null))).toBe(true); // влево-вперед
                expect(blackShatra.canMove(fromCell, new Cell(2, 4, 6, Colors.WHITE, null))).toBe(true); // вправо-вперед
                expect(blackShatra.canMove(fromCell, new Cell(2, 2, 5, Colors.WHITE, null))).toBe(true); // влево
                expect(blackShatra.canMove(fromCell, new Cell(2, 4, 5, Colors.WHITE, null))).toBe(true); // вправо
            });

            test('should return false for invalid moves - BLACK', () => {
                const blackShatra = new Shatra('black-1', Colors.BLACK);
                const fromCell = new Cell(1, 3, 5, Colors.BLACK, blackShatra);

                // Invalid moves (назад)
                expect(blackShatra.canMove(fromCell, new Cell(2, 3, 4, Colors.WHITE, null))).toBe(false); // назад
                expect(blackShatra.canMove(fromCell, new Cell(2, 2, 4, Colors.WHITE, null))).toBe(false); // назад-влево
                expect(blackShatra.canMove(fromCell, new Cell(2, 4, 4, Colors.WHITE, null))).toBe(false); // назад-вправо

                // Invalid moves (дальше чем на 1 клетку)
                expect(blackShatra.canMove(fromCell, new Cell(2, 3, 7, Colors.WHITE, null))).toBe(false); // далеко вперед
                expect(blackShatra.canMove(fromCell, new Cell(2, 1, 5, Colors.WHITE, null))).toBe(false); // далеко влево
            });

            test('should return true for valid moves - WHITE', () => {
                const whiteShatra = new Shatra('white-1', Colors.WHITE);
                const fromCell = new Cell(1, 3, 5, Colors.WHITE, whiteShatra);

                // Valid moves (вверх)
                expect(whiteShatra.canMove(fromCell, new Cell(2, 3, 4, Colors.BLACK, null))).toBe(true); // вперед (вверх)
                expect(whiteShatra.canMove(fromCell, new Cell(2, 2, 4, Colors.BLACK, null))).toBe(true); // влево-вперед
                expect(whiteShatra.canMove(fromCell, new Cell(2, 4, 4, Colors.BLACK, null))).toBe(true); // вправо-вперед
                expect(whiteShatra.canMove(fromCell, new Cell(2, 2, 5, Colors.BLACK, null))).toBe(true); // влево
                expect(whiteShatra.canMove(fromCell, new Cell(2, 4, 5, Colors.BLACK, null))).toBe(true); // вправо
            });

            test('should return false for invalid moves - WHITE', () => {
                const whiteShatra = new Shatra('white-1', Colors.WHITE);
                const fromCell = new Cell(1, 3, 5, Colors.WHITE, whiteShatra);

                // Invalid moves (назад - вниз)
                expect(whiteShatra.canMove(fromCell, new Cell(2, 3, 6, Colors.BLACK, null))).toBe(false); // назад (вниз)
                expect(whiteShatra.canMove(fromCell, new Cell(2, 2, 6, Colors.BLACK, null))).toBe(false); // назад-влево
                expect(whiteShatra.canMove(fromCell, new Cell(2, 4, 6, Colors.BLACK, null))).toBe(false); // назад-вправо
            });

            test('should return false for same cell', () => {
                const shatra = new Shatra('test', Colors.BLACK);
                const fromCell = new Cell(1, 3, 5, Colors.BLACK, shatra);

                expect(shatra.canMove(fromCell, fromCell)).toBe(false);
            });
        });

        describe('constructor and properties', () => {
            test('should create shatra with correct properties', () => {
                const shatra = new Shatra('test-id', Colors.BLACK);

                expect(shatra.id).toBe('test-id');
                expect(shatra.color).toBe(Colors.BLACK);
                expect(shatra.logo).toBe(Figures.Shatra);
            });
        });
    })
})