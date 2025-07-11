import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  EdgeTypes,
  reconnectEdge,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { formatDataForMEASUR, getEdgeTypesFromString, updateAssessmentCreatedNodes } from './FlowUtils';
import { edgeTypes, nodeTypes } from './FlowTypes';
import useDiagramStateDebounce from '../../hooks/useDiagramStateDebounce';
import WarningDialog from './WarningDialog';
import { useAppDispatch, useAppSelector } from '../../hooks/state';
import { AppStore, configureAppStore, RootState, selectEdges, selectNodes } from './store';
import { Provider } from 'react-redux';
import { addNode, addNodes, connectEdge, diagramParentRender, edgesChange, edgesUpdate, keyboardDeleteNode, nodesChange, openDrawerWithSelected } from './diagramReducer';
import ValidationWindow, { ValidationWindowLocation } from './ValidationWindow';
import StaticModal from '../Forms/StaticModal';
import { ParentContainerDimensions, WaterDiagram, FlowDiagramData, ProcessFlowPart, UserDiagramOptions, DiagramSettings, DiagramCalculatedData, NodeErrors, getIsDiagramValid } from 'process-flow-lib';
import MenuSidebar from '../Drawer/MenuSidebar';
import DataSidebar from '../Drawer/DataSidebar';
import SharedDrawer from '../Drawer/SharedDrawer';
import DiagramAlert, { DiagramAlertState } from './DiagramAlert';


export interface DiagramProps {
  shadowRoot,
  height?: number,
  parentContainer: ParentContainerDimensions,
  processDiagram?: WaterDiagram;
  saveFlowDiagramData: (flowDiagramData: FlowDiagramData) => void;
}


const Diagram = (props: DiagramProps) => {
  const dispatch = useAppDispatch();
  const assessmentNodes: Node[] = props.processDiagram.flowDiagramData.nodes.filter((node: Node<ProcessFlowPart>) => {
    if (!node.position && node.data.createdByAssessment) {
      return node;
    }
  })
  const [assessmentCreatedNodes, setAssessmentCreatedNodes] = useState<Node[]>(assessmentNodes);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const isDialogOpen = useAppSelector((state: RootState) => state.diagram.isDialogOpen);
  const edges: Edge[] = useAppSelector(selectEdges);
  const userDiagramOptions: UserDiagramOptions = useAppSelector((state: RootState) => state.diagram.diagramOptions);
  const settings: DiagramSettings = useAppSelector((state: RootState) => state.diagram.settings);
  const recentNodeColors = useAppSelector((state: RootState) => state.diagram.recentNodeColors);
  const recentEdgeColors = useAppSelector((state: RootState) => state.diagram.recentEdgeColors);
  const calculatedData: DiagramCalculatedData = useAppSelector((state: RootState) => state.diagram.calculatedData);
  const animated: boolean = useAppSelector((state: RootState) => state.diagram.diagramOptions.animated);
  const minimapVisible: boolean = useAppSelector((state: RootState) => state.diagram.diagramOptions.minimapVisible);
  const controlsVisible: boolean = useAppSelector((state: RootState) => state.diagram.diagramOptions.controlsVisible);
  const defaultEdgeType: string = useAppSelector((state: RootState) => state.diagram.diagramOptions.edgeType);
  const validationWindowLocation: ValidationWindowLocation = useAppSelector((state) => state.diagram.validationWindowLocation);
  const diagramEdgeTypes: EdgeTypes = useAppSelector((state: RootState) => {
    return getEdgeTypesFromString(state.diagram.diagramOptions.edgeType, edgeTypes);
  });
  // const diagramParentDimensions = useAppSelector((state) => state.diagram.diagramParentDimensions);
  const diagramParentDimensions = props.parentContainer;
  const diagramAlertState: DiagramAlertState = useAppSelector((state) => state.diagram.diagramAlert);



  const nodeErrors: NodeErrors = useAppSelector((state: RootState) => state.diagram.nodeErrors);
  const nodes: Node[] = useAppSelector(selectNodes);
  const { debouncedNodes, debouncedEdges } = useDiagramStateDebounce(nodes, edges);

  // const newNodeErrors = checkDiagramNodeErrors(nodes, edges, calculatedData, settings);
  // const isDiagramValid = getIsDiagramValid(newNodeErrors);
  // console.log('=== newNodeErrors', newNodeErrors);
  const isDiagramValid = useMemo(() => getIsDiagramValid(nodeErrors), [nodeErrors]);
  // console.log('=== isDiagramValid', isDiagramValid);

  // * on xyFlow instance ready
  useEffect(() => {
    if (reactFlowInstance && props.height) {
      const parentState = {
        diagramData: props.processDiagram?.flowDiagramData,
        parentContainer: props.parentContainer,
        assessmentId: props.processDiagram.assessmentId
      }
      dispatch(diagramParentRender(parentState));

      // todo re-testtSbugger;
      if (assessmentCreatedNodes.length > 0) {
        const updatedNodes = updateAssessmentCreatedNodes(reactFlowInstance, [...assessmentCreatedNodes], props.height);
        setAssessmentCreatedNodes([]);
        dispatch(addNodes(updatedNodes));
      }
    }
  }, [reactFlowInstance]);


  // todo 6918 - eventually move to side-effect/async middleware of state changes
  // todo 6918 - move debouncing to middleware?
  useEffect(() => {
    if (assessmentCreatedNodes.length === 0) {
      const updatedDiagramData: FlowDiagramData = {
        name: props.processDiagram.flowDiagramData.name,
        nodes: nodes,
        nodeErrors: nodeErrors,
        edges: debouncedEdges,
        settings,
        userDiagramOptions,
        calculatedData,
        recentNodeColors,
        recentEdgeColors,
      };

      // console.log('=== SAVED FlowDiagramData', JSON.parse(JSON.stringify(updatedDiagramData)));
      formatDataForMEASUR(updatedDiagramData);

      props.saveFlowDiagramData(updatedDiagramData);
      // console.log('=== SAVED FORMATTED FlowDiagramData', updatedDiagramData);
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

    dispatch(addNode({ nodeType, position }));
  }, [reactFlowInstance]);

  const onConnect: OnConnect = useCallback(
    (connectedParams: Connection | Edge) => {
      dispatch(connectEdge(connectedParams));
    },
    [userDiagramOptions]
  );

    const onReconnect = useCallback(
    (oldEdge, newConnection) => {
      let newEdges = reconnectEdge(oldEdge, newConnection, edges);
      dispatch(edgesUpdate(newEdges));
    },
    [edges],
  );


  const onBeforeDelete = useCallback(
    async ({ nodes: nds, edges: eds }: { nodes: Node[]; edges: Edge[] }) => {
      nds.forEach((node: Node<ProcessFlowPart>) => {
        dispatch(keyboardDeleteNode(node))
      });
      return { nodes: nds, edges: eds }
    }, [])

  return (
    props.height &&
    <div className="process-flow-diagram">
      {isDialogOpen &&
        <WarningDialog
          isDialogOpen={isDialogOpen} />
      }

      {!isDiagramValid && validationWindowLocation === 'diagram' &&
        <ValidationWindow nodes={nodes} errors={nodeErrors} openLocation={validationWindowLocation}/>
      }
      {/* // * Only for development result checking */}
      {/* <ResultsPanel></ResultsPanel> */}
      <ReactFlowProvider>
        <div className={'flow-wrapper'} style={{ height: props.height }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            edgesReconnectable={true}
            onNodesChange={(e) => dispatch(nodesChange(e))}
            onEdgesChange={(e) => dispatch(edgesChange(e))}
            onReconnect={onReconnect}
            onConnect={onConnect}
            // onReconnect={onReconnect}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            edgeTypes={diagramEdgeTypes}
            defaultEdgeOptions={{
              animated: animated,
              type: defaultEdgeType,
            }}
            defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
            connectionLineType={ConnectionLineType.Bezier}
            onNodeClick={(_, node) => dispatch(openDrawerWithSelected(node.id))}
            onEdgeClick={(_, edge) => dispatch(openDrawerWithSelected(edge.id))}
            onDrop={onDrop}
            // onError={onErrorWithSuppressed}
            onBeforeDelete={onBeforeDelete}
            onDragOver={onDragOver}
            fitView={true}
            fitViewOptions={{
              padding: 300,
              minZoom: .5
            }}
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

        {diagramParentDimensions.height && (
          <SharedDrawer
            diagramParentDimensions={diagramParentDimensions}
            shadowRootRef={props.shadowRoot}
            anchor={'left'}
          >
              <MenuSidebar shadowRootRef={props.shadowRoot} diagramParentDimensions={diagramParentDimensions}/>
          </SharedDrawer>
        )}

        {diagramParentDimensions.height && (
          <SharedDrawer
            diagramParentDimensions={diagramParentDimensions}
            shadowRootRef={props.shadowRoot}
            anchor={'right'}
          >
            <DataSidebar />
          </SharedDrawer>
        )}

          {diagramAlertState &&
            <DiagramAlert diagramAlertState={diagramAlertState} />
          }
        <StaticModal shadowRootRef={props.shadowRoot} />
      </ReactFlowProvider>
    </div>
  );
}

export default (props: DiagramProps) => {
  // * prevent multiple store instances on parent re-renders. Could also be lifted to AppWebComponent.tsx if needed
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    console.log('=== configureAppStore ===', props.processDiagram);
    storeRef.current = configureAppStore(props.processDiagram);
  }
  // const storeRef = useMemo(() => configureAppStore(), []);

  return (
    <Provider store={storeRef.current}>
      <Diagram {...props} />
    </Provider>
  );
}