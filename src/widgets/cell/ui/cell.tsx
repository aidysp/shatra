import { Field } from "@/entities/field";
import { FigureLogo } from "@/entities/figure";
import { Cell } from "@/shatra-core/src/Cell";
import { Colors } from "@/shatra-core/src/config/Colors";
import { Figures } from "@/shatra-core/src/config/Figures";
import { Player } from "@/shatra-core/src/config/Player";
import { KonvaEventObject } from "konva/lib/Node";



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

type CellWidgetProps = {
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


const CellWidget: React.FC<CellWidgetProps> = ({
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
  hasForcedCapture,
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
      hasForcedCapture={hasForcedCapture}
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

export { CellWidget };