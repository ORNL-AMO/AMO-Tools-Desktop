import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Node,
  useNodesState,
  useEdgesState,
  addEdge,
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
import useDiagramStateDebounce from '../../hooks/useSaveDebounce';
import { ProcessFlowPart, nodeTypes } from './process-flow-types-and-constants';
import { getNewProcessComponent } from './process-flow-utils';

const defaultEdgeOptions: DefaultEdgeOptions  = {
  animated: true,
  type: 'smoothstep',
};

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

const Flow = (props: FlowProps) => {
  let existingNodes = props.flowDiagramData? props.flowDiagramData.nodes : [];
  let existingEdges = props.flowDiagramData? props.flowDiagramData.edges : [];
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>(existingNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>(existingEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [minimapVisible, setMinimapVisible] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  
  const ref = useRef(null);
  const onConnect: OnConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  const nodeClassName = (node) => node.type;

  useEffect(() => {
    // console.log('First render flow nodes', nodes);
    // console.log('First render flow edges', edges);
  }, []);

  const {debouncedNodes, debouncedEdges} = useDiagramStateDebounce(nodes, edges);

  useEffect(() => {
    props.saveFlowDiagramData({
      nodes: nodes,
      edges: edges,
    });
  }, [debouncedNodes, debouncedEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);


  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('application/reactflow');
      if (typeof nodeType === 'undefined' || !nodeType) {
        return;
      }
      
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
        });
        
      const type = nodeType;
      // todo useCallback?
      const newProcessComponentNode = getNewProcessComponent(nodeType);

      const newNode: Node = {
        id: newProcessComponentNode.diagramNodeId,
        type,
        position,
        className: newProcessComponentNode.className,
        data: newProcessComponentNode
      };

      setNodes((nds) => {
        return nds.concat(newNode)
      });
    },
    [reactFlowInstance],
  );

  const updateMinimap = useCallback((enabled) => {
    setMinimapVisible(enabled);
  }, []);

  const updateControls = useCallback((enabled) => {
    setControlsVisible(enabled);
  }, []);
  console.log('index props.height', props.height)
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
          onClick={() => props.clickEvent('onClick')}
          nodeTypes={nodeTypes}
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