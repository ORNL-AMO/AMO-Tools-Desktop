import { CustomEdgeData, ParentContainerDimensions, ProcessFlowPart } from "../../../../src/process-flow-types/shared-process-flow-types";
import {
    type Node,
    Edge,
} from '@xyflow/react';
import Drawer from '@mui/material/Drawer';
import ManageEdge from "./ManageEdge";
import ManageComponent from "./ManageComponent";
import { selectIsDrawerOpen } from "../Diagram/store";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { toggleDrawer } from "../Diagram/diagramReducer";
import { memo } from "react";

const DataDrawer = (props: DataDrawerProps) => {
    const dispatch = useAppDispatch();
    const isDrawerOpen = useAppSelector(selectIsDrawerOpen);
    const selectedDataId = useAppSelector((state) => state.diagram.selectedDataId);
    const nodes = useAppSelector((state) => state.diagram.nodes) as Node<ProcessFlowPart>[];
    const edges = useAppSelector((state) => state.diagram.edges) as Edge<CustomEdgeData>[];
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
                    width: 475 },
                [`& .MuiPaper-root.MuiPaper-elevation.MuiDrawer-paper`]: {
                    top: props.parentContainer.headerHeight,
                    height: props.parentContainer.height - props.parentContainer.headerHeight - props.parentContainer.footerHeight,
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

export interface DataDrawerProps {
    parentContainer: ParentContainerDimensions;
}

