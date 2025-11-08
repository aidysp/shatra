'use client'

import { Cell } from '@/shatra-core/src/Cell';
import { Colors } from '@/shatra-core/src/config/Colors';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { useEffect, useState } from 'react';
import { Circle, Group, Rect, Text } from 'react-konva';

interface FieldProps {
  id: number;
  x: number,
  y: number,
  color: Colors,
  children: React.ReactNode;
  isAvailableMove?: boolean;
  isLastMove?: boolean;
  isCaptureMove?: boolean;
  isHovered?: boolean;
  isSelected?: boolean;
  isActiveCaptureFigure?: Cell | null;
  hasForcedCapture: boolean;
  onClick?: () => void;
  onMouseMove?: (e: KonvaEventObject<MouseEvent>) => void;
}

const Field: React.FC<FieldProps> = ({ id, x, y, color, children, isAvailableMove, isLastMove, isCaptureMove, hasForcedCapture, isHovered, isSelected, onClick, onMouseMove }) => {
  const cellSize = 40;

  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (hasForcedCapture) {
      const interval = setInterval(() => {
        setPulse(prev => (prev + 1) % 60);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [hasForcedCapture]);

  const pulseScale = 1 + Math.sin(pulse * 0.1) * 0.1;

  return (
    <Group
      x={x * cellSize}
      y={y * cellSize}
      onClick={onClick}
      onTap={onClick}
      onMouseMove={onMouseMove}
    >



      <Rect
        x={0}
        y={0}
        width={cellSize}
        height={cellSize}
        fill={color}
      />

      {hasForcedCapture && (
        <Circle
          x={cellSize / 2}
          y={cellSize / 2}
          radius={(cellSize / 2 - 2) * pulseScale}
          fillRadialGradientStartPoint={{ x: 0, y: 0 }}
          fillRadialGradientEndPoint={{ x: 0, y: 0 }}
          fillRadialGradientStartRadius={0}
          fillRadialGradientEndRadius={cellSize / 2}
          fillRadialGradientColorStops={[
            0, 'rgba(255, 0, 0, 0.7)',
            0.5, 'rgba(255, 0, 0, 0.4)',
            1, 'rgba(255, 0, 0, 0.0)'
          ]}
          shadowColor="red"
          shadowBlur={15 + Math.sin(pulse * 0.1) * 3}
          shadowOpacity={0.4 + Math.sin(pulse * 0.08) * 0.1}
          listening={false}
        />
      )}

      {isLastMove && (
        <Rect
          x={0}
          y={0}
          width={cellSize}
          height={cellSize}
          fill="#FFE55C"
          opacity={0.5}
        />
      )}

      {isSelected && (
        <Rect
          x={0}
          y={0}
          width={cellSize}
          height={cellSize}
          fill="#3B82F6"
          opacity={0.3}
        />

      )}



      {isHovered && (
        <Rect
          x={0}
          y={0}
          width={cellSize}
          height={cellSize}
          fill="#3B82F6"
          opacity={0.3}
        />
      )}


      {isCaptureMove && (
        <Circle
          x={20}
          y={20}
          radius={5}
          fill="#FF073A"
          opacity={0.7}
          stroke="#FF073A"
          strokeWidth={1}
          shadowColor="#FF073A"
          shadowBlur={10}
          shadowOpacity={0.8}
        />
      )}

      {isAvailableMove && !isCaptureMove && (
        <Circle
          x={20}
          y={20}
          radius={5}
          fill="#0D83CD"
          opacity={0.6}
          stroke="#0D83CD"
          strokeWidth={1}
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