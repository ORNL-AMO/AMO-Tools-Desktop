import { CSSProperties, Fragment, ReactNode, useContext } from 'react';
import { BaseEdge, BezierEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, SmoothStepEdge, StepEdge, StraightEdge, useHandleConnections, useReactFlow } from '@xyflow/react';
import { FlowContext } from '../Flow';
import { CustomEdgeData } from '../../../../src/process-flow-types/shared-process-flow-types';
import EditDataDrawerButton from '../Drawer/EditDataDrawerButton';

const FlowValueLabel = ({ transform, selected, flowValue, scale }: { transform: string; selected: boolean, flowValue: number, scale: number }) => {
  let adjustedTransform = transform + ` scale(${scale})`;
  let style: CSSProperties = {
    position: 'absolute',
    background: '#fff',
    border: 'solid 1px #3055cf',
    padding: 8,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 700,
    transform: adjustedTransform,
    zIndex: 1000,
    transition: 'all 100ms ease-out',
    transformOrigin: 'center'
  }
  if (selected) {
      let adjustedScale = scale * 1.5;
      let emphasisTransform = transform + ` scale(${adjustedScale})`;
      style.transform = emphasisTransform;
      style.zIndex = 10001;
      style.transition = 'all 100ms ease-in'
  }

  return (
       <div style={style} className={"nodrag nopan"}>{Number(flowValue).toFixed(3)}</div>
  );
}


export default function DiagramBaseEdge(props: DiagramEdgeProps) {
  const flowContext = useContext(FlowContext);

  const sourceX = props.sourceX;
  const sourceY = props.sourceY;
  const sourcePosition = props.sourcePosition;
  const targetX = props.targetX;
  const targetY = props.targetY;
  const targetPosition = props.targetPosition;
  const { setEdges } = useReactFlow();

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

  const customEdgeData = props.data as CustomEdgeData;
  const renderBaseEdgeComponent = (props: DiagramEdgeProps, edgePath: string) => {
    const customStyle = {
      ...props.style,
    }
    switch (props.baseEdgeComponent) {
      case BezierEdge:
        return <BezierEdge {...props} style={customStyle} />
      case StraightEdge:
        return <StraightEdge {...props} style={customStyle} />
      case StepEdge:
        return <StepEdge {...props} style={customStyle} />
      case SmoothStepEdge:
        return <SmoothStepEdge {...props} style={customStyle} />
      default:
        return <BaseEdge {...props} path={edgePath} style={{ ...props.style }} />
    }
  }

  const connections = useHandleConnections({ type: 'target', id: props.targetHandleId, nodeId: props.target });

  let showEndLabel = true;
  let translateXStart = '-50';
  let translateYStart = '50';
  if (connections.length > 1 && props.sourceHandleId === connections[1].sourceHandle) {
    showEndLabel = false;
    // todo or sourcePosition right
    if (props.sourceHandleId == 'e') {
      translateXStart = '50';
      translateYStart = '50';
    }
  }

  const transformString = `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`;

  const onEditEdge = () => {
    flowContext.setManageDataId(props.id);
    flowContext.setIsDataDrawerOpen(true);
}

  return (
    <>
      {renderBaseEdgeComponent(props, edgePath)}
      <EdgeLabelRenderer>
        <Fragment>

          <EditDataDrawerButton 
            onEdit={onEditEdge}
            selected={props.selected}
            transformLocation={transformString}/>

        {flowContext.userDiagramOptions.showFlowValues && !showEndLabel &&
            <FlowValueLabel
            transform={`translate(${translateXStart}%, ${translateYStart}%) translate(${sourceX}px,${sourceY}px)`}
            selected={props.selected}
            scale={flowContext.userDiagramOptions.flowLabelSize !== undefined? flowContext.userDiagramOptions.flowLabelSize : 1}
            flowValue={customEdgeData.flowValue}
            />
        }
        {flowContext.userDiagramOptions.showFlowValues && showEndLabel &&
            <FlowValueLabel
            transform={`translate(-50%, -100%) translate(${targetX - 25}px,${targetY - 25}px)`}
            selected={props.selected}
            scale={flowContext.userDiagramOptions.flowLabelSize !== undefined? flowContext.userDiagramOptions.flowLabelSize : 1}
            flowValue={customEdgeData.flowValue}
            />
        }
        </Fragment>

      </EdgeLabelRenderer>
    </>
  );
}

export interface DiagramEdgeProps extends EdgeProps {
    selfConnectingPath?: SelfConnectingPath;
    baseEdgeComponent?: ReactFlowEdgeElement;
    reactFlowRef?: any;
}

interface SelfConnectingPath {
  edgePath?: string;
  labelX?: number;
  labelY?: number;
}

type ReactFlowEdgeElement = (props: EdgeProps) => ReactNode;

