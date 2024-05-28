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

import CustomNode from './CustomNode';
import DownloadButton from '../DownloadButton';
import Sidebar from './Sidebar';
// programmatically generate from constant
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const defaultEdgeOptions: DefaultEdgeOptions  = {
  animated: true,
  type: 'smoothstep',
};

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

let id = 0;
const getId = () => `dndnode_${id++}`;

const Flow = (props: FlowProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  const ref = useRef(null);
  const onConnect: OnConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  const nodeClassName = (node) => node.type;

  useEffect(() => {
      console.log('Flow props', props)
  });

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof nodeType === 'undefined' || !nodeType) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        nodeType,
        position,
        data: { label: `${nodeType} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance],
  );

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
          onClick={() => props.diagramStateHandlers.clickEvent('Some info from flow component onclick')}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          defaultViewport={defaultViewport}
          connectionLineType={ConnectionLineType.SmoothStep}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          className="flow"
        >
          <MiniMap zoomable pannable nodeClassName={nodeClassName} />
          <Controls />
          <DownloadButton shadowRoot={props.shadowRoot} />
          <Background />
        </ReactFlow>
      </div>
      <Sidebar/>
    </ReactFlowProvider>
    </div>
    
  );
}

export default Flow;
export interface FlowProps {
  shadowRoot,
  height?: number,
  diagramData: any,
  diagramStateHandlers?: {
    clickEvent: (...args) => void;
  }
}