import { getConnectedEdges } from '@xyflow/react';
import React, { memo, useEffect, useState } from 'react';
import {
    type Node,
} from '@xyflow/react';
import { Box, Button, Tab, Tabs } from "@mui/material";
import ComponentDataForm from "../Forms/ComponentDataForm";
import ComponentHandles from "./ComponentHandles";
import CustomizeNode from "./CustomizeNode";
import TabPanel from "./TabPanel";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { deleteNode } from "../Diagram/diagramReducer";
import InSystemTreatmentForm from "../Forms/InSystemTreatmentForm";
import { ProcessFlowPart } from 'process-flow-lib';
import ComponentNameHeader from './ComponentNameHeader';


const ManageComponent = (props: ManageComponentProps) => {
    const dispatch = useAppDispatch();
    const { selectedNode } = props;
    const componentTabs = useAppSelector(state => state.diagram.manageDataTabs);
    const isWaterUsingSystem = props.selectedNode.type === 'waterUsingSystem';
    const isIntakeOrDischarge = props.selectedNode.type === 'waterIntake' || props.selectedNode.type === 'waterDischarge';

    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    const validSelectedTab = componentTabs.map((tab, index) => index).includes(selectedTab)

    useEffect(() => {
        if (!validSelectedTab) {
            setSelectedTab(0);
        }
    }, [selectedNode]);


    return (
        <>
            <ComponentNameHeader selectedNode={selectedNode} />
            {validSelectedTab &&
                <>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
                        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="diagram context tabs" sx={{ width: '100%', px: 1 }}>
                            {componentTabs.map((tab, index) => (
                                <Tab key={index + tab.label} sx={{ fontSize: '.75rem' }} label={tab.label} />
                            ))}
                        </Tabs>
                    </Box>

                    <TabPanel value={selectedTab} index={0}>
                        <Box>
                            <ComponentDataForm
                                selectedNode={selectedNode} />
                        </Box>
                    </TabPanel>

                    {isWaterUsingSystem &&
                        <TabPanel value={selectedTab} index={1}>
                            <InSystemTreatmentForm selectedNode={selectedNode}></InSystemTreatmentForm>
                        </TabPanel>
                    }

                    <TabPanel value={selectedTab} index={isWaterUsingSystem ? 2 : 1}>
                        <Box>
                            {!isIntakeOrDischarge &&
                                <ComponentHandles node={selectedNode}></ComponentHandles>
                            }
                            <CustomizeNode node={selectedNode}></CustomizeNode>
                            <Button sx={{ width: '100%', marginY: 2 }} color="error" variant="outlined" onClick={() => dispatch(deleteNode())}>Delete Component</Button>
                        </Box>
                    </TabPanel>

                </>
            }
        </>
    );

};

export default memo(ManageComponent);

export interface ManageComponentProps {
    selectedNode: Node<ProcessFlowPart>,

}

