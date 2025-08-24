import { Colors } from "../config/Colors";
import { Figures } from "../config/Figures";
import { Figure } from "./Figure";





export class Shatra extends Figure {
    logo: Figures;

    constructor(id: string, color: Colors) {
        super(id, color);
        this.logo = Figures.Shatra;
    }
}