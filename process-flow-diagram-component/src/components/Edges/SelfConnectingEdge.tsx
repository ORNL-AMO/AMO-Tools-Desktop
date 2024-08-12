import React from 'react';
import DiagramEdge from './DiagramBaseEdge';
import { BezierEdge, EdgeProps } from '@xyflow/react';

export default function SelfConnectingEdge(props: EdgeProps) {
  // we are using the default bezier edge when source and target ids are different
  if (props.source !== props.target) {
    return <BezierEdge {...props} />;
  }

  let { sourceX, sourceY, targetX, targetY, id, markerEnd } = props;
  const radiusX = (sourceX - targetX) * 0.6;
  const radiusY = 50;
  const edgePath: string = `M ${sourceX - 5} ${sourceY} A ${radiusX} ${radiusY} 0 1 0 ${
    targetX + 2
  } ${targetY}`;

  return <DiagramEdge {...props}
    selfConnectingPath={{
      edgePath: edgePath,
      labelX: sourceX,
      labelY: sourceY
    }}
  />;
}
