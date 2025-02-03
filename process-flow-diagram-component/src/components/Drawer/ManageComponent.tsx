import { ProcessFlowPart } from "../../../../src/process-flow-types/shared-process-flow-types";
import { getConnectedEdges, useReactFlow } from '@xyflow/react';
import {
    type Node,
    Edge,
} from '@xyflow/react';
import { Box, Button, Divider, Tab, Tabs, TextField, Typography } from "@mui/material";
import React, { memo, useEffect, useRef, useState } from 'react';
import ComponentDataForm from "../Forms/ComponentDataForm";
import ComponentHandles from "./ComponentHandles";
import CustomizeNode from "./CustomizeNode";
import TabPanel, { TabPanelBox } from "./TabPanel";
import DrawerToggleButton from "./DrawerToggleButton";

const ManageComponent = (props: ManageComponentProps) => {
    const { selectedNode, closeDrawer } = props;
    const { getEdges, setEdges, setNodes } = useReactFlow();

    const allNodeEdges = getConnectedEdges([selectedNode], getEdges());
    const [connectedEdges, setConnectedEdges] = useState<Edge[]>(allNodeEdges);
    const [selectedTab, setSelectedTab] = useState(0);
    const [nodeName, setNodeName] = useState<string>(selectedNode.data.name);
    const debounceRef = useRef<any>(null);

    const updateNodeName = (nodeName: string) => {
        setNodes((nds) =>
            nds.map((n: Node<ProcessFlowPart>) => {
                if (n.data.diagramNodeId === selectedNode.data.diagramNodeId) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            name: nodeName
                        }
                    };
                }
                return n;
            }),
        );
    };

    useEffect(() => {
        debounceRef.current = setTimeout(() => {
            updateNodeName(nodeName);
        }, 150);

        return () => {
            clearTimeout(debounceRef.current);
        };
    }, [nodeName]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    const onDeleteNode = () => {
        setNodes((nodes) => nodes.filter((nd) => nd.id !== selectedNode.id));
        setEdges((edges) => {
            let updatedEdges = edges.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id);
            return updatedEdges;
        });
        closeDrawer();
    };

    return (
        <>
            <Box display="flex" alignItems={'center'} sx={{ margin: '1rem' }}>
                <DrawerToggleButton toggleDrawer={closeDrawer} side={'right'}></DrawerToggleButton>
                <Typography variant="h6" gutterBottom
                    sx={{
                        marginTop: '0',
                        marginBottom: '0',
                        fontSize: '1rem',
                    }}>
                    <TextField
                        label={'Component Name'}
                        id={'component_name'}
                        value={nodeName}
                        type={'text'}
                        size={'small'}
                        onChange={evt => setNodeName(evt.target.value)}
                        sx={{ paddingRight: '1rem', margin: 0, width: '100%' }}
                    />
                </Typography>
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
                        <Tab sx={{ fontSize: '.75rem' }} label="Data" />
                        <Tab sx={{ fontSize: '.75rem' }} label="Customize" />
                    </Tabs>
                </Box>

                <TabPanel value={selectedTab} index={0}>
                    <ComponentDataForm
                        connectedEdges={connectedEdges}
                        selectedNode={selectedNode} />
                </TabPanel>

                <TabPanel value={selectedTab} index={1}>
                    {/* <TabPanelBox> */}
                        <Box sx={{ paddingY: '1rem' }}>
                            <ComponentHandles node={selectedNode}></ComponentHandles>
                            <CustomizeNode node={selectedNode}></CustomizeNode>
                            <Divider />
                        </Box>
                    {/* </TabPanelBox> */}
                </TabPanel>

                <Button sx={{ width: '100%', marginY: 2 }} color="secondary" variant="outlined" onClick={onDeleteNode}>Delete Component</Button>
            </Box>
        </>
    );

};

export default memo(ManageComponent);

export interface ManageComponentProps {
    selectedNode: Node<ProcessFlowPart>,
    closeDrawer: () => void;

}

