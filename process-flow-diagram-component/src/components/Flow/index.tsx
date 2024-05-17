import { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './CustomNode';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Node 1' },
    position: { x: 250, y: 5 },
  },
  {
    id: '2',
    data: { label: 'Node 2' },
    position: { x: 100, y: 100 },
  },
  {
    id: '3',
    data: { label: 'Node 3' },
    position: { x: 400, y: 100 },
  },
  {
    id: '4',
    data: { label: 'Node 4' },
    position: { x: 400, y: 200 },
    type: 'custom',
    // className: styles.customNode,
    className: 'customNode',
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
];

const nodeTypes = {
  custom: CustomNode,
};

const defaultEdgeOptions = {
  animated: true,
  type: 'smoothstep',
};

const Flow = (props: FlowProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const ref = useRef(null)
  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  useEffect(() => {
      console.log('Flow init', props)
  });

  return (
    // * only render after anguler view init and parent height defined
    props.height && 
    <div className={'flow'} style={{height: props.height}}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        ref={ref}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onClick={() => props.diagramStateHandlers.clickEvent('Some info from flow component onclick')}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      />
    </div>
  );
}

export default Flow;
export interface FlowProps {
  height?: number,
  diagramData?: any,
  diagramStateHandlers?: {
    clickEvent: (...args) => void;
  }
}