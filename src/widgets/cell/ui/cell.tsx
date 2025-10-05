import { Field } from "@/entities/field";
import { FigureLogo } from "@/entities/figure";
import { Colors } from "@/shatra-core/src/config/Colors";
import { Figures } from "@/shatra-core/src/config/Figures";
import { KonvaEventObject } from "konva/lib/Node";


type CellWidgetProps = {
  id: number,
  x: number,
  y: number,
  color: Colors,
  figureColor: Colors | undefined,
  figure: Figures | null | undefined,
  handleDragStart: (e: KonvaEventObject<DragEvent>) => void,
  handleDragEnd: (e: KonvaEventObject<DragEvent>) => void
};


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

const CellWidget: React.FC<CellWidgetProps> = ({
  id,
  x,
  y,
  color,
  figureColor,
  figure,
  handleDragStart,
  handleDragEnd
}) => {



  return (
    <Field
      id={id}
      x={x}
      y={y}
      color={color}

    >
      <FigureLogo
        color={figureColor}
        figure={figure}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      />
    </Field>
  );
};

export { CellWidget };