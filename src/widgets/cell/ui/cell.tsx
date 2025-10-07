import { Field } from "@/entities/field";
import { FigureLogo } from "@/entities/figure";
import { Colors } from "@/shatra-core/src/config/Colors";
import { Figures } from "@/shatra-core/src/config/Figures";
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
  figureColor: Colors | undefined;
  figure: Figures | null | undefined;
  handleDragStart: (e: KonvaEventObject<DragEvent>) => void;
  handleDragEnd: (e: KonvaEventObject<DragEvent>) => void;
  handleDragMove: (e: KonvaEventObject<DragEvent>) => void;
  onMouseMove?: (e: KonvaEventObject<MouseEvent>) => void;
  isAvailableMove: boolean;
  isHovered?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
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
  handleDragMove,
  onMouseMove,
  isHovered,
  isSelected,
  onClick,
}) => {

  return (
    <Field
      id={id}
      x={x}
      y={y}
      color={color}
      isAvailableMove={isAvailableMove}
      isHovered={isHovered}
      isSelected={isSelected}
      onClick={onClick}
      onMouseMove={onMouseMove}
    >
      {
        figure && figureColor && (
          <FigureLogo
            color={figureColor}
            figure={figure}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          />
        )}
    </Field>
  );
};

export { CellWidget };