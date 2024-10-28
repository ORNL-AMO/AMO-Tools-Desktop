import { useCallback, useEffect, useState } from 'react';
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
  MarkerType,
  EdgeTypes,
} from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';

import Sidebar from '../Sidebar/Sidebar';
import { FlowDiagramData, ProcessFlowPart, UserDiagramOptions, WaterDiagram } from '../../../../src/process-flow-types/shared-process-flow-types';
import { changeExistingEdgesType, getDefaultUserDiagramOptions, getEdgeDefaultOptions, getEdgeTypesFromString, setCustomEdges, setDroppedNode, updateStaleNodes } from './FlowUtils';
import { nodeTypes } from './FlowTypes';
import useDiagramStateDebounce from '../../hooks/useDiagramStateDebounce';
import WarningDialog from './WarningDialog';
import ManageDataContextDrawer from '../Drawer/ManageDataContextDrawer';

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };
const nodeClassName = (node: Node) => node.type;

const Flow = (props: FlowProps) => {
  const [manageDataId, setManageDataId] = useState(undefined);
  const [isDataDrawerOpen, setIsDataDrawerOpen] = useState(false);

  // * nodes with createdByAssessment
  let staleParentNodes = [];
  let existingNodes = [];
  let existingEdges = [];
  
  const defaultUserDiagramOptions = props.processDiagram.flowDiagramData.userDiagramOptions? props.processDiagram.flowDiagramData.userDiagramOptions: getDefaultUserDiagramOptions();
  existingNodes = props.processDiagram.flowDiagramData.nodes.filter((node: Node<ProcessFlowPart> )=> {
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

  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [staleNodes, setStaleNodes] = useState<Node[]>(staleParentNodes);
  const [nodes, setNodes, onNodesChange] = useNodesState(existingNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(existingEdges);
  const [userDiagramOptions, setUserDiagramOptions] = useState<UserDiagramOptions>(defaultUserDiagramOptions);
  const [edgeTypes, setEdgeTypes] = useState<EdgeTypes>(getEdgeTypesFromString(defaultUserDiagramOptions.edgeType, undefined));
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // * on reactFlowInstance initialize with assessment added nodes
    if (reactFlowInstance && props.height && staleNodes.length > 0) {
      let updatedNodes = updateStaleNodes(reactFlowInstance, [...staleNodes], props.height);
      setStaleNodes([]);
      setNodes(nds => nds.concat(updatedNodes));
    }
  }, [reactFlowInstance]);

  const { debouncedNodes, debouncedEdges } = useDiagramStateDebounce(nodes, edges);

  useEffect(() => {
    if (staleNodes.length === 0) {
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
        userDiagramOptions
      });
    }
  }, [debouncedNodes, debouncedEdges, userDiagramOptions]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => setDroppedNode(event, reactFlowInstance, setNodes, setManageDataId, setIsDataDrawerOpen),
    [reactFlowInstance, setManageDataId, setIsDataDrawerOpen],
  );

  const onConnect: OnConnect = useCallback(
    (connectedParams: Connection | Edge) => {
      setCustomEdges(setEdges, connectedParams, userDiagramOptions);
    },
    [userDiagramOptions]
  );

  // const onBeforeDelete: OnBeforeDelete = useCallback(async ({ nodes, edges }) => {
  //   // todo global confirm
  //   return { nodes, edges };
  // }, []);
  
  const handleMinimapVisible = useCallback((isEnabled) => {
    setUserDiagramOptions({
      ...userDiagramOptions,
      minimapVisible: isEnabled
    });
  }, [userDiagramOptions]);

  const handleControlsVisible = useCallback((isEnabled) => {
    setUserDiagramOptions({
      ...userDiagramOptions,
      controlsVisible: isEnabled
    });
  }, [userDiagramOptions]);

  const handleShowMarkerEndArrows = useCallback((showArrows: boolean) => {
    setUserDiagramOptions({
      ...userDiagramOptions,
      directionalArrowsVisible: showArrows
    });
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
  }, [userDiagramOptions]);

  const handleEdgeThicknessChange = useCallback((event: Event, edgeThickness: number) => {
    setUserDiagramOptions({
      ...userDiagramOptions,
      edgeThickness: edgeThickness
    });
    setEdges((eds) => {
      let updatedEdges = eds.map((e: Edge) => {
        let updatedEdge = {
          ...e,
          style: {
            ...e.style,
            strokeWidth: edgeThickness
          }
        }
        return updatedEdge;
      });
      return updatedEdges;
    });
  }, [userDiagramOptions]);

  
  const resetDiagram = useCallback(() => {
    const defaultOptions = getDefaultUserDiagramOptions();
    setNodes(nds => []);
    setEdges(eds => []);
    props.saveFlowDiagramData({
      nodes: [],
      edges: [],
      userDiagramOptions: defaultOptions
    });
    setUserDiagramOptions(defaultOptions);
  }, [setNodes, setEdges]);

  const handleEdgeTypeChange = useCallback((defaultEdgeType: string) => {
    const newEdgeTypes = getEdgeTypesFromString(defaultEdgeType, edgeTypes);
    setUserDiagramOptions({
      ...userDiagramOptions,
      edgeType: defaultEdgeType,
    });
    setEdgeTypes(newEdgeTypes);
    changeExistingEdgesType(setEdges, defaultEdgeType);
  }, [userDiagramOptions, edgeTypes]);

  // * suppress 'It looks like you have created a new nodeTypes or edgeTypes object.
  // * If this wasn't on purpose please define the nodeTypes/edgeTypes outside of the component or memoize them'
  const onErrorWithSuppressed = (msgId, msg) => {
    if (msgId === '002') {
      return;
    }
  
    console.warn(msg);
  }
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
            onError={onErrorWithSuppressed}
            // onBeforeDelete={onBeforeDelete}
            onDragOver={onDragOver}
            fitView
            className="flow"
          >
            {userDiagramOptions.minimapVisible &&
              <MiniMap zoomable pannable nodeClassName={nodeClassName} />
            }
            {userDiagramOptions.controlsVisible &&
              <Controls />
            }
            <Background />
          </ReactFlow>
        </div>
        <Sidebar
            userDiagramOptions={userDiagramOptions}
            userDiagramOptionsHandlers={{
              handleMinimapVisible,
              handleShowMarkerEndArrows,
              handleControlsVisible,
              handleEdgeTypeChange,
              handleEdgeThicknessChange
            }}
            resetDiagramCallback={resetDiagram}
            shadowRoot={props.shadowRoot}
            setIsDialogOpen={setIsDialogOpen}
            hasAssessment={props.processDiagram.assessmentId !== undefined}
          />
      {isDataDrawerOpen &&
        <ManageDataContextDrawer
         isDrawerOpen={isDataDrawerOpen}
         manageDataId={manageDataId}
         userDiagramOptions={userDiagramOptions}
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