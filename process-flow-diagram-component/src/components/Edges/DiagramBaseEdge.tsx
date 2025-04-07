import { CSSProperties, Fragment, ReactNode, useContext } from 'react';
import { BaseEdge, BezierEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, SmoothStepEdge, StepEdge, StraightEdge, useNodeConnections } from '@xyflow/react';
import EditDataDrawerButton from '../Drawer/EditDataDrawerButton';
import FlowValueDisplay from '../Diagram/FlowValueDisplay';
import FlowDisplayUnit from '../Diagram/FlowDisplayUnit';
import { useAppDispatch, useAppSelector } from '../../hooks/state';
import { toggleDrawer } from '../Diagram/diagramReducer';
import { RootState } from '../Diagram/store';
import { CustomEdgeData } from 'process-flow-lib';

const EdgeFlowValueLabel = ({ transform, selected, flowValue, scale }: { transform: string; selected: boolean, flowValue: number | string, scale: number }) => {
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
       <div style={style} className={"nodrag nopan"}>
        <>
          <FlowValueDisplay flowValue={flowValue}/>
          <FlowDisplayUnit/>
        </>
       </div>
  );
}


export default function DiagramBaseEdge(props: DiagramEdgeProps) {
  const dispatch = useAppDispatch();
  const sourceX = props.sourceX;
  const sourceY = props.sourceY;
  const sourcePosition = props.sourcePosition;
  const targetX = props.targetX;
  const targetY = props.targetY;
  const targetPosition = props.targetPosition;

  const showFlowLabels = useAppSelector((state: RootState) => state.diagram.diagramOptions.showFlowLabels);
  const flowLabelSize = useAppSelector((state: RootState) => state.diagram.diagramOptions.flowLabelSize);
  // const focusedEdgeId = useAppSelector((state: RootState) => state.diagram.focusedEdgeId);

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
    // if (focusedEdgeId === props.id) {
    //   customStyle.stroke = '#007bff';
    //   customStyle.strokeWidth = String(Number(customStyle.strokeWidth) * 2);
    // } 
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

  const onEditEdge = () => {
    dispatch(toggleDrawer(props.id));
  }

  const connections = useNodeConnections({ handleType: 'target', handleId: props.targetHandleId, id: props.target });

  const editButtonTransform = `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`;
  let translateXStart = '-50';
  let translateYStart = '50';
  let flowLabelTransform = `translate(-50%, -100%) translate(${targetX - 25}px,${targetY - 25}px)`;
  if (connections.length > 1 && props.sourceHandleId === connections[1].sourceHandle) {
    // todo or sourcePosition right
    if (props.sourceHandleId == 'e') {
      translateXStart = '50';
      translateYStart = '50';
    }
    flowLabelTransform = `translate(${translateXStart}%, ${translateYStart}%) translate(${sourceX}px,${sourceY}px)`;
  }

  return (
    <>
      {renderBaseEdgeComponent(props, edgePath)}
      <EdgeLabelRenderer>
        <Fragment>

          <EditDataDrawerButton 
            onEdit={onEditEdge}
            selected={props.selected}
            transformLocation={editButtonTransform}/>

        {showFlowLabels && Boolean(customEdgeData.flowValue) &&
            <EdgeFlowValueLabel
            transform={flowLabelTransform}
            selected={props.selected}
            scale={flowLabelSize !== undefined? flowLabelSize : 1}
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

