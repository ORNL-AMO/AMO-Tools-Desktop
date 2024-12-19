import { CustomEdgeData, ParentContainerDimensions, ProcessFlowPart, UserDiagramOptions } from "../../../../src/process-flow-types/shared-process-flow-types";
import { getConnectedEdges, useReactFlow } from '@xyflow/react';
import {
    type Node,
    Edge,
} from '@xyflow/react';
import { Box, Button, Divider, Tab, Tabs, TextField, Typography } from "@mui/material";
import React, { BaseSyntheticEvent, memo, useEffect, useRef, useState } from 'react';
import TabPanel, { TabPanelBox } from "./TabPanel";
import ComponentDataForm from "./ComponentDataForm";
import ComponentHandles from "./ComponentHandles";
import CustomizeNode from "./CustomizeNode";
import ComponentConnectionsList from "./ComponentConnectionList";
import CustomizeEdge from "./CustomizeEdge";
import Drawer from '@mui/material/Drawer';
import DrawerToggleButton from "./DrawerToggleButton";

const DataDrawer = (props: DataDrawerProps) => {
    const { getNodes, getEdges, setEdges, setNodes } = useReactFlow();

    const selectedNode: Node<ProcessFlowPart> = getNodes().find((node: Node<ProcessFlowPart>) => node.data.diagramNodeId === props.manageDataId) as Node<ProcessFlowPart>;
    const allNodeEdges = getConnectedEdges([selectedNode], getEdges());
    const [connectedEdges, setConnectedEdges] = useState<Edge[]>(allNodeEdges);
    const [drawerNode, setDrawerNode] = useState<Node<ProcessFlowPart>>(selectedNode);

    const [selectedTab, setSelectedTab] = useState(0);
    const [selectedEdge, setSelectedEdge] = useState<Edge<CustomEdgeData>>(connectedEdges[0] as Edge<CustomEdgeData>);
    const [nodeName, setNodeName] = useState<string>(drawerNode.data.name);
    const debounceRef = useRef<any>(null);

    const updateNodeName = (nodeName: string) => {
        setNodes((nds) =>
            nds.map((n: Node<ProcessFlowPart>) => {
                if (n.data.diagramNodeId === drawerNode.data.diagramNodeId) {
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
        setNodes((nodes) => nodes.filter((nd) => nd.id !== drawerNode.id));
        setEdges((edges) => {
            let updatedEdges = edges.filter((edge) => edge.source !== drawerNode.id && edge.target !== drawerNode.id);
            console.log(updatedEdges);
            return updatedEdges;
        });
        props.setIsDataDrawerOpen(false);
    };

    const onDeleteEdge = () => {
        setEdges((edges) => {
            const updatedEdges = edges.filter((edg) => edg.id !== selectedEdge.id);
            const connectedEdges = getConnectedEdges([drawerNode], updatedEdges);
            setConnectedEdges(connectedEdges);
            if (connectedEdges.length > 0 ) {
                setSelectedEdge(connectedEdges[0] as Edge<CustomEdgeData>);
            } else {
                setSelectedTab(1);
            }
            return updatedEdges;
        });
    };

    const toggleDrawerOpen = () => {
        props.setIsDataDrawerOpen(false)
    };

    const handleDrawerClose = (event: any, reason: string) => {
            event = event as BaseSyntheticEvent;
            props.setIsDataDrawerOpen(event.target.value)
    };

    const updateDiagramEdges = (event, edgeId: string) => {
        const updatedEdges = [...getEdges()].map((edge: Edge<CustomEdgeData>) => {
            if (edge.id === edgeId) {
                const flowValue = event.target.value === ""? null : Number(event.target.value)
                edge.data.flowValue = flowValue;
            }
            return edge;
        });
        setEdges(updatedEdges);
        setConnectedEdges(updatedEdges);
    }

    const onTotalFlowValueChange = (event, isSource: boolean) => {
        console.log('==== DataDrawer onTotalFlowValueChange setNodes');
        console.log('onTotalFlowValueChange', event.target.value);
        setNodes((nds) =>
            nds.map((n: Node<ProcessFlowPart>) => {
                if (n.data.diagramNodeId === drawerNode.data.diagramNodeId) {
                    const updatedNode = {
                        ...n,
                        data: {
                            ...n.data,
                            totalSourceFlow: isSource? Number(event.target.value) : n.data.totalSourceFlow,
                            totalDischargeFlow: isSource? n.data.totalDischargeFlow : Number(event.target.value),
                        }
                    };
                    setDrawerNode(updatedNode);
                    return updatedNode;
                }
                return n;
            }),
        );
    }
    const onDistributeFlowEvenly = (totalFlowValue: number, updateIds: string[]) => {
        let dividedTotalFlow = totalFlowValue / updateIds.length; 
        const updatedEdges = [...getEdges()].map((edge: Edge<CustomEdgeData>) => {
            if (updateIds.includes(edge.id)) {
                edge.data.flowValue = dividedTotalFlow;
            }
            return edge;
        });
        setEdges(updatedEdges);
        setConnectedEdges(updatedEdges);
    }
    
    return (
        <Drawer
            disablePortal={true}
            open={props.isDrawerOpen}
            anchor='right'
            keepMounted
            disableEnforceFocus
            onClose={(event, reason) => handleDrawerClose(event, reason)}
            sx={{
                width: 400,
                flexShrink: 0,
                [`& .MuiDrawer-root`]: { 
                    zIndex: 0,
                },
                [`& .MuiBackdrop-root.MuiModal-backdrop`]: { opacity: '0 !important' },
                [`& .MuiDrawer-paper`]: { boxSizing: 'border-box' },
                [`& .MuiPaper-root.MuiPaper-elevation.MuiDrawer-paper`]: { 
                    top: props.parentContainer.headerHeight,
                    height: props.parentContainer.height - props.parentContainer.headerHeight - props.parentContainer.footerHeight,
                    boxShadow: '-5px 0 5px 0 rgba(136, 136, 136, .6)',
                 },
            }}
        >
            <Box display="flex" alignItems={'center'} sx={{ margin: '1rem' }}>
                <DrawerToggleButton toggleDrawer={toggleDrawerOpen} side={'right'}></DrawerToggleButton>
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
                        onFlowDataChange={updateDiagramEdges}
                        onTotalFlowValueChange={onTotalFlowValueChange}
                        onDistributeFlowEvenly={onDistributeFlowEvenly}
                        selectedNode={drawerNode}/>
                </TabPanel>

                <TabPanel value={selectedTab} index={1}>
                    <TabPanelBox>
                        <Box sx={{ paddingY: '1rem' }}>
                            <ComponentHandles node={drawerNode}></ComponentHandles>
                            <CustomizeNode node={drawerNode}></CustomizeNode>
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

export default memo(DataDrawer);

export interface DataDrawerProps {
    isDrawerOpen: boolean;
    manageDataId: string;
    parentContainer: ParentContainerDimensions;
    userDiagramOptions: UserDiagramOptions;
    setIsDataDrawerOpen: (boolean) => void;
    setIsDialogOpen: (boolean) => void;
}

