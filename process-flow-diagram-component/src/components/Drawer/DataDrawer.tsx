import {
    type Node,
    Edge,
} from '@xyflow/react';
import Drawer from '@mui/material/Drawer';
import ManageEdge from "./ManageEdge";
import ManageComponent from "./ManageComponent";
import { selectEdges, selectIsDrawerOpen, selectNodes } from "../Diagram/store";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { toggleDrawer } from "../Diagram/diagramReducer";
import { memo } from "react";
import { CustomEdgeData, ParentContainerDimensions, ProcessFlowPart } from 'process-flow-lib';

const DataDrawer = () => {
    const dispatch = useAppDispatch();
    const diagramParentDimensions: ParentContainerDimensions = useAppSelector((state) => state.diagram.diagramParentDimensions);
    
    const isDrawerOpen = useAppSelector(selectIsDrawerOpen);
    const selectedDataId = useAppSelector((state) => state.diagram.selectedDataId);
    const nodes = useAppSelector(selectNodes);
    const edges = useAppSelector(selectEdges);
    const selectedNode: Node<ProcessFlowPart> = nodes.find((node: Node<ProcessFlowPart>) => node.data.diagramNodeId === selectedDataId) as Node<ProcessFlowPart>;
    const selectedEdge: Edge<CustomEdgeData> = edges.find((edge: Edge<CustomEdgeData>) => edge.id === selectedDataId) as Edge<CustomEdgeData>;

    const handleDrawerClose = (event: any, reason: string) => {
        dispatch(toggleDrawer());
    };

    return (
        <Drawer
            disablePortal={true}
            open={isDrawerOpen}
            anchor='right'
            keepMounted
            disableEnforceFocus
            onClose={(event, reason) => handleDrawerClose(event, reason)}
            sx={{
                flexShrink: 0,
                [`& .MuiDrawer-root`]: {
                    zIndex: 0,
                },
                [`& .MuiBackdrop-root.MuiModal-backdrop`]: { 
                    opacity: '0 !important' },
                [`& .MuiDrawer-paper`]: { 
                    boxSizing: 'border-box', 
                    width: 500 },
                [`& .MuiPaper-root.MuiPaper-elevation.MuiDrawer-paper`]: {
                    top: diagramParentDimensions.headerHeight,
                    height: diagramParentDimensions.height - diagramParentDimensions.headerHeight - diagramParentDimensions.footerHeight,
                    boxShadow: '-5px 0 5px 0 rgba(136, 136, 136, .6)',
                },
            }}
        >
            <>
                {selectedNode &&
                    <ManageComponent
                        selectedNode={selectedNode}
                    ></ManageComponent>
                }
                {selectedEdge &&
                    <ManageEdge
                        selectedEdge={selectedEdge}
                    ></ManageEdge>
                }
            </>
        </Drawer>
    );

};

export default memo(DataDrawer);

