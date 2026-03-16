
import { KonvaEventObject } from "konva/lib/Node";

import { ShatraCell as Cell } from "@/entities/shatra/cell/model/ShatraCell";
import { Colors } from "@/entities/shatra/config/Colors"
import { Figures } from "@/entities/shatra/config/Figures";
import { Player } from "@/entities/shatra/config/Player";
import { Field } from "@/entities/shatra/ui/Field/field";
import { FigureLogo } from "@/entities/shatra/ui/Figure/figure";


const handleMouseOver = (e: KonvaEventObject<MouseEvent>) => {
  const stage = e.target.getStage();
  if (stage && stage.container()) {
    stage.container().style.cursor = 'grab';
  }
};
const handleMouseOut = (e: KonvaEventObject<MouseEvent>) => {

  const stage = e.target.getStage();
  if (stage && stage.container()) {
    stage.container().style.cursor = 'default';
  }
};

type BoardCellProps = {
  id: number;
  x: number;
  y: number;
  color: Colors;
  figureColor: Player | undefined;
  figure: Figures | null | undefined;
  handleDragStart: (e: KonvaEventObject<DragEvent>) => void;
  handleDragEnd: (e: KonvaEventObject<DragEvent>) => void;
  handleDragMove: (e: KonvaEventObject<DragEvent>) => void;
  onMouseMove?: (e: KonvaEventObject<MouseEvent>) => void;
  isAvailableMove: boolean;
  isLastMove?: boolean;
  isCaptureMove: boolean;
  isHovered?: boolean;
  isSelected?: boolean;
  isActiveCaptureFigure?: Cell | null;
  hasForcedCapture: boolean;
  onClick?: () => void;
  isAnimating?: boolean;
  targetX?: number;
  targetY?: number;
  onAnimationComplete?: () => void;
};


const BoardCell: React.FC<BoardCellProps> = ({
  id,
  x,
  y,
  color,
  figureColor,
  figure,
  handleDragStart,
  handleDragEnd,
  isAvailableMove,
  isLastMove,
  isCaptureMove,
  handleDragMove,
  onMouseMove,
  isHovered,
  isSelected,
  isActiveCaptureFigure,
  onClick,
  isAnimating,
  targetX,
  targetY,
  onAnimationComplete
}) => {



  return (
    <Field
      id={id}
      x={x}
      y={y}
      color={color}
      isAvailableMove={isAvailableMove}
      isLastMove={isLastMove}
      isCaptureMove={isCaptureMove}
      isHovered={isHovered}
      isSelected={isSelected}
      isActiveCaptureFigure={isActiveCaptureFigure}
      onClick={onClick}
      onMouseMove={onMouseMove}
    >
      {
        figure && figureColor && (
          <FigureLogo
            color={figureColor}
            figure={figure}
            isAnimating={isAnimating}
            targetX={targetX}
            targetY={targetY}
            cellX={x}
            cellY={y}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            onAnimationComplete={onAnimationComplete}
          />
        )}
    </Field>
  );
};

export { BoardCell };