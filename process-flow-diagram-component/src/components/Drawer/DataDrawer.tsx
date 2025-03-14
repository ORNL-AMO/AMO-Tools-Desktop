import { CustomEdgeData, ParentContainerDimensions, ProcessFlowPart } from "../../../../src/process-flow-types/shared-process-flow-types";
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
import { memo, useEffect, useRef, useState } from "react";
import { styled } from "@mui/material";
import DragHandleIcon from '@mui/icons-material/DragHandle';

const ResizeHandle = styled('div')({
    position: 'absolute',
    left: 0, 
    top: 0,
    width: '12px',
    height: '100%',
    cursor: 'col-resize',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    transition: 'background-color 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
});

const ResizeHandleIcon = styled(DragHandleIcon)(({ theme }) => ({
    transform: 'rotate(90deg)',
    color: '#999',
    fontSize: '24px',
    pointerEvents: 'none',
}));

const MIN_DRAWER_WIDTH = 500;
const MAX_DRAWER_WIDTH = 900;

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
    console.log('selected id, node', selectedDataId, selectedNode)

    const [drawerWidth, setDrawerWidth] = useState<number>(500);
    const isResizing = useRef<boolean>(false);

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        isResizing.current = true;
        event.preventDefault();
    };
    
    const handleMouseMove = (event: MouseEvent) => {
        if (isResizing.current) {
            const newWidth = window.innerWidth - event.clientX;
            setDrawerWidth(Math.min(Math.max(newWidth, MIN_DRAWER_WIDTH), MAX_DRAWER_WIDTH)); 
        }
    };
    
    const handleMouseUp = () => {
        if (isResizing.current) {
            isResizing.current = false;
        }
    };
    
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return (
        <Drawer
            open={isDrawerOpen}
            anchor='right'
            variant="persistent"
            onClose={(event, reason) => handleDrawerClose(event, reason)}
            PaperProps={{
                style: {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    top: diagramParentDimensions.headerHeight,
                    height:
                        diagramParentDimensions.height -
                        diagramParentDimensions.headerHeight -
                        diagramParentDimensions.footerHeight,
                    boxShadow: '-5px 0 5px 0 rgba(136, 136, 136, .6)',
                },
            }}
            sx={{
                flexShrink: 0,
                [`& .MuiDrawer-root`]: { zIndex: 0 },
                [`& .MuiBackdrop-root.MuiModal-backdrop`]: { opacity: '0 !important' },
            }}
        >
            <ResizeHandle onMouseDown={handleMouseDown} >
            <ResizeHandleIcon />
            </ResizeHandle>
            <>
                {selectedNode && <ManageComponent selectedNode={selectedNode} />}
                {selectedEdge && <ManageEdge selectedEdge={selectedEdge} />}
            </>
        </Drawer>
    );

};

export default memo(DataDrawer);

