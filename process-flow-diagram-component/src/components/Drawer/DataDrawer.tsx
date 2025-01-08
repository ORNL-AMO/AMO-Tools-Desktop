import { CustomEdgeData, ParentContainerDimensions, ProcessFlowPart, UserDiagramOptions } from "../../../../src/process-flow-types/shared-process-flow-types";
import { useReactFlow } from '@xyflow/react';
import {
    type Node,
    Edge,
} from '@xyflow/react';
import React, { BaseSyntheticEvent, memo } from 'react';
import Drawer from '@mui/material/Drawer';
import ManageEdgeData from "./ManageEdgeData";
import ManageNodeData from "./ManageNodeData";

const DataDrawer = (props: DataDrawerProps) => {
    const { getNodes, getEdges } = useReactFlow();

    const selectedNode: Node<ProcessFlowPart> = getNodes().find((node: Node<ProcessFlowPart>) => node.data.diagramNodeId === props.manageDataId) as Node<ProcessFlowPart>;
    const selectedEdge: Edge<CustomEdgeData> = getEdges().find((edge: Edge<CustomEdgeData>) => edge.id === props.manageDataId) as Edge<CustomEdgeData>;

    const closeDrawer = () => {
        props.setIsDataDrawerOpen(false)
    };

    const handleDrawerClose = (event: any, reason: string) => {
        event = event as BaseSyntheticEvent;
        props.setIsDataDrawerOpen(event.target.value)
    };

    return (
        <Drawer
            disablePortal={true}
            open={props.isDrawerOpen}
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
                    width: 450 },
                [`& .MuiPaper-root.MuiPaper-elevation.MuiDrawer-paper`]: {
                    top: props.parentContainer.headerHeight,
                    height: props.parentContainer.height - props.parentContainer.headerHeight - props.parentContainer.footerHeight,
                    boxShadow: '-5px 0 5px 0 rgba(136, 136, 136, .6)',
                },
            }}
        >
            <>
                {selectedNode &&
                    <ManageNodeData
                        selectedNode={selectedNode}
                        closeDrawer={closeDrawer}
                    ></ManageNodeData>
                }
                {selectedEdge &&
                    <ManageEdgeData
                        selectedEdge={selectedEdge}
                        userDiagramOptions={props.userDiagramOptions}
                        closeDrawer={closeDrawer}
                    ></ManageEdgeData>
                }
            </>
        </Drawer>
    );

};

export default memo(DataDrawer);

export interface DataDrawerProps {
    isDrawerOpen: boolean;
    manageDataId: string;
    parentContainer: ParentContainerDimensions;
    userDiagramOptions: UserDiagramOptions;
    setIsDataDrawerOpen: (boolean) => void;
    setIsDialogOpen: (boolean) => void;
}

