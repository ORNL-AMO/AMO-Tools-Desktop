import React from 'react';
import DiagramBaseEdge from './DiagramBaseEdge';
import { BezierEdge, EdgeProps } from '@xyflow/react';

export default function BezierDiagramEdge(props: EdgeProps) {
  return (
    <DiagramBaseEdge {...props} baseEdgeComponent={BezierEdge}></DiagramBaseEdge>
  );
}
