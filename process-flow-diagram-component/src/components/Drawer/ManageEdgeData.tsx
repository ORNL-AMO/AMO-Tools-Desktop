import { CustomEdgeData, ProcessFlowPart, UserDiagramOptions } from "../../../../src/process-flow-types/shared-process-flow-types";
import { useReactFlow } from '@xyflow/react';
import {
    type Node,
    Edge,
} from '@xyflow/react';
import { Box, Button, Tab, Tabs } from "@mui/material";
import React, { memo, useState } from 'react';
import TabPanel, { TabPanelBox } from "../Drawer/TabPanel";
import CustomizeEdge from "../Drawer/CustomizeEdge";
import DrawerToggleButton from "../Drawer/DrawerToggleButton";
import FlowConnectionText from "../Drawer/FlowConnectionText";

const ManageEdgeData = (props: ManageEdgeDataProps) => {
    const { setEdges, getNodes } = useReactFlow();
    const {selectedEdge, userDiagramOptions, closeDrawer} = props;
    const [selectedTab, setSelectedTab] = useState(0);  

    const nodes: Node<ProcessFlowPart>[] = [...getNodes()] as Node<ProcessFlowPart>[];
    const source: Node<ProcessFlowPart> = nodes.find(node => node.id == props.selectedEdge.source);
    const target: Node<ProcessFlowPart> = nodes.find(node => node.id == props.selectedEdge.target);
    
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    const onDeleteEdge = () => {
        setEdges((edges) => edges.filter((edg) => edg.id !== selectedEdge.id));
        closeDrawer();
    };

    return (
        <>
            <Box display="flex" alignItems={'center'} sx={{ margin: '1rem' }}>
                <DrawerToggleButton toggleDrawer={closeDrawer} side={'right'}></DrawerToggleButton>
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
                            <CustomizeEdge edge={selectedEdge} userDiagramOptions={userDiagramOptions}></CustomizeEdge>
                        </Box>
                    </TabPanelBox>
                    <TabPanelBox>
                        <Button sx={{ width: '100%', marginY: 2 }} variant="outlined" color="secondary" onClick={onDeleteEdge}>Delete Selected Connection</Button>
                    </TabPanelBox>
                </TabPanel>
            </Box>
            </>
    );


};

export default memo(ManageEdgeData);

export interface ManageEdgeDataProps {
    selectedEdge: Edge<CustomEdgeData>,
    userDiagramOptions: UserDiagramOptions;
    closeDrawer: () => void;
}
