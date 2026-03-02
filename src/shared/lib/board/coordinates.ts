export const findNearestCellId = (
    displayX: number,
    displayY: number,
    cells: Array<{ id: number; x: number; y: number; displayX: number; displayY: number }>
): number | null => {
    let nearestCellId = null;
    let minDistance = Infinity;
    const MAGNET_THRESHOLD = 30;

    cells.forEach(cell => {
        const cellCenterX = cell.displayX * 40 + 20;
        const cellCenterY = cell.displayY * 40 + 20;

        const distance = Math.sqrt(Math.pow(displayX - cellCenterX, 2) + Math.pow(displayY - cellCenterY, 2));

        if (distance < minDistance && distance < MAGNET_THRESHOLD) {
            minDistance = distance;
            nearestCellId = cell.id;
        }
    });

    return nearestCellId;
}