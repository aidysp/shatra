'use client'

import { Colors } from '@/shatra-core/src/config/Colors';
import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Circle, Group, Rect, Text } from 'react-konva';

interface FieldProps {
  id: number;
  x: number,
  y: number,
  color: Colors,
  children: React.ReactNode;
  isAvailableMove?: boolean;
  isHovered?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onMouseMove?: (e: KonvaEventObject<MouseEvent>) => void;
}

const Field: React.FC<FieldProps> = ({ id, x, y, color, children, isAvailableMove, isHovered, onClick, onMouseMove }) => {
  return (
    <Group
      x={x * 40}
      y={y * 40}
      onClick={onClick}
      onMouseMove={onMouseMove}
    >
      <Rect
        x={0}
        y={0}
        width={40}
        height={40}
        fill={color}
      />

      {isHovered && (
        <Rect
          x={0}
          y={0}
          width={40}
          height={40}
          fill="#3B82F6"
          opacity={0.3}
        />
      )}


      {isAvailableMove && (
        <Circle
          x={20}
          y={20}
          radius={5}
          fill="#0D83CD"
          opacity={0.8}
          stroke="#0D83CD"
          strokeWidth={1.5}
        />
      )}
      <Text
        x={2}
        y={2}
        width={40}
        height={40}
        align={"left"}
        verticalAlign={'top'}
        fontSize={10}
        fontStyle='bold'
        text={`${id}`}
        fill={Colors.COORDINATE}
        opacity={0.5}
      />
      {children}
    </Group>

  );
};

export { Field };