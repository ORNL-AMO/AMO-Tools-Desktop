import React from 'react';
import DiagramEdge from './DiagramBaseEdge';
import { EdgeProps, StepEdge } from '@xyflow/react';

export default function StepDiagramEdge(props: EdgeProps) {
  return (
    <DiagramEdge {...props} baseEdgeComponent={StepEdge}></DiagramEdge>
  );
}
