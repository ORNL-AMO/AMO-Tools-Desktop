import { ChangeEvent, createContext, useCallback, useEffect, useState } from 'react';
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

import { NodeCalculatedData, FlowDiagramData, ParentContainerDimensions, ProcessFlowPart, UserDiagramOptions, WaterDiagram, CustomEdgeData, DiagramSettings, convertFlowDiagramData } from '../../../../src/process-flow-types/shared-process-flow-types';
import { changeExistingEdgesType, getDefaultColorPalette, getDefaultSettings, getDefaultUserDiagramOptions, getEdgeTypesFromString, setCustomEdges, setDroppedNode, updateStaleNodes } from './FlowUtils';
import { nodeTypes } from './FlowTypes';
import useDiagramStateDebounce from '../../hooks/useDiagramStateDebounce';
import WarningDialog from './WarningDialog';
import { DefaultEdgeOptions } from 'reactflow';
import { MenuSidebarProps } from '../Drawer/MenuSidebar';
import { SideDrawer } from '../Drawer/SideDrawer';
import DataDrawer from '../Drawer/DataDrawer';
// import { getInitialDiagramValidation, isDiagramValid } from '../../validation/Validation';


export interface DiagramProps {
  shadowRoot,
  height?: number,
  parentContainer: ParentContainerDimensions,
  processDiagram?: WaterDiagram;
  clickEvent: (...args) => void;
  saveFlowDiagramData: (flowDiagramData: FlowDiagramData) => void;
}


export const RootDiagramContext = createContext(null);
const Diagram = (props: DiagramProps) => {
  const [manageDataId, setManageDataId] = useState(undefined);
  const [isDataDrawerOpen, setIsDataDrawerOpen] = useState(false);

  // * staleNodes == nodes with createdByAssessment: true
  let staleParentNodes: Node[] = [];
  let existingNodes: Node[] = [];
  let existingEdges: Edge[] = [];
  const defaultUserDiagramOptions = props.processDiagram.flowDiagramData.userDiagramOptions ? props.processDiagram.flowDiagramData.userDiagramOptions : getDefaultUserDiagramOptions();
  const defaultSettings = props.processDiagram.flowDiagramData.settings ? props.processDiagram.flowDiagramData.settings : getDefaultSettings();
  const defaultNodeCalculatedData = props.processDiagram.flowDiagramData.nodeCalculatedDataMap ? props.processDiagram.flowDiagramData.nodeCalculatedDataMap : {};
  const defaultRecentNodeColors = props.processDiagram.flowDiagramData.recentNodeColors.length !== 0 ? props.processDiagram.flowDiagramData.recentNodeColors : getDefaultColorPalette();
  const defaultRecentEdgeColors = props.processDiagram.flowDiagramData.recentEdgeColors.length !== 0 ? props.processDiagram.flowDiagramData.recentEdgeColors : getDefaultColorPalette();
  existingNodes = props.processDiagram.flowDiagramData.nodes.filter((node: Node<ProcessFlowPart>) => {
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
  const [recentNodeColors, setRecentNodeColors] = useState(defaultRecentNodeColors);
  const [recentEdgeColors, setRecentEdgeColors] = useState(defaultRecentEdgeColors);
  const [diagramParentDimensions, setDiagramParentDimensions] = useState(props.parentContainer);
  const [settings, setSettings] = useState<DiagramSettings>(defaultSettings);
  const [userDiagramOptions, setUserDiagramOptions] = useState<UserDiagramOptions>(defaultUserDiagramOptions);
  // const [diagramValidation, setDiagramValidation] = useState<DiagramValidation>();
  const [nodeCalculatedDataMap, setNodeCalculatedData] = useState<Record<string, NodeCalculatedData>>(defaultNodeCalculatedData);
  const [edgeTypes, setEdgeTypes] = useState<EdgeTypes>(getEdgeTypesFromString(defaultUserDiagramOptions.edgeType, undefined));
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // * on reactFlowInstance initialize with 
    if (reactFlowInstance && props.height) {
      setDiagramParentDimensions(props.parentContainer);
      // const initialDiagramValidation = getInitialDiagramValidation(props.processDiagram.flowDiagramData, edges);
      // setDiagramValidation(initialDiagramValidation);
      // * assessment added nodes
      if (staleNodes.length > 0) {
        const updatedNodes = updateStaleNodes(reactFlowInstance, [...staleNodes], props.height);
        setStaleNodes([]);
        setNodes(nds => nds.concat(updatedNodes));
      }
    }
  }, [reactFlowInstance]);

  const { debouncedNodes, debouncedEdges } = useDiagramStateDebounce(nodes, edges);

  useEffect(() => {
    if (staleNodes.length === 0) {
      props.saveFlowDiagramData({
        nodes: debouncedNodes,
        edges: debouncedEdges,
        settings,
        userDiagramOptions,
        nodeCalculatedDataMap,
        recentNodeColors,
        recentEdgeColors,
      });
    }
  }, [debouncedNodes, debouncedEdges, userDiagramOptions, settings]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => setDroppedNode(event, reactFlowInstance, setNodes),
    [reactFlowInstance],
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

  const handleFlowDecimalPrecisionChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({
      ...settings,
      flowDecimalPrecision: Number(event.target.value)
    });
    // todo also set nodes?
    setEdges((eds) => eds);
  }, [settings]);

  const handleUnitsOfMeasureChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const convertedDiagramData = {
      nodes: [...nodes],
      edges: [...edges],
      nodeCalculatedDataMap: {...nodeCalculatedDataMap}
    }
    convertFlowDiagramData(convertedDiagramData, event.target.value);
    setSettings({
      ...settings,
      unitsOfMeasure: event.target.value
    });
    setNodes(nds => convertedDiagramData.nodes);
    setEdges(eds => convertedDiagramData.edges);
    setNodeCalculatedData(calculateData => convertedDiagramData.nodeCalculatedDataMap);
  }, [settings]);


  const resetDiagram = useCallback(() => {
    const defaultOptions = getDefaultUserDiagramOptions();
    setNodes(nds => []);
    setEdges(eds => []);
    props.saveFlowDiagramData({
      nodes: [],
      edges: [],
      settings: settings,
      userDiagramOptions: defaultOptions,
      nodeCalculatedDataMap: {},
      recentEdgeColors,
      recentNodeColors
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
    padding: 300,
    minZoom: .5
  };

  const menuSidebarProps: MenuSidebarProps = {
    userDiagramOptions: userDiagramOptions,
    diagramParentDimensions: diagramParentDimensions,
    settings: settings,
    userDiagramOptionsHandlers: {
      handleMinimapVisible,
      handleShowFlowValues,
      handleShowMarkerEndArrows,
      handleControlsVisible,
      handleEdgeTypeChange,
      handleEdgeThicknessChange,
      handleEdgeOptionsChange,
      handleFlowLabelSizeChange,
      handleFlowDecimalPrecisionChange,
      handleUnitsOfMeasureChange
    },
    resetDiagramCallback: resetDiagram,
    shadowRoot: props.shadowRoot,
    setIsDialogOpen: setIsDialogOpen,
    hasAssessment: props.processDiagram.assessmentId !== undefined
  }

  return (
    props.height &&
    <RootDiagramContext.Provider value={{ 
      userDiagramOptions, 
      settings,
      nodeCalculatedDataMap, 
      setNodeCalculatedData,
      recentNodeColors,
      recentEdgeColors,
      setRecentNodeColors,
      setRecentEdgeColors,
      setManageDataId,
      setIsDataDrawerOpen,
      // diagramValidation,
      // setDiagramValidation
      }}>
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
              defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
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
                <MiniMap zoomable pannable nodeClassName={(node: Node) => node.type} />
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
    </RootDiagramContext.Provider>
  );
}

export default Diagram;