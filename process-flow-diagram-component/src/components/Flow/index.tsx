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
import { FlowDiagramData, getNewNode, getNewProcessComponent } from '../../../../src/process-flow-types/shared-process-flow-types';
import useDiagramStateDebounce from '../../hooks/useSaveDebounce';
import { nodeTypes } from './process-flow-types-and-constants';
import { getRandomCoordinates } from './process-flow-utils';

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
  type: 'smoothstep',
};

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };
const nodeClassName = (node: Node) => node.type;

const Flow = (props: FlowProps) => {

  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  let parentAddedNodes = undefined;
  let existingNodes = [];
  let existingEdges = [];

  if (props.flowDiagramData) {
    let newParentNodes = props.flowDiagramData.nodes.filter(node => !node.position);
    parentAddedNodes = newParentNodes.length > 0 ? newParentNodes : undefined;
    existingNodes = props.flowDiagramData.nodes.filter(node => node.position);
    existingEdges = props.flowDiagramData.edges;
  }

  if (parentAddedNodes) {
    // todo you have unplaced nodes from the assessment
  }

  const [parentNodes, setParentNodes] = useState<Node[]>(parentAddedNodes);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>(existingNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>(existingEdges);
  const [minimapVisible, setMinimapVisible] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const ref = useRef(null);
  const onConnect: OnConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  useEffect(() => {
    console.log('First render flow nodes', nodes);
    console.log('First render flow edges', edges);
  }, []);

  const setFallbackPosition = (positionLessNodes: Array<Node>, clientHeight: number) => {
    positionLessNodes = positionLessNodes.map(node => {
      if (!node.position) {
        // mimick random drop point
        const screenPoint = getRandomCoordinates(clientHeight, undefined);
        const position = reactFlowInstance.screenToFlowPosition({
          x: screenPoint.x,
          y: screenPoint.y,
        });
        node.position = position;
        // todo assign class highlighting new node
      }
      return node;
    });
    return positionLessNodes;
  }

  useEffect(() => {
    if (reactFlowInstance && props.height && parentNodes) {
      console.log('*** SetFallbackPosition', parentNodes)
      let updatedNodes = setFallbackPosition([...parentNodes], props.height);
      console.log('updatedNodes', updatedNodes);
      // props.saveFlowDiagramData({
      //   nodes: nodes,
      //   edges: edges,
      // });
      setParentNodes(undefined);
      setNodes(nds => nds.concat(updatedNodes));
    }
  }, [reactFlowInstance]);

  const { debouncedNodes, debouncedEdges } = useDiagramStateDebounce(nodes, edges);

  useEffect(() => {
    if (!parentNodes) {
      console.log('***Save Diagram', nodes)
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
      // todo useCallback hooks??
      const newProcessComponent = getNewProcessComponent(nodeType);
      const newNode = getNewNode(type, newProcessComponent, position);

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