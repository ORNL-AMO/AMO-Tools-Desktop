import Drawer from '@mui/material/Drawer';
import { ProcessFlowPart, UserDiagramOptions } from '../../../../src/process-flow-types/shared-process-flow-types';
import { getConnectedEdges, useReactFlow } from '@xyflow/react';
import {
    type Node,
    Edge,
} from '@xyflow/react';
import { Box, Button, Divider, Tab, Tabs, TextField, Typography } from '@mui/material';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import React, { useEffect, useRef, useState } from 'react';
import TabPanel, { TabPanelBox } from './TabPanel';
import CustomizeNode from './CustomizeNode';
import ComponentConnectionsList from './ComponentConnectionList';
import CustomizeEdge from './CustomizeEdge';
import ComponentHandles from './ComponentHandles';
import ComponentDataForm from './ComponentDataForm';
import { CustomEdgeData } from '../Edges/DiagramBaseEdge';

export default function ManageDataContextDrawer(props: ManageDataContextDrawerProps) {
    const { getNodes, getEdges, setEdges, setNodes } = useReactFlow();
    const allNodes: Node[] = getNodes();
    const selectedNode: Node = allNodes.find((node: Node<ProcessFlowPart>) => node.data.diagramNodeId === props.manageDataId);
    const nodeData = selectedNode.data as ProcessFlowPart;
    
    const allEdges: Edge[] = getEdges();
    const allNodeEdges = getConnectedEdges([selectedNode], allEdges);
    const [connectedEdges, setConnectedEdges] = useState<Edge[]>(allNodeEdges);

    const [selectedTab, setSelectedTab] = useState(0);
    const [selectedEdge, setSelectedEdge] = useState<Edge<CustomEdgeData>>(connectedEdges[0] as Edge<CustomEdgeData>);
    const [nodeName, setNodeName] = useState(nodeData.name);
    const debounceRef = useRef<any>(null);

    const updateNodeName = (nodeName: string) => {
        setNodes((nds) =>
            nds.map((n: Node<ProcessFlowPart>) => {
                if (n.data.diagramNodeId === nodeData.diagramNodeId) {
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

    // todo 7001 setup generic debounce input
    useEffect(() => {
        debounceRef.current = setTimeout(() => {
            updateNodeName(nodeName);
        }, 150);

        return () => {
            clearTimeout(debounceRef.current);
        };
    }, [nodeName]);

    const handleSetSelectedEdge = (edge: Edge<CustomEdgeData>) => {
        setSelectedEdge(edge);
        // todo also set edge status as selected
        // setEdges((eds) => {
        //     return eds.map((e: Edge) => {
        //       if (e.id === edge.id) {
        //         console.log('setting edge id select', edge.id)
        //         return {
        //             ...e,
        //             selected: true
        //         }
        //       }
        //       return e;
        //     });
        //   });
    }

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    const onDeleteNode = () => {
        // todo integrate warning
        setNodes((nodes) => nodes.filter((nd) => nd.id !== selectedNode.id));
        setEdges((edges) => {
            let updatedEdges = edges.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id);
            console.log(updatedEdges);
            return updatedEdges;
        });
        props.setIsDataDrawerOpen(false);
    };

    const onDeleteEdge = () => {
        setEdges((edges) => {
            const updatedEdges = edges.filter((edg) => edg.id !== selectedEdge.id);
            const connectedEdges = getConnectedEdges([selectedNode], updatedEdges);
            setConnectedEdges(connectedEdges);
            if (connectedEdges.length > 0 ) {
                setSelectedEdge(connectedEdges[0] as Edge<CustomEdgeData>);
            } else {
                setSelectedTab(1);
            }
            return updatedEdges;
        });
    };

    const toggleDrawer = (newOpen: boolean) => () => {
        props.setIsDataDrawerOpen(newOpen)
    };

    return (
        <Drawer
            disablePortal={true}
            open={props.isDrawerOpen}
            anchor='right'
            onClose={toggleDrawer(false)}
            sx={{
                width: 400,
                flexShrink: 0,
                [`& .MuiDrawer-root`]: { zIndex: 0 },
                [`& .MuiBackdrop-root.MuiModal-backdrop`]: { opacity: '0 !important' },
                [`& .MuiDrawer-paper`]: { width: 400, zIndex: 0, boxSizing: 'border-box' },
                // [`& .MuiPaper-root`]: { top: '75px' },
            }}
        >
            <Box display="flex" alignItems={'center'} sx={{ margin: '1rem' }}>
                <Button onClick={toggleDrawer(false)}
                    sx={{
                        alignSelf: 'flex-start',
                        // width: '25%',
                        transform: 'rotate(-90deg)'
                    }}>
                    <ExpandCircleDownIcon sx={{
                        width: '32px',
                        height: '32px',
                    }} />
                </Button>
                <Typography variant="h6" gutterBottom
                    sx={{
                        marginTop: '0',
                        marginBottom: '0',
                        fontSize: '1rem',
                        // width: '75%'
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
            <Divider />

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
                        <Tab sx={{fontSize: '.75rem'}} label="Data" />
                        <Tab sx={{fontSize: '.75rem'}} label="Component" />
                        <Tab sx={{fontSize: '.75rem'}} label="Connections" disabled={connectedEdges.length === 0} />
                    </Tabs>
                </Box>

                <TabPanel value={selectedTab} index={0}>
                    <ComponentDataForm 
                        connectedEdges={connectedEdges}
                        setConnectedEdges={setConnectedEdges}
                        selectedNode={selectedNode}/>
                </TabPanel>

                <TabPanel value={selectedTab} index={1}>
                    <TabPanelBox>
                        <Box sx={{ paddingY: '1rem' }}>
                            <ComponentHandles node={selectedNode}></ComponentHandles>
                            <CustomizeNode node={selectedNode}></CustomizeNode>
                            <Divider />
                        </Box>
                        <Button sx={{ width: '100%', marginY: 2 }} variant="outlined" onClick={onDeleteNode}>Delete Component</Button>
                    </TabPanelBox>
                </TabPanel>

                <TabPanel value={selectedTab} index={2}>
                    {connectedEdges &&
                    <TabPanelBox>
                        <Box>
                            <ComponentConnectionsList
                                connectedEdges={connectedEdges}
                                setSelectedEdge={handleSetSelectedEdge}
                                selectedEdge={selectedEdge} />
                            <Divider />
                            <CustomizeEdge edge={selectedEdge} userDiagramOptions={props.userDiagramOptions}></CustomizeEdge>
                            <Divider />
                        </Box>
                        <Button sx={{ width: '100%', marginY: 2 }} variant="outlined" onClick={onDeleteEdge}>Delete Selected Connection</Button>
                    </TabPanelBox>
                    }
                </TabPanel>
            </Box>
        </Drawer>
    );

};


export interface ManageDataContextDrawerProps {
    isDrawerOpen: boolean;
    manageDataId: string;
    userDiagramOptions: UserDiagramOptions;
    setIsDataDrawerOpen: (boolean) => void;
    setIsDialogOpen: (boolean) => void;
}

