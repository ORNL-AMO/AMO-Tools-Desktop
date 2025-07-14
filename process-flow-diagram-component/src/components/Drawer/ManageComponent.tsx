import { getConnectedEdges } from '@xyflow/react';
import React, { memo, useEffect, useRef, useState } from 'react';
import {
    type Node,
    Edge,
} from '@xyflow/react';
import { Box, Button, Divider, Tab, Tabs, TextField, Typography } from "@mui/material";
import ComponentDataForm from "../Forms/ComponentDataForm";
import ComponentHandles from "./ComponentHandles";
import CustomizeNode from "./CustomizeNode";
import TabPanel from "./TabPanel";
import DrawerToggleButton from "./DrawerToggleButton";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { deleteNode, setNodeName } from "../Diagram/diagramReducer";
import InSystemTreatmentForm from "../Forms/InSystemTreatmentForm";
import { ProcessFlowPart } from 'process-flow-lib';

const ManageComponent = (props: ManageComponentProps) => {
    const dispatch = useAppDispatch();
    const { selectedNode } = props;
    const isWaterUsingSystem = props.selectedNode.type === 'waterUsingSystem';
    // todo 7593 move tabs to redux and control on selectedId change
    const validTabs = isWaterUsingSystem ? [0, 1, 2] : [0, 1];
    const [selectedTab, setSelectedTab] = useState(0);
    const [name, setName] = useState<string>(selectedNode.data.name);
    const debounceRef = useRef(null);
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    useEffect(() => {
        setName(selectedNode.data.name);
        if (!validTabs.includes(selectedTab)) {
            setSelectedTab(0);
        }
    }, [selectedNode]);

    useEffect(() => {
        debounceRef.current = setTimeout(() => {
            updateNodeName(name);
        }, 150);

        return () => {
            clearTimeout(debounceRef.current);
        };
    }, [name]);

    const updateNodeName = (name: string) => {
        dispatch(setNodeName(name));
    };

    return (
        <>
            <Box display="flex" alignItems={'center'} sx={{ margin: '1rem' }}>
                <TextField
                    label={'Component Name'}
                    id={'component_name'}
                    value={name}
                    type={'text'}
                    size={'small'}
                    onChange={evt => setName(evt.target.value)}
                    sx={{ paddingRight: '1rem', margin: 0, width: '100%' }}
                />
            </Box>

            {validTabs.includes(selectedTab) &&

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
                            <Tab sx={{ fontSize: '.75rem' }} label="Flows" />
                            {isWaterUsingSystem &&
                                <Tab sx={{ fontSize: '.75rem' }} label="Treatment" />
                            }
                            <Tab sx={{ fontSize: '.75rem' }} label="Manage" />
                        </Tabs>
                    </Box>

                    <TabPanel value={selectedTab} index={0}>
                        <ComponentDataForm
                            selectedNode={selectedNode} />
                    </TabPanel>

                    {isWaterUsingSystem &&
                        <TabPanel value={selectedTab} index={1}>
                            <Box sx={{ paddingY: '1rem' }}>
                                <InSystemTreatmentForm selectedNode={selectedNode}></InSystemTreatmentForm>
                            </Box>
                        </TabPanel>
                    }

                    <TabPanel value={selectedTab} index={isWaterUsingSystem ? 2 : 1}>
                        <Box sx={{ paddingY: '1rem' }}>
                            <ComponentHandles node={selectedNode}></ComponentHandles>
                            <CustomizeNode node={selectedNode}></CustomizeNode>
                            <Button sx={{ width: '100%', marginY: 2 }} color="error" variant="outlined" onClick={() => dispatch(deleteNode())}>Delete Component</Button>
                        </Box>
                    </TabPanel>

                </Box>
            }

        </>
    );

};

export default memo(ManageComponent);

export interface ManageComponentProps {
    selectedNode: Node<ProcessFlowPart>,

}

