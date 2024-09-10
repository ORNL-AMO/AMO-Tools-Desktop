import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Connection,
  ConnectionLineType,
  MiniMap,
  Controls,
  Background,
  Position,
  ReactFlowProvider,
  NodeTypes,
  DefaultEdgeOptions,
  OnConnect,
  applyEdgeChanges,
  type Node,
  useNodesState,
  useEdgesState,
  Edge,
} from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';

import Sidebar from '../Sidebar/Sidebar';
import { FlowDiagramData, ProcessFlowPart, WaterDiagram } from '../../../../src/process-flow-types/shared-process-flow-types';
import { changeExistingEdgesType, getEdgeDefaultOptions, setCustomEdges, setDroppedNode, updateStaleNodes } from './FlowUtils';
import { edgeTypes, nodeTypes } from './FlowTypes';
import useDiagramStateDebounce from '../../hooks/useSaveDebounce';
import { NodeContextMenu, NodeContextMenuProps } from '../ContextMenu/NodeContextMenu';
import WarningDialog from '../Sidebar/WarningDialog';

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };
const nodeClassName = (node: Node) => node.type;

const Flow = (props: FlowProps) => {
  let staleParentNodes = [];
  let existingNodes = [];
  let existingEdges = [];
  if (props.processDiagram) {
    staleParentNodes = props.processDiagram.flowDiagramData.nodes.filter(node => !node.position);
    existingNodes = props.processDiagram.flowDiagramData.nodes.filter(node => node.position);
    existingEdges = props.processDiagram.flowDiagramData.edges;
  }

  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [staleNodes, setStaleNodes] = useState<Node[]>(staleParentNodes);
  const [nodes, setNodes, onNodesChange] = useNodesState(existingNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(existingEdges);
  const [minimapVisible, setMinimapVisible] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [diagramEdgeType, setDiagramEdgeType] = useState('default');
  const [selectedSidebarTab, setSelectedSidebarTab] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [menu, setMenu] = useState(null);
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
    (connectedParams: Connection | Edge) => {
      setCustomEdges(setEdges, connectedParams);
    },
    [setEdges]
  );

  const updateMinimap = useCallback((enabled) => {
    setMinimapVisible(enabled);
  }, []);

  const updateControls = useCallback((enabled) => {
    setControlsVisible(enabled);
  }, []);

  
  const resetDiagram = useCallback(() => {
    setNodes(nds => []);
    setEdges(eds => []);
    props.saveFlowDiagramData({
      nodes: [],
      edges: [],
    });
  }, []);

  const updateEdgeType = useCallback((edgeType) => {
    setDiagramEdgeType(edgeType);
    changeExistingEdgesType(setEdges, edgeType);
  }, []);

  const onNodeContextMenu = useCallback(
    (event, node: Node) => {
      event.preventDefault();
      
      // * Calculate position of the context menu. We want to make sure it
      // * doesn't get positioned off-screen.
      const pane = ref.current.getBoundingClientRect();

      // * MEASUR CONTAINER element
      // todo get element size from shadow dom
      const parentContainerHeaderOffset = 70;
      const sidebarOffset = 400;

      let insideTopBounds = event.clientY < pane.height - 200;
      let insideLeftBounds = event.clientX < pane.width - 200;
      let insideRightBounds = event.clientX >= pane.width - 200;
      let insideBottomBounds = event.clientY >= pane.height - 200;
      const top =  insideTopBounds && event.clientY - parentContainerHeaderOffset
      const left = insideLeftBounds && event.clientX - sidebarOffset
      const right = insideRightBounds && pane.width - event.clientX + sidebarOffset
      const bottom = insideBottomBounds && pane.height - event.clientY + parentContainerHeaderOffset

      // todo needs v12 redo type
      const processflowPartData = node.data as ProcessFlowPart;
      const menuConfig: NodeContextMenuProps = {
        id: node.id,
        processFlowPartData: processflowPartData,
        top: top,
        left: left,
        right: right,
        bottom: bottom
      }
      setMenu(menuConfig);
    },
    [setMenu],
  );

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  return (
    props.height &&
    <div className="process-flow-diagram">
      {isDialogOpen &&
          <WarningDialog 
          isDialogOpen={isDialogOpen} 
          handleDialogCloseCallback={setIsDialogOpen}
          handleResetDiagramCallback={resetDiagram}/>
        }

      <ReactFlowProvider>
        <div className={'flow-wrapper'} style={{ height: props.height }}
            >
          <ReactFlow
            nodes={nodes}
            onNodesChange={onNodesChange}
            edges={edges}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={getEdgeDefaultOptions()}
            defaultViewport={defaultViewport}
            connectionLineType={ConnectionLineType.Bezier}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onPaneClick={onPaneClick}
            onNodeContextMenu={onNodeContextMenu}
            fitView
            className="flow"
            ref={ref}
          >
            {minimapVisible &&
              <MiniMap zoomable pannable nodeClassName={nodeClassName} />
            }
            {controlsVisible &&
              <Controls />
            }
            <Background />
            {menu && <NodeContextMenu onClick={onPaneClick} {...menu} />}
          </ReactFlow>
        </div>
        <Sidebar
          edges={edges}
          minimapVisibleCallback={updateMinimap}
          controlsVisible={controlsVisible}
          controlsVisibleCallback={updateControls}
          resetDiagramCallback={resetDiagram}
          edgeTypeChangeCallback={updateEdgeType}
          selectedTab={selectedSidebarTab}
          setSelectedTab={setSelectedSidebarTab}
          shadowRoot={props.shadowRoot}
          setIsDialogOpen={setIsDialogOpen}
          hasAssessment={props.processDiagram.assessmentId !== undefined}
        />
      </ReactFlowProvider>
    </div>
  );
}

export default Flow;
export interface FlowProps {
  shadowRoot,
  height?: number,
  processDiagram?: WaterDiagram;
  clickEvent: (...args) => void;
  saveFlowDiagramData: (flowDiagramData: FlowDiagramData) => void;
}