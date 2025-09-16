import React from 'react';
import DiagramBaseEdge from './DiagramBaseEdge';
import { EdgeProps, SmoothStepEdge } from '@xyflow/react';

export default function SmoothStepDiagramEdge(props: EdgeProps) {
  return (
    <DiagramBaseEdge {...props} baseEdgeComponent={SmoothStepEdge}></DiagramBaseEdge>
  );
}
