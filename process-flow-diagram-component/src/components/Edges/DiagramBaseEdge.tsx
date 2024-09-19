import { ReactNode } from 'react';
import CloseIcon from '@mui/icons-material/Close';

import { BaseEdge, BezierEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, SmoothStepEdge, StepEdge, StraightEdge, useReactFlow } from '@xyflow/react';

export default function DiagramBaseEdge(props: DiagramEdgeProps) {
  const sourceX = props.sourceX;
  const sourceY = props.sourceY;
  const sourcePosition = props.sourcePosition;
  const targetX = props.targetX;
  const targetY = props.targetY;
  const targetPosition = props.targetPosition;
  const {setEdges} = useReactFlow();
  
  let [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  if (props.selfConnectingPath) {
    edgePath = props.selfConnectingPath.edgePath;
    labelX = props.selfConnectingPath.labelX;
    labelY = props.selfConnectingPath.labelY;
  }

  const onDeleteEdge = () => {
    setEdges((edges) => edges.filter((edg) => edg.id !== props.id));
  };
  
const renderBaseEdgeComponent = (props: DiagramEdgeProps, edgePath: string) => {
  const customStyle = {
    ...props.style,
  }
  switch (props.baseEdgeComponent) {
    case BezierEdge:
      return <BezierEdge {...props} style={customStyle}/>
    case StraightEdge:
      return <StraightEdge {...props} style={customStyle}/>
    case StepEdge:
      return <StepEdge {...props} style={customStyle}/>
    case SmoothStepEdge:
      return <SmoothStepEdge {...props} style={customStyle}/>
    default:
      return <BaseEdge {...props} path={edgePath} style={{...props.style}}/> 
  }
}

  const transformString = `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`;
  return (
    <>
    {renderBaseEdgeComponent(props, edgePath)}
    {props.selected &&
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: transformString,
            fontSize: 16,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          >
          <button className="close-button hover-highlight" onClick={onDeleteEdge}>
            <CloseIcon sx={{width: 'unset', height: 'unset'}} />
          </button>
        </div>
      </EdgeLabelRenderer>
      }
    </>
  );
}

export interface DiagramEdgeProps extends EdgeProps {
    selfConnectingPath?: SelfConnectingPath;
    baseEdgeComponent?: ReactFlowEdgeElement;
    reactFlowRef?: any;
}

export interface CustomEdgeData extends Record<string, unknown> {
  flowPercent: number
}

interface SelfConnectingPath {
  edgePath?: string;
  labelX?: number;
  labelY?: number;
}

type ReactFlowEdgeElement = (props: EdgeProps) => ReactNode;

