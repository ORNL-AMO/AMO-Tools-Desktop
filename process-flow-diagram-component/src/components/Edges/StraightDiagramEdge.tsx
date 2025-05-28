import React from 'react';

import DiagramEdge from './DiagramBaseEdge';
import { EdgeProps, StraightEdge } from '@xyflow/react';

export default function StraightDiagramEdge(props: EdgeProps) {
  return (
    <DiagramEdge {...props} baseEdgeComponent={StraightEdge}></DiagramEdge>
  );
}
