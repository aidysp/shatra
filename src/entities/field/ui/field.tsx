'use client'

import { Colors } from '@/shatra-core/src/config/Colors';
import React from 'react';
import { Group, Rect, Text } from 'react-konva';

interface FieldProps {
  id: number;
  x: number,
  y: number,
  color: Colors,
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ id, x, y, color, children }) => {
  return (
    <Group x={x * 40} y={y * 40}>
      <Rect
        x={0}
        y={0}
        width={40}
        height={40}
        fill={color}
        shadowColor="gray"
        shadowBlur={10}
      />
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
        opacity={0}
      />
      {children}
    </Group>

  );
};

export { Field };