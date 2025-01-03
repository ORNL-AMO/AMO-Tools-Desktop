import { createContext, useCallback, useEffect, useState } from 'react';
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
  FitViewOptions,
  reconnectEdge,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { NodeCalculatedData, FlowDiagramData, ParentContainerDimensions, ProcessFlowPart, UserDiagramOptions, WaterDiagram } from '../../../../src/process-flow-types/shared-process-flow-types';
import { changeExistingEdgesType, getDefaultUserDiagramOptions, getEdgeTypesFromString, setCustomEdgeDefaults, setCustomEdges, setDroppedNode, updateStaleNodes } from './FlowUtils';
import { nodeTypes } from './FlowTypes';
import useDiagramStateDebounce from '../../hooks/useDiagramStateDebounce';
import WarningDialog from './WarningDialog';
import { DefaultEdgeOptions } from 'reactflow';
import { MenuSidebarProps } from '../Drawer/MenuSidebar';
import { SideDrawer } from '../Drawer/SideDrawer';
import DataDrawer from '../Drawer/DataDrawer';

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };
const nodeClassName = (node: Node) => node.type;


export const FlowContext = createContext(null);
const Flow = (props: FlowProps) => {
  const [manageDataId, setManageDataId] = useState(undefined);
  const [isDataDrawerOpen, setIsDataDrawerOpen] = useState(false);

  // * staleNodes == nodes with createdByAssessment: true
  let staleParentNodes = [];
  let existingNodes = [];
  let existingEdges = [];
  const defaultUserDiagramOptions = props.processDiagram.flowDiagramData.userDiagramOptions ? props.processDiagram.flowDiagramData.userDiagramOptions : getDefaultUserDiagramOptions();
  const defaultNodeCalculatedData = props.processDiagram.flowDiagramData.nodeCalculatedDataMap ? props.processDiagram.flowDiagramData.nodeCalculatedDataMap : {};
  existingNodes = props.processDiagram.flowDiagramData.nodes.filter((node: Node<ProcessFlowPart>) => {
    if (node.data.processComponentType !== 'summing-node') {
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
  const [nodeCalculatedDataMap, setNodeCalculatedData] = useState<Record<string, NodeCalculatedData>>(defaultNodeCalculatedData);
  const [edgeTypes, setEdgeTypes] = useState<EdgeTypes>(getEdgeTypesFromString(defaultUserDiagramOptions.edgeType, undefined));
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // * on reactFlowInstance initialize with assessment added nodes
    if (reactFlowInstance && props.height && staleNodes.length > 0) {
      const updatedNodes = updateStaleNodes(reactFlowInstance, [...staleNodes], props.height);
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
        userDiagramOptions,
        nodeCalculatedDataMap
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

  const onReconnect = useCallback(
    (oldEdge, newConnection) => {

      setEdges((edges) => reconnectEdge(oldEdge, newConnection, edges))
    },
    [setEdges],
  );
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

  const handleEdgeOptionsChange = useCallback((options: DefaultEdgeOptions) => {
    setUserDiagramOptions({
      ...userDiagramOptions,
      edgeOptions: {
        ...options
      }
    });

    setEdges((eds) => {
      let updatedEdges = eds.map((e: Edge) => {
        return {
          ...e,
          animated: options.animated
        }
      });
      return updatedEdges;
    });
  }, [userDiagramOptions]);

  const handleShowFlowValues = useCallback((isEnabled) => {
    setUserDiagramOptions({
      ...userDiagramOptions,
      showFlowValues: isEnabled
    });

    setEdges((eds) => {
      let updatedEdges = eds.map((e: Edge) => {
        return {
          ...e
        }
      });
      return updatedEdges;
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
          markerEnd: showArrows ? {
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


  const handleFlowLabelSizeChange = useCallback((event: Event, flowLabelSize: number) => {
    setUserDiagramOptions({
      ...userDiagramOptions,
      flowLabelSize: flowLabelSize
    });
    setEdges((eds) => eds);
  }, [userDiagramOptions]);


  const resetDiagram = useCallback(() => {
    const defaultOptions = getDefaultUserDiagramOptions();
    setNodes(nds => []);
    setEdges(eds => []);
    props.saveFlowDiagramData({
      nodes: [],
      edges: [],
      userDiagramOptions: defaultOptions,
      nodeCalculatedDataMap: {}
    });
    setUserDiagramOptions(defaultOptions);
    setNodeCalculatedData({});
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

  // todo revisit memoized edgeTypes
  // * suppress warning --> 'It looks like you have created a new nodeTypes or edgeTypes object.
  // * If this wasn't on purpose please define the nodeTypes/edgeTypes outside of the component or memoize them'
  const onErrorWithSuppressed = (msgId, msg) => {
    if (msgId === '002') {
      return;
    }
    console.warn(msg);
  }

  const fitViewOptions: FitViewOptions = {
    // padding: 10
  };

  const menuSidebarProps: MenuSidebarProps = {
    userDiagramOptions: userDiagramOptions,
    userDiagramOptionsHandlers: {
      handleMinimapVisible,
      handleShowFlowValues,
      handleShowMarkerEndArrows,
      handleControlsVisible,
      handleEdgeTypeChange,
      handleEdgeThicknessChange,
      handleEdgeOptionsChange,
      handleFlowLabelSizeChange
    },
    resetDiagramCallback: resetDiagram,
    shadowRoot: props.shadowRoot,
    setIsDialogOpen: setIsDialogOpen,
    hasAssessment: props.processDiagram.assessmentId !== undefined
  }

  return (
    props.height &&
    <FlowContext.Provider value={{ userDiagramOptions, nodeCalculatedDataMap, setNodeCalculatedData }}>
      <div className="process-flow-diagram">
        {isDialogOpen &&
          <WarningDialog
            isDialogOpen={isDialogOpen}
            handleDialogCloseCallback={setIsDialogOpen}
            handleResetDiagramCallback={resetDiagram} />
        }

        <ReactFlowProvider>
          <div className={'flow-wrapper'} style={{ height: props.height }}>
            <ReactFlow
              nodes={nodes}
              onNodesChange={onNodesChange}
              edges={edges}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onReconnect={onReconnect}
              onInit={setReactFlowInstance}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={userDiagramOptions.edgeOptions}
              defaultViewport={defaultViewport}
              connectionLineType={ConnectionLineType.Bezier}
              onDrop={onDrop}
              onError={onErrorWithSuppressed}
              // onBeforeDelete={onBeforeDelete}
              onDragOver={onDragOver}
              fitView={true}
              fitViewOptions={fitViewOptions}
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

          <SideDrawer
            anchor={'left'}
            menuSidebarProps={menuSidebarProps}
            isOpen={props.processDiagram.assessmentId === undefined}
            parentContainer={props.parentContainer}
          ></SideDrawer>
          
          {isDataDrawerOpen &&
            <DataDrawer
            isDrawerOpen={isDataDrawerOpen}
            manageDataId={manageDataId}
            userDiagramOptions={userDiagramOptions}
            setIsDataDrawerOpen={setIsDataDrawerOpen}
            parentContainer={props.parentContainer}
            setIsDialogOpen={setIsDialogOpen}
            />
          }
        </ReactFlowProvider>
      </div>
    </FlowContext.Provider>
  );
}

export default Flow;
export interface FlowProps {
  shadowRoot,
  height?: number,
  parentContainer: ParentContainerDimensions,
  processDiagram?: WaterDiagram;
  clickEvent: (...args) => void;
  saveFlowDiagramData: (flowDiagramData: FlowDiagramData) => void;
}

export interface FlowContext {
  userDiagramOptions: UserDiagramOptions,
  nodeCalculatedDataMap: Record<string, NodeCalculatedData>,
  setNodeCalculatedData: (nodeCalculatedDataMap: Record<string, NodeCalculatedData>) => void
}

export interface UserDiagramOptionsHandlers {
  handleMinimapVisible: (enabled: boolean) => void;
  handleShowMarkerEndArrows: (enabled: boolean) => void;
  handleControlsVisible: (enabled: boolean) => void;
  handleShowFlowValues: (enabled: boolean) => void;
  handleEdgeTypeChange: (edgeTypeOption: string) => void;
  handleEdgeOptionsChange: (edgeOptions: any) => void;
  handleEdgeThicknessChange: (event: Event, edgeThickness: number) => void;
  handleFlowLabelSizeChange: (event: Event, flowLabelSize: number) => void;
}