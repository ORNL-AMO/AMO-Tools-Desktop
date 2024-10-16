import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Connection,
  ConnectionLineType,
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
  OnConnect,
  type Node,
  useNodesState,
  useEdgesState,
  Edge,
  OnBeforeDelete,
  MarkerType,
  OnDelete,
} from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';

import Sidebar from '../Sidebar/Sidebar';
import { FlowDiagramData, ProcessFlowPart, WaterDiagram } from '../../../../src/process-flow-types/shared-process-flow-types';
import { changeExistingEdgesType, getEdgeDefaultOptions, setCustomEdges, setDroppedNode, updateStaleNodes } from './FlowUtils';
import { edgeTypes, nodeTypes } from './FlowTypes';
import useDiagramStateDebounce from '../../hooks/useDiagramStateDebounce';
import WarningDialog from './WarningDialog';
import ManageDataContextDrawer from '../Drawer/ManageDataContextDrawer';

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };
const nodeClassName = (node: Node) => node.type;

const Flow = (props: FlowProps) => {
  const [manageDataId, setManageDataId] = useState(undefined);
  const [isDataDrawerOpen, setIsDataDrawerOpen] = useState(false);

  let staleParentNodes = [];
  let existingNodes = [];
  let existingEdges = [];
  
  if (props.processDiagram) {
    existingNodes = props.processDiagram.flowDiagramData.nodes.map((node: Node<ProcessFlowPart> )=> {
      if (node.data.processComponentType !== 'splitter-node') {
        node.data.setManageDataId = setManageDataId;
        node.data.openEditData = setIsDataDrawerOpen;
      }
      if (!node.position) {
        staleParentNodes.push(node);
      } else {
        return node;
      }
    });

    
    existingEdges = props.processDiagram.flowDiagramData.edges;
    console.log('existingNodes', existingNodes);
    console.log('existingEdges', existingEdges);
  }

  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [staleNodes, setStaleNodes] = useState<Node[]>(staleParentNodes);
  const [nodes, setNodes, onNodesChange] = useNodesState(existingNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(existingEdges);
  const [minimapVisible, setMinimapVisible] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [directionalArrowsVisible, setDirectionalArrowsVisible] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // * on reactFlowInstance initialize with assessment added nodes
    if (reactFlowInstance && props.height && staleNodes) {
      let updatedNodes = updateStaleNodes(reactFlowInstance, [...staleNodes], props.height);
      setStaleNodes(undefined);
      setNodes(nds => nds.concat(updatedNodes));
    }
  }, [reactFlowInstance]);

  const { debouncedNodes, debouncedEdges } = useDiagramStateDebounce(nodes, edges);
  // todo test could use useUserEventDebounce if copied/splices/map?

  useEffect(() => {
    if (!staleNodes) {
      const dbSafeNodes = debouncedNodes.map((node: Node<ProcessFlowPart>) => {
        // * IMPORTANT - removes handler functions before db save
        return {
          ...node,
          data: {
            ...node.data,
            setManageDataId: undefined,
            openEditData: undefined,
          }
        }
      });

      props.saveFlowDiagramData({
        nodes: dbSafeNodes,
        edges: debouncedEdges,
      });
    }
  }, [debouncedNodes, debouncedEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => setDroppedNode(event, reactFlowInstance, setNodes, setManageDataId, setIsDataDrawerOpen),
    [reactFlowInstance, setManageDataId, setIsDataDrawerOpen],
  );

  const onConnect: OnConnect = useCallback(
    (connectedParams: Connection | Edge) => {
      setCustomEdges(setEdges, connectedParams);
    },
    []
  );

  // const onBeforeDelete: OnBeforeDelete = useCallback(async ({ nodes, edges }) => {
  //   // todo global confirm
  //   return { nodes, edges };
  // }, []);
  
  const updateMinimap = useCallback((enabled) => {
    setMinimapVisible(enabled);
  }, []);

  const updateControls = useCallback((enabled) => {
    setControlsVisible(enabled);
  }, []);

  const handleShowMarkerEndArrows = useCallback((showArrows: boolean) => {
    setDirectionalArrowsVisible(showArrows);
    setEdges((eds) => {
      let updatedEdges = eds.map((e: Edge) => {
        let updatedEdge = {
          ...e,
          markerEnd: showArrows? { 
            type: MarkerType.ArrowClosed,
            width: 25,
            height: 25
          } : ''
        }
        return updatedEdge;
      });
      return updatedEdges;
    });
  }, []);

  
  const resetDiagram = useCallback(() => {
    setNodes(nds => []);
    setEdges(eds => []);
    props.saveFlowDiagramData({
      nodes: [],
      edges: [],
    });
  }, [setNodes, setEdges]);

  const updateEdgeType = useCallback((edgeType) => {
    changeExistingEdgesType(setEdges, edgeType);
  }, []);


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
        <div className={'flow-wrapper'} style={{ height: props.height }}>
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
            // onBeforeDelete={onBeforeDelete}
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
            handleShowMarkerEndArrows={handleShowMarkerEndArrows}
            directionalArrowsVisible={directionalArrowsVisible}
            controlsVisible={controlsVisible}
            controlsVisibleCallback={updateControls}
            resetDiagramCallback={resetDiagram}
            edgeTypeChangeCallback={updateEdgeType}
            shadowRoot={props.shadowRoot}
            setIsDialogOpen={setIsDialogOpen}
            hasAssessment={props.processDiagram.assessmentId !== undefined}
          />
      {isDataDrawerOpen &&
        <ManageDataContextDrawer
         isDrawerOpen={isDataDrawerOpen}
         manageDataId={manageDataId}
         setIsDataDrawerOpen={setIsDataDrawerOpen}
         setIsDialogOpen={setIsDialogOpen}
         />
      }
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