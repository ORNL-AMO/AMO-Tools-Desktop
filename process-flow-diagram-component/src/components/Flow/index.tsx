import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Node,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  ConnectionLineType,
  MiniMap,
  Controls,
  Background,
  Position,
  ReactFlowProvider,
  NodeTypes,
  DefaultEdgeOptions,
  OnConnect,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Sidebar from '../Sidebar/Sidebar';
import { FlowDiagramData } from '../../../../src/process-flow-types/shared-process-flow-types';
import { setCustomEdges, setDroppedNode, updateStaleNodes } from './FlowUtils';
import { edgeTypes, nodeTypes } from './FlowTypes';
import useDiagramStateDebounce from '../../hooks/useSaveDebounce';

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
  type: 'smoothstep',
};

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };
const nodeClassName = (node: Node) => node.type;

const Flow = (props: FlowProps) => {
  let staleParentNodes = [];
  let existingNodes = [];
  let existingEdges = [];
  if (props.flowDiagramData) {
    staleParentNodes = props.flowDiagramData.nodes.filter(node => !node.position);
    existingNodes = props.flowDiagramData.nodes.filter(node => node.position);
    existingEdges = props.flowDiagramData.edges;
  }

  
  // todo 6876 you have unplaced nodes from the assessment notif
  
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [staleNodes, setStaleNodes] = useState<Node[]>(staleParentNodes);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>(existingNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>(existingEdges);
  const [minimapVisible, setMinimapVisible] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (reactFlowInstance && props.height && staleNodes) {
      let updatedNodes = updateStaleNodes(reactFlowInstance, [...staleNodes], props.height);
      setStaleNodes(undefined);
      setNodes(nds => nds.concat(updatedNodes));
    }
  }, [reactFlowInstance]);

  const { debouncedNodes, debouncedEdges } = useDiagramStateDebounce(nodes, edges);

  useEffect(() => {
    if (!staleNodes) {
      props.saveFlowDiagramData({
        nodes: nodes,
        edges: edges,
      });
    }
  }, [debouncedNodes, debouncedEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => setDroppedNode(event, reactFlowInstance, setNodes),
    [reactFlowInstance],
  );

  const onConnect: OnConnect = useCallback(
    (params: Connection | Edge) => setCustomEdges(params, setEdges),
    [setEdges]
  );

  const updateMinimap = useCallback((enabled) => {
    setMinimapVisible(enabled);
  }, []);

  const updateControls = useCallback((enabled) => {
    setControlsVisible(enabled);
  }, []);

  return (
    props.height &&
    <div className="process-flow-diagram">
      {/* // * wrap with ReactFlowProvider to access ReactFlow context in   */}
      <ReactFlowProvider>
        <div className={'flow-wrapper'} style={{ height: props.height }}>
          <ReactFlow
            nodes={nodes}
            onNodesChange={onNodesChange}
            edges={edges}
            ref={ref}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            defaultViewport={defaultViewport}
            connectionLineType={ConnectionLineType.SmoothStep}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            className="flow"
          >
            {minimapVisible &&
              <MiniMap zoomable pannable nodeClassName={nodeClassName} />
            }
            {controlsVisible &&
              <Controls />
            }
            <Background />
          </ReactFlow>
        </div>
        <Sidebar
          minimapVisibleCallback={updateMinimap}
          controlsVisibleCallback={updateControls}
          shadowRoot={props.shadowRoot}
        />
      </ReactFlowProvider>
    </div>
  );
}

export default Flow;
export interface FlowProps {
  shadowRoot,
  height?: number,
  flowDiagramData: FlowDiagramData;
  clickEvent: (...args) => void;
  saveFlowDiagramData: (flowDiagramData: FlowDiagramData) => void;
}