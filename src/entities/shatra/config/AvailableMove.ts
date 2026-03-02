export interface AvailableMove {
    cellId: number;
    x: number;
    y: number;
    isCapture: boolean;
    isForced: boolean;
}