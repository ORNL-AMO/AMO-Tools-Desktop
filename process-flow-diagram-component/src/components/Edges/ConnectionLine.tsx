import { ConnectionLineComponentProps, useConnection } from '@xyflow/react';

export const ConnectionLine = (props: ConnectionLineComponentProps) => {
const { fromHandle } = useConnection();
console.log('ConnectionLineProps', props);
console.log('fromHandle', fromHandle)
// todo use a node map lookup for color
  return (
    <g>
      <path
        fill="none"
        stroke={fromHandle.id}
        strokeWidth={1.5}
        className="animated"
        d={`M${props.fromX},${props.fromY} C ${props.fromX} ${props.toY} ${props.fromX} ${props.toY} ${props.toX},${props.toY}`}
      />
      <circle
        cx={props.toX}
        cy={props.toY}
        fill={fromHandle.id}
        r={3}
        stroke={fromHandle.id}
        strokeWidth={1.5}
      />
    </g>
  );
};

