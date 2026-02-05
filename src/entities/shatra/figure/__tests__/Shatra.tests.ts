import { ShatraBoard as Board, Figures, Player, ShatraCell } from "@/entities"
import { Shatra } from "../model/Shatra";



describe("Shatra Figure tests", () => {
    describe("Basic Movement for white shatra", () => {
        let board: Board;

        beforeEach(() => {
            board = new Board();
            board.initCells();
        });


        test("Shatra can move one cell from starting position", () => {
            board.initFigures();
            const from = board.getCell(5, 8)!;

            expect(from.figure).toBeInstanceOf(Shatra);
            expect(from.figure!.color).toBe(Player.WHITE);


            const moves = board.getAvailableMoves(from!);

            expect(moves).toContain(board.getCell(6, 7));
            expect(moves).toContain(board.getCell(5, 7));
            expect(moves).toContain(board.getCell(4, 7));

        });

        test("Shatra in reserve can move from starting position", () => {
            board.initFigures();
            const from = board.getCell(2, 11)!;

            expect(from.figure).toBeInstanceOf(Shatra);
            expect(from.figure!.color).toBe(Player.WHITE);

            const moves = board.getAvailableMoves(from!);

            expect(moves).toContain(board.getCell(0, 7));
            expect(moves).toContain(board.getCell(1, 7));
            expect(moves).toContain(board.getCell(2, 7));
            expect(moves).toContain(board.getCell(3, 7));
            expect(moves).toContain(board.getCell(4, 7));
            expect(moves).toContain(board.getCell(5, 7));
            expect(moves).toContain(board.getCell(6, 7));

        });

        test("Shatra that is in reserve cannot be moved unless it is its turn", () => {
            board.initFigures();
            const fromCells = [board.getCell(3, 11)!, board.getCell(4, 11)!, board.getCell(2, 12)!, board.getCell(3, 12)!, board.getCell(4, 12)!, board.getCell(2, 13)!, board.getCell(3, 13)!, board.getCell(2, 13)!];



            fromCells.forEach(from => {
                expect(from.figure).toBeInstanceOf(Shatra);
                expect(from.figure!.color).toBe(Player.WHITE);

                const moves = board.getAvailableMoves(from!);

                expect(moves).toEqual([]);
            });
        });


        test("Possible moves for Shatra in the middle fields", () => {
            board.setFigure(35, new Shatra("test", Player.WHITE));

            const from = board.getCellById(35);

            const moves = board.getAvailableMoves(from!);

            expect(moves).toContain(board.getCellById(34));
            expect(moves).toContain(board.getCellById(36));
            expect(moves).toContain(board.getCellById(27));
            expect(moves).toContain(board.getCellById(28));
            expect(moves).toContain(board.getCellById(29));
        });

        test("Possible moves for Shatra in the enemy fortress", () => {
            board.setFigure(5, new Shatra("test", Player.WHITE));

            const from = board.getCellById(5);
            const moves = board.getAvailableMoves(from!);

            const enemyColor = Player.BLACK;
            const expectedMiddleZoneCells = board.getEmptyMiddleZoneCells(enemyColor);

            expect(moves).toContain(board.getCellById(4));
            expect(moves).toContain(board.getCellById(6));
            expect(moves).toContain(board.getCellById(1));
            expect(moves).toContain(board.getCellById(2));
            expect(moves).toContain(board.getCellById(3));

            expectedMiddleZoneCells.forEach((cell: ShatraCell) => {
                expect(moves).toContain(cell);
            });
        });


        test("Posible moves for Shatra in the enemy biy position", () => {
            board.setFigure(10, new Shatra("test", Player.WHITE));
            board.setFigure(17, new Shatra("test1", Player.WHITE));
            board.setFigure(14, new Shatra("test2", Player.BLACK));

            const from = board.getCellById(10);
            const moves = board.getAvailableMoves(from!);

            const enemyColor = Player.BLACK;
            const expectedMiddleZoneCells = board.getEmptyMiddleZoneCells(enemyColor);

            expect(moves).toContain(board.getCellById(9));
            expect(moves).toContain(board.getCellById(8));
            expect(moves).toContain(board.getCellById(7));



            expectedMiddleZoneCells.forEach((cell: ShatraCell) => {
                expect(moves).toContain(cell);
            });

            const fromById17 = board.getCellById(17);
            const movesById17 = board.getAvailableMoves(fromById17!);

            expect(movesById17).toEqual([]);
        });

        test("Checking the Shatra moves", () => {
            board.setFigure(35, new Shatra("test", Player.WHITE));

            const from = board.getCellById(35);
            const makeMove = board.makeMove(from!, board.getCellById(28)!);
            expect(makeMove).toEqual(true);


            expect(board.getCellById(28)?.figure?.logo).toBe(Figures.Shatra);
            expect(board.getCellById(28)?.figure?.color).toBe(Player.WHITE);
            expect(board.getCellById(35)?.figure).toBe(null);

            expect(board.makeMove(board.getCellById(28)!, board.getCellById(36)!)).toEqual(false);
        });


        test("Checking Shatra, who is capturing into his own fortress", () => {
            board.setFigure(44, new Shatra("test", Player.WHITE));
            board.setFigure(50, new Shatra("test1", Player.BLACK));

            const from = board.getCellById(44);
            const makeMove = board.makeMove(from!, board.getCellById(53)!);

            expect(makeMove).toBe(false);
            expect(board.getCellById(53)?.figure).toBe(null);

            expect(board.makeMove(from!, board.getCellById(36)!)).toBe(true);
            expect(board.getCellById(36)?.figure?.logo).toBe(Figures.Shatra);
            expect(board.getCellById(36)?.figure?.color).toBe(Player.WHITE);
            expect(from?.figure).toBe(null);
        });


        test("Checking Shatra, who is capturing into to enemy fortress", () => {
            board.setFigure(19, new Shatra("test", Player.WHITE));
            board.setFigure(46, new Shatra("test1", Player.WHITE));
            board.setFigure(13, new Shatra("test2", Player.BLACK));
            board.setFigure(15, new Shatra("test3", Player.BLACK));

            const from = board.getCellById(19);
            const makeMove = board.makeMove(from!, board.getCellById(10)!);

            expect(makeMove).toBe(true);
            expect(board.getCellById(10)?.figure?.logo).toBe(Figures.Shatra);
            expect(board.getCellById(10)?.figure?.color).toBe(Player.WHITE);

            expect(board.currentPlayer).toBe(Player.WHITE);


            expect(board.makeMove(board.getCellById(10)!, board.getCellById(10)!)).toBe(true);
            expect(board.getCellById(10)?.figure?.logo).toBe(Figures.Shatra);
            expect(board.getCellById(10)?.figure?.color).toBe(Player.WHITE);

            expect(from?.figure).toBe(null);


            expect(board.getCellById(13)?.figure).toBe(null);

            expect(board.currentPlayer).toBe(Player.BLACK);

            expect(board.makeMove(board.getCellById(15)!, board.getCellById(14)!)).toBe(true);
            expect(board.getCellById(14)?.figure?.logo).toBe(Figures.Shatra);
            expect(board.getCellById(14)?.figure?.color).toBe(Player.BLACK);

            expect(board.currentPlayer).toBe(Player.WHITE);

            expect(board.isValidMove(board.getCellById(46)!, board.getCellById(39)!)).toBe(false);

            expect(board.makeMove(board.getCellById(46)!, board.getCellById(39)!)).toBe(false);
            expect(board.getCellById(39)?.figure).toBe(null);


            expect(board.makeMove(board.getCellById(10)!, board.getCellById(9)!)).toBe(true);
            expect(board.getCellById(9)?.figure?.logo).toBe(Figures.Shatra);
            expect(board.getCellById(9)?.figure?.color).toBe(Player.WHITE);
        });

        test("When the Shatra figure has two capture options", () => {
            board.setFigure(31, new Shatra("test", Player.WHITE));
            board.setFigure(25, new Shatra("test1", Player.WHITE));
            board.setFigure(46, new Shatra("test1", Player.WHITE));
            board.setFigure(26, new Shatra("test2", Player.BLACK));
            board.setFigure(30, new Shatra("test3", Player.BLACK));

            expect(board.currentPlayer).toBe(Player.WHITE);


            expect(board.hasShatraForcedCapture()).toBe(true);
            expect(board.hasForcedCapture()).toBe(true);

            expect(board.makeMove(board.getCellById(46)!, board.getCellById(47)!)).toBe(false);
            expect(board.makeMove(board.getCellById(31)!, board.getCellById(24)!)).toBe(false);
            expect(board.makeMove(board.getCellById(25)!, board.getCellById(18)!)).toBe(false);
            expect(board.makeMove(board.getCellById(25)!, board.getCellById(27)!)).toBe(true);
        });


    });




    describe("Basic Movement for black shatra", () => {
        let board: Board;

        beforeEach(() => {
            board = new Board();
            board.initCells();
            board.currentPlayer = Player.BLACK;
        });


        test("Shatra can move one cell from starting position", () => {
            board.initFigures();
            const from = board.getCell(1, 5)!;

            expect(from.figure).toBeInstanceOf(Shatra);
            expect(from.figure!.color).toBe(Player.BLACK);


            const moves = board.getAvailableMoves(from!);

            expect(moves).toContain(board.getCell(0, 6));
            expect(moves).toContain(board.getCell(1, 6));
            expect(moves).toContain(board.getCell(2, 6));

        });

        test("Shatra in reserve can move from starting position", () => {
            board.initFigures();
            const from = board.getCell(4, 2)!;

            expect(from.figure).toBeInstanceOf(Shatra);
            expect(from.figure!.color).toBe(Player.BLACK);

            const moves = board.getAvailableMoves(from!);

            expect(moves).toContain(board.getCell(0, 6));
            expect(moves).toContain(board.getCell(1, 6));
            expect(moves).toContain(board.getCell(2, 6));
            expect(moves).toContain(board.getCell(3, 6));
            expect(moves).toContain(board.getCell(4, 6));
            expect(moves).toContain(board.getCell(5, 6));
            expect(moves).toContain(board.getCell(6, 6));

        });

        test("Shatra that is in reserve cannot be moved unless it is its turn", () => {
            board.initFigures();
            const fromCells = [board.getCell(3, 2)!, board.getCell(2, 2)!, board.getCell(4, 1)!, board.getCell(3, 1)!, board.getCell(2, 1)!, board.getCell(4, 0)!, board.getCell(3, 0)!, board.getCell(2, 0)!];

            fromCells.forEach(from => {
                expect(from.figure).toBeInstanceOf(Shatra);
                expect(from.figure!.color).toBe(Player.BLACK);

                const moves = board.getAvailableMoves(from!);

                expect(moves).toEqual([]);
            });
        });

        test("Possible moves for Shatra in the middle fields", () => {
            board.initFigures();
            board.setFigure(28, new Shatra("test", Player.BLACK));

            const from = board.getCellById(28);

            const moves = board.getAvailableMoves(from!);

            expect(moves).toContain(board.getCellById(27));
            expect(moves).toContain(board.getCellById(29));
            expect(moves).toContain(board.getCellById(34));
            expect(moves).toContain(board.getCellById(35));
            expect(moves).toContain(board.getCellById(36));
        });


        test("Possible moves for Shatra in the enemy fortress", () => {
            board.setFigure(58, new Shatra("test", Player.BLACK));

            const from = board.getCellById(58);
            const moves = board.getAvailableMoves(from!);

            const enemyColor = Player.WHITE;
            const expectedMiddleZoneCells = board.getEmptyMiddleZoneCells(enemyColor);

            expect(moves).toContain(board.getCellById(59));
            expect(moves).toContain(board.getCellById(57));
            expect(moves).toContain(board.getCellById(60));
            expect(moves).toContain(board.getCellById(61));
            expect(moves).toContain(board.getCellById(62));

            expectedMiddleZoneCells.forEach((cell: ShatraCell) => {
                expect(moves).toContain(cell);
            });
        });


        test("Posible moves for Shatra in the enemy biy position", () => {
            board.setFigure(53, new Shatra("test", Player.BLACK));
            board.setFigure(46, new Shatra("test1", Player.BLACK));
            board.setFigure(49, new Shatra("test2", Player.WHITE));

            const from = board.getCellById(53);
            const moves = board.getAvailableMoves(from!);

            const enemyColor = Player.WHITE;
            const expectedMiddleZoneCells = board.getEmptyMiddleZoneCells(enemyColor);

            expect(moves).toContain(board.getCellById(54));
            expect(moves).toContain(board.getCellById(55));
            expect(moves).toContain(board.getCellById(56));



            expectedMiddleZoneCells.forEach((cell: ShatraCell) => {
                expect(moves).toContain(cell);
            });

            const fromById46 = board.getCellById(17);
            const movesById46 = board.getAvailableMoves(fromById46!);

            expect(movesById46).toEqual([]);


        });


        test("Checking the Shatra moves", () => {
            board.setFigure(35, new Shatra("test", Player.BLACK));

            const from = board.getCellById(35);
            const makeMove = board.makeMove(from!, board.getCellById(42)!);
            expect(makeMove).toEqual(true);


            expect(board.getCellById(42)?.figure?.logo).toBe(Figures.Shatra);
            expect(board.getCellById(42)?.figure?.color).toBe(Player.BLACK);
            expect(board.getCellById(35)?.figure).toBe(null);

            expect(board.makeMove(board.getCellById(42)!, board.getCellById(36)!)).toEqual(false);
        });

        test("Checking Shatra, who is capturing into his own fortress", () => {
            board.setFigure(13, new Shatra("test", Player.BLACK));
            board.setFigure(10, new Shatra("test1", Player.WHITE));

            const from = board.getCellById(13);
            const makeMove = board.makeMove(from!, board.getCellById(9)!);

            expect(makeMove).toBe(false);
            expect(board.getCellById(9)?.figure).toBe(null);

            expect(board.makeMove(from!, board.getCellById(20)!)).toBe(true);
            expect(board.getCellById(20)?.figure?.logo).toBe(Figures.Shatra);
            expect(board.getCellById(20)?.figure?.color).toBe(Player.BLACK);
            expect(from?.figure).toBe(null);

        });

        test("Checking Shatra, who is capturing into to enemy fortress", () => {
            board.setFigure(44, new Shatra("test", Player.BLACK));
            board.setFigure(11, new Shatra("test1", Player.BLACK));
            board.setFigure(50, new Shatra("test2", Player.WHITE));
            board.setFigure(48, new Shatra("test3", Player.WHITE));


            const from = board.getCellById(44);
            const makeMove = board.makeMove(from!, board.getCellById(53)!);

            expect(makeMove).toBe(true);
            expect(board.getCellById(53)?.figure?.logo).toBe(Figures.Shatra);
            expect(board.getCellById(53)?.figure?.color).toBe(Player.BLACK);

            expect(board.currentPlayer).toBe(Player.BLACK);


            expect(board.makeMove(board.getCellById(53)!, board.getCellById(53)!)).toBe(true);
            expect(board.getCellById(53)?.figure?.logo).toBe(Figures.Shatra);
            expect(board.getCellById(53)?.figure?.color).toBe(Player.BLACK);

            expect(from?.figure).toBe(null);


            expect(board.getCellById(50)?.figure).toBe(null);

            expect(board.currentPlayer).toBe(Player.WHITE);


            expect(board.makeMove(board.getCellById(48)!, board.getCellById(49)!)).toBe(true);
            expect(board.getCellById(49)?.figure?.logo).toBe(Figures.Shatra);
            expect(board.getCellById(49)?.figure?.color).toBe(Player.WHITE);

            expect(board.currentPlayer).toBe(Player.BLACK);

            expect(board.isValidMove(board.getCellById(11)!, board.getCellById(12)!)).toBe(false);

            expect(board.makeMove(board.getCellById(11)!, board.getCellById(12)!)).toBe(false);
            expect(board.getCellById(12)?.figure).toBe(null);


            expect(board.makeMove(board.getCellById(53)!, board.getCellById(54)!)).toBe(true);
            expect(board.getCellById(54)?.figure?.logo).toBe(Figures.Shatra);
            expect(board.getCellById(54)?.figure?.color).toBe(Player.BLACK);
        });


        test("When the Shatra figure has two capture options", () => {
            board.setFigure(31, new Shatra("test", Player.BLACK));
            board.setFigure(25, new Shatra("test1", Player.BLACK));
            board.setFigure(46, new Shatra("test3", Player.BLACK));
            board.setFigure(26, new Shatra("test2", Player.WHITE));
            board.setFigure(30, new Shatra("test3", Player.WHITE));



            expect(board.currentPlayer).toBe(Player.BLACK);


            expect(board.hasShatraForcedCapture()).toBe(true);
            expect(board.hasForcedCapture()).toBe(true);

            expect(board.makeMove(board.getCellById(46)!, board.getCellById(47)!)).toBe(false);
            expect(board.makeMove(board.getCellById(31)!, board.getCellById(24)!)).toBe(false);
            expect(board.makeMove(board.getCellById(25)!, board.getCellById(18)!)).toBe(false);
            expect(board.makeMove(board.getCellById(25)!, board.getCellById(27)!)).toBe(true);


        });
    });
});