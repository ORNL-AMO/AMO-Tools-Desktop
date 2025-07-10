import {
    type Node,
    Edge,
} from '@xyflow/react';
import { Box, Button, Tab, Tabs } from "@mui/material";
import React, { memo, useState } from 'react';
import TabPanel, { TabPanelBox } from "./TabPanel";
import CustomizeEdge from "./CustomizeEdge";
import DrawerToggleButton from "./DrawerToggleButton";
import FlowConnectionText from "./FlowConnectionText";
import { deleteEdge } from "../Diagram/diagramReducer";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { CustomEdgeData, ProcessFlowPart } from 'process-flow-lib';

const ManageEdge = (props: ManageEdgeProps) => {
    const dispatch = useAppDispatch();
    const {selectedEdge} = props;
    const [selectedTab, setSelectedTab] = useState(0);  

    const nodes: Node<ProcessFlowPart>[] = useAppSelector((state) => state.diagram.nodes) as Node<ProcessFlowPart>[];
    const source: Node<ProcessFlowPart> = nodes.find(node => node.id == props.selectedEdge.source);
    const target: Node<ProcessFlowPart> = nodes.find(node => node.id == props.selectedEdge.target);
    
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    return (
        <>
            <Box display="flex" alignItems={'center'} sx={{ margin: '1rem' }}>
                <FlowConnectionText source={source.data} 
                    target={target.data} 
                    style={{
                        padding: '0.5rem 0.5rem',
                        fontSize: '16px'}} 
                        />
            </Box>

            <Box sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingX: '1rem'
            }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
                    <Tabs value={selectedTab} onChange={handleTabChange} aria-label="diagram context tabs">
                        <Tab sx={{fontSize: '.75rem'}} label="Customize" />
                    </Tabs>
                </Box>

                <TabPanel value={selectedTab} index={0}>
                    <TabPanelBox>
                        <Box>
                            <CustomizeEdge edge={selectedEdge}></CustomizeEdge>
                        </Box>
                    </TabPanelBox>
                    <TabPanelBox>
                        <Button sx={{ width: '100%', marginY: 2 }} variant="outlined" color="error" onClick={() => dispatch(deleteEdge(selectedEdge.id))}>Delete Selected Connection</Button>
                    </TabPanelBox>
                </TabPanel>
            </Box>
            </>
    );


};

export default memo(ManageEdge);

export interface ManageEdgeProps {
    selectedEdge: Edge<CustomEdgeData>,
}
