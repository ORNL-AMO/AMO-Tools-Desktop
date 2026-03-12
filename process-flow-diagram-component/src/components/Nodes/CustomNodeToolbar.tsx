import { CSSProperties } from "react";
import EditIcon from '@mui/icons-material/Edit';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { Button, ButtonGroup, useTheme } from "@mui/material";
import { useAppSelector } from "../../hooks/state";
import { ProcessFlowPart, getSystemEstimatedUnknownLosses, WaterUsingSystem } from 'process-flow-lib';
import { selectTotalSourceFlow, selectNodeErrors, selectTotalDischargeFlow } from '../Diagram/store';
import { getNodeHasErrorLevel } from 'process-flow-lib/water/logic/validation';

const CustomNodeToolbar = ({ onEdit, nodeData, selected }: NodeToolbarProps) => {
    const NODE_UPPER_CORNER_LOCATION = `translate(0%, 0%) translate(166px, -45px)`;
    // const componentTypeColor = useAppSelector(selectedDataColor);
    const theme = useTheme();
    const customStyle: CSSProperties = {
        position: 'absolute',
        transform: NODE_UPPER_CORNER_LOCATION,
        pointerEvents: 'all',
    }

    const backgroundColor = theme.palette.background.paper;
// TODO: Investigate selector call, as using memoized version: useAppSelector(state => selectTotalSourceFlow) 
// errors - Uncaught TypeError: Cannot read properties of undefined (reading 'data') at getNodeTotalFlow (FlowUtils.ts:248:21) at store.ts:144:41
    const totalSourceFlow = useAppSelector(state => selectTotalSourceFlow(state, nodeData.diagramNodeId));
    const nodeError = useAppSelector(state => selectNodeErrors(state)[nodeData.diagramNodeId]);
    const totalDischargeFlow = useAppSelector(state => selectTotalDischargeFlow(state, nodeData.diagramNodeId));

    let totalUnknownLoss = getSystemEstimatedUnknownLosses(nodeData as WaterUsingSystem, totalSourceFlow, totalDischargeFlow);

    const isWaterSystemComponentType = [
        'water-using-system',
        'water-treatment',
        'waste-water-treatment'
    ].includes(nodeData.processComponentType);

    const showWarningAlert = isWaterSystemComponentType && totalUnknownLoss > 0;
    return (
        <div
            className="nodrag nopan custom-node-toolbar"
            style={customStyle}
        >
            <div style={{
                display: 'flex',
                borderRadius: '4px',
            }} >
                <ButtonGroup variant="contained" aria-label="Node tool button group"
                    sx={{ fontSize: '10px', backgroundColor: backgroundColor, border: selected ? '1px solid black' : 'none'}}>
                    <Button
                        className="edit-btn"
                        sx={{
                            padding: '.25rem .5rem',
                            color: theme.palette.primary.main,
                            backgroundColor: backgroundColor,
                        }}
                        onClick={onEdit}
                    >
                        <EditIcon />
                    </Button>
                    {(showWarningAlert || getNodeHasErrorLevel(nodeError)) && (
                        <Button
                            className="error-warning-btn"
                            sx={{
                                padding: '.25rem .5rem',
                                minWidth: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                                backgroundColor: backgroundColor,
                            }}
                        >
                            {showWarningAlert && !getNodeHasErrorLevel(nodeError) && (
                                <WarningIcon color="warning" sx={{ fontSize: 24, mr: getNodeHasErrorLevel(nodeError) ? 1 : 0 }} />
                            )}
                            {getNodeHasErrorLevel(nodeError) && (
                                <ErrorIcon color="error" sx={{ fontSize: 24 }} />
                            )}
                        </Button>
                    )}
                </ButtonGroup>
            </div>
        </div>
    );
}

export default CustomNodeToolbar;

export interface NodeToolbarProps {
    onEdit: () => void;
    selected?: boolean;
    nodeData: ProcessFlowPart;
}