import { Box, List, TextField, InputAdornment, ListItem, ListItemButton, ListItemIcon, Divider, styled, Typography } from "@mui/material";
import { CustomEdgeData } from "../Edges/DiagramBaseEdge";
import { getEdgeSourceAndTarget } from "../Flow/FlowUtils";
import { Edge, Node, useReactFlow } from "@xyflow/react";
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';

import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, {
    AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import { useState } from "react";
import FlowConnectionText from "./FlowConnectionText";
import { ProcessFlowPart } from "../../../../src/process-flow-types/shared-process-flow-types";

const Accordion = styled((props: AccordionProps) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
        borderBottom: 0,
    },
    '&::before': {
        display: 'none',
    },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
    <MuiAccordionSummary
        expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.75rem' }} />}
        {...props}
    />
))(({ theme }) => ({
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
    },
    background: '#ececec',
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(1),
        flexDirection: 'column'
    },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

const ComponentFlowsForm = (props: ComponentFlowsFormProps) => {
    const { getNodes } = useReactFlow();
    const allNodes: Node[] = getNodes();
    const [sourcesExpanded, setSourcesExpanded] = useState<boolean>(true);
    const [dischargeExpanded, setDischargeExpanded] = useState<boolean>(true);

    const handleAccordianChange = (newExpanded: boolean, setExpanded: (newExpanded: boolean) => void) => {
        setExpanded(newExpanded);
    };

    const handleFlowChange = (event, updateId: string) => {
        const updatedEdges = props.connectedEdges.map((edge: Edge<CustomEdgeData>) => {
            if (edge.id === updateId) {
                edge.data.flowPercent = Number(event.target.value);
            }
            return edge;
        });
        props.setConnectedEdges(updatedEdges);
    };

    const getConnectionListItem = (edge: Edge, source: ProcessFlowPart, target: ProcessFlowPart) => {
        const flowValue = edge.data.flowPercent;
        const flowId: string = edge.id;
            return (
                <ListItem
                    sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
                    key={flowId}
                    disablePadding>
                    <TextField
                        label={<FlowConnectionText source={source} target={target} />}
                        id={flowId}
                        type={'number'}
                        value={flowValue}
                        onChange={(event) => handleFlowChange(event, edge.id)}
                        sx={{ m: 1, width: '100%' }}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">Mgal</InputAdornment>,
                        }}
                    />
                </ListItem>
            );
    }

    let dischargeEdges = [];
    const sourceEdges: JSX.Element[] = props.connectedEdges.map((edge: Edge<CustomEdgeData>) => {
        const { source, target } = getEdgeSourceAndTarget(edge, allNodes);
        if (props.selectedNode.id === target.diagramNodeId) {
            return getConnectionListItem(edge, source, target);
        } else if (props.selectedNode.id === source.diagramNodeId) {
            dischargeEdges.push(getConnectionListItem(edge, source, target));
        }
    });
    const sourceEdgeItems = sourceEdges.filter(edge => edge !== undefined);

    return (<Box sx={{ paddingY: '.25rem', width: '100%' }} role="presentation" >
        <Box sx={{ marginTop: 1 }}>
        {sourceEdgeItems.length > 0 &&
            <Accordion expanded={sourcesExpanded} onChange={(event, newExpanded) => handleAccordianChange(newExpanded, setSourcesExpanded)}>
                <AccordionSummary>
                    Source
                </AccordionSummary>
                <AccordionDetails>
                    <List sx={{ padding: 0 }}>
                        {sourceEdgeItems}
                    </List>
                </AccordionDetails>
            </Accordion>
        }

        {dischargeEdges.length > 0 &&
            <Accordion expanded={dischargeExpanded}
            onChange={(event, newExpanded) => handleAccordianChange(newExpanded, setDischargeExpanded)}
            slotProps={{
                transition: { unmountOnExit: true }
            }}>
                <AccordionSummary>
                    Discharge
                </AccordionSummary>
                <AccordionDetails>
                    <List sx={{ padding: 0 }}>
                        {dischargeEdges}
                    </List>
                </AccordionDetails>
            </Accordion>
        }
        </Box>
        <Divider />
    </Box>);
}

export default ComponentFlowsForm;

export interface ComponentFlowsFormProps {
    connectedEdges: Edge[];
    setConnectedEdges: (edges: Edge[]) => void;
    selectedNode: Node;
}



