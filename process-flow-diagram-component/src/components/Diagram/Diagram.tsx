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
  Edge,
  FitViewOptions,
  NodeChange,
  EdgeTypes,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { FlowDiagramData, ParentContainerDimensions, ProcessFlowPart, WaterDiagram, DiagramSettings, NodeCalculatedData, UserDiagramOptions } from '../../../../src/process-flow-types/shared-process-flow-types';
import { formatDataForMEASUR, getDefaultColorPalette, getDefaultSettings, getDefaultUserDiagramOptions, getEdgeTypesFromString, updateStaleNodes } from './FlowUtils';
import { edgeTypes, nodeTypes } from './FlowTypes';
import useDiagramStateDebounce from '../../hooks/useDiagramStateDebounce';
import WarningDialog from './WarningDialog';
import { DefaultEdgeOptions } from 'reactflow';
import { MenuSidebarProps } from '../Drawer/MenuSidebar';
import { SideDrawer } from '../Drawer/SideDrawer';
import DataDrawer from '../Drawer/DataDrawer';
import { useAppDispatch, useAppSelector } from '../../hooks/state';
import { RootState, selectIsDrawerOpen, store } from './store';
import { Provider } from 'react-redux';
import { addNode, connectEdge, edgesChange, nodesChange } from './diagramReducer';


export interface DiagramProps {
  shadowRoot,
  height?: number,
  parentContainer: ParentContainerDimensions,
  processDiagram?: WaterDiagram;
  clickEvent: (...args) => void;
  saveFlowDiagramData: (flowDiagramData: FlowDiagramData) => void;
}

export const RootDiagramContext = createContext(null);

const fitViewOptions: FitViewOptions = {
  padding: 300,
  minZoom: .5
};

const Diagram = (props: DiagramProps) => {
  const dispatch = useAppDispatch()

  // todo START existing state from MEASUR OR DEFAULTS
  let assessmentCreatedNodes: Node[] = [];
  let existingNodes: Node[] = [];
  let existingEdges: Edge[] = [];
  const defaultUserDiagramOptions = props.processDiagram.flowDiagramData.userDiagramOptions ? props.processDiagram.flowDiagramData.userDiagramOptions : getDefaultUserDiagramOptions();
  const defaultSettings = props.processDiagram.flowDiagramData.settings ? props.processDiagram.flowDiagramData.settings : getDefaultSettings();
  const defaultNodeCalculatedData = props.processDiagram.flowDiagramData.calculatedData ? props.processDiagram.flowDiagramData.calculatedData : {};
  const defaultRecentNodeColors = props.processDiagram.flowDiagramData.recentNodeColors.length !== 0 ? props.processDiagram.flowDiagramData.recentNodeColors : getDefaultColorPalette();
  const defaultRecentEdgeColors = props.processDiagram.flowDiagramData.recentEdgeColors.length !== 0 ? props.processDiagram.flowDiagramData.recentEdgeColors : getDefaultColorPalette();
  existingNodes = props.processDiagram.flowDiagramData.nodes.filter((node: Node<ProcessFlowPart>) => {
    if (!node.position) {
      assessmentCreatedNodes.push(node);
    } else {
      return node;
    }
  });
  existingEdges = props.processDiagram.flowDiagramData.edges;
  // todo END existing state from MEASUR OR DEFAULTS

  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [staleNodes, setStaleNodes] = useState<Node[]>(assessmentCreatedNodes);
  const [diagramParentDimensions, setDiagramParentDimensions] = useState(props.parentContainer);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const isDataDrawerOpen: boolean = useAppSelector(selectIsDrawerOpen)
  const nodes: Node[] = useAppSelector((state: RootState) => state.diagram.nodes);
  const edges: Edge[] = useAppSelector((state: RootState) => state.diagram.edges);
  const userDiagramOptions: UserDiagramOptions = useAppSelector((state: RootState) => state.diagram.diagramOptions);
  const settings: DiagramSettings = useAppSelector((state: RootState) => state.diagram.settings);

  const recentNodeColors = useAppSelector((state: RootState) => state.diagram.recentNodeColors);
  const recentEdgeColors = useAppSelector((state: RootState) => state.diagram.recentEdgeColors);
  const calculatedData: Record<string, NodeCalculatedData> = useAppSelector((state: RootState) => state.diagram.calculatedData);

  const animated: boolean = useAppSelector((state: RootState) => state.diagram.diagramOptions.animated);
  const minimapVisible: boolean = useAppSelector((state: RootState) => state.diagram.diagramOptions.minimapVisible);
  const controlsVisible: boolean = useAppSelector((state: RootState) => state.diagram.diagramOptions.controlsVisible);
  const defaultEdgeType: string = useAppSelector((state: RootState) => state.diagram.diagramOptions.edgeType);
  const diagramEdgeTypes: EdgeTypes = useAppSelector((state: RootState) => {
    return getEdgeTypesFromString(state.diagram.diagramOptions.edgeType, edgeTypes);
  });

  const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: animated,
    type: defaultEdgeType,
  };
  const { debouncedNodes, debouncedEdges } = useDiagramStateDebounce(nodes, edges);


  // * on xyFlow instance ready
  useEffect(() => {
    if (reactFlowInstance && props.height) {
      setDiagramParentDimensions(props.parentContainer);
      // * assessment added nodes
      if (staleNodes.length > 0) {
        const updatedNodes = updateStaleNodes(reactFlowInstance, [...staleNodes], props.height);
        setStaleNodes([]);
        console.log('hasStaleNodes updatedNodes', updatedNodes);
        dispatch(nodesChange(updatedNodes as NodeChange[]));
      }
    }
  }, [reactFlowInstance]);


  // todo 6918 - eventually move to side-effect/async middleware of state changes
  useEffect(() => {
    if (staleNodes.length === 0) {
      const updatedDiagramData: FlowDiagramData = {
        nodes: debouncedNodes,
        edges: debouncedEdges,
        settings,
        userDiagramOptions,
        calculatedData,
        recentNodeColors,
        recentEdgeColors,
      };

      formatDataForMEASUR(updatedDiagramData);
      props.saveFlowDiagramData(updatedDiagramData);
    }
  }, [debouncedNodes, debouncedEdges, userDiagramOptions, settings]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const nodeType = event.dataTransfer.getData('application/reactflow');
    if (typeof nodeType === 'undefined' || !nodeType) {
      return;
    }
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    dispatch(addNode({nodeType, position}));
  },[reactFlowInstance]);

  const onConnect: OnConnect = useCallback(
    (connectedParams: Connection | Edge) => {
      dispatch(connectEdge(connectedParams));
    },
    [userDiagramOptions]
  );

  const menuSidebarProps: MenuSidebarProps = {
    diagramParentDimensions: diagramParentDimensions,
    shadowRoot: props.shadowRoot,
    setIsDialogOpen: setIsDialogOpen,
    hasAssessment: props.processDiagram.assessmentId !== undefined
  }

  return (
    props.height &&
      <div className="process-flow-diagram">
        {isDialogOpen &&
          <WarningDialog
            isDialogOpen={isDialogOpen}
            handleDialogCloseCallback={setIsDialogOpen}/>
        }
        <ReactFlowProvider>
          <div className={'flow-wrapper'} style={{ height: props.height }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={(e) => dispatch(nodesChange(e))}
              onEdgesChange={(e) => dispatch(edgesChange(e))}
              onConnect={onConnect}
              // onReconnect={onReconnect}
              onInit={setReactFlowInstance}
              nodeTypes={nodeTypes}
              edgeTypes={diagramEdgeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
              connectionLineType={ConnectionLineType.Bezier}
              onDrop={onDrop}
              // onError={onErrorWithSuppressed}
              // onBeforeDelete={onBeforeDelete}
              onDragOver={onDragOver}
              fitView={true}
              fitViewOptions={fitViewOptions}
              className="flow"
            >
              {minimapVisible &&
                <MiniMap zoomable pannable nodeClassName={(node: Node) => node.type} />
              }
              {controlsVisible &&
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
            parentContainer={props.parentContainer}
            />
          }
        </ReactFlowProvider>
      </div>
  );
}

export default (props: DiagramProps) => (
  <Provider store={store}>
    <Diagram {...props}/>
  </Provider>
);