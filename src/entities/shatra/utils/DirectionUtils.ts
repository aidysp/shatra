import { Player } from "../config/Player";

export class DirectionUtils {
    static getPlayerDirection(color: Player): number {
        return color === Player.BLACK ? 1 : -1;
    }
}