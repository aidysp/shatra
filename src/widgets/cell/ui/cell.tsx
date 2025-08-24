import { Field } from "@/entities/field";
import { FigureLogo } from "@/entities/figure";
import { Colors } from "@/shatra-core/src/config/Colors";
import { Figures } from "@/shatra-core/src/config/Figures";
import { Layer as KonvaLayer } from 'konva/lib/Layer';
import { RefObject } from "react";


type CellWidgetProps = {
  id: number,
  x: number,
  y: number,
  color: Colors,
  figureColor: Colors | undefined,
  figure: Figures | null | undefined,
  tempLayerRef: RefObject<KonvaLayer | null>,
};

const CellWidget: React.FC<CellWidgetProps> = ({
  id,
  x,
  y,
  color,
  figureColor,
  figure,
  tempLayerRef
}) => {
  return (
    <Field
      id={id}
      x={x}
      y={y}
      color={color}

    >
      <FigureLogo color={figureColor} figure={figure} tempLayerRef={tempLayerRef} />
    </Field>
  );
};

export { CellWidget };