import { List, TextField, InputAdornment, ListItem, Divider, Button } from "@mui/material";
import { getEdgeSourceAndTarget } from "../Diagram/FlowUtils";
import { Edge, Node } from "@xyflow/react";
import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined';

import React  from "react";
import FlowConnectionText from "../Drawer/FlowConnectionText";
import { CustomEdgeData } from "../../../../src/process-flow-types/shared-process-flow-types";
import SmallTooltip from "../StyledMUI/SmallTooltip";
import { dischargeFlowValueChange, distributeTotalDischargeFlow, totalFlowChange } from "../Diagram/diagramReducer";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import InputField from "../StyledMUI/InputField";
import FlowDisplayUnit from "../Diagram/FlowDisplayUnit";
import { selectNodes, selectNodeTargetEdges, selectTotalDischargeFlow } from "../Diagram/store";

/**
   * Handle Flow states for discharge edges of selected node/component
   * Functionality for SourceFlowForm.tsx vs DischargeFlowForm.tsx is similar, but separated for readability and future flexibility
   */
const DischargeFlowForm = (props: DischargeFlowFormProps) => {
    const dispatch = useAppDispatch();
    const totalDischargeFlow = useAppSelector(selectTotalDischargeFlow);
    const nodes: Node[] = useAppSelector(selectNodes);
    const componentDischargeEdges = useAppSelector(selectNodeTargetEdges);

    const onTotalFlowValueInputChange = (event) => {
        const totalFlow = event.target.value === "" ? null : Number(event.target.value);
        dispatch(totalFlowChange({flowProperty: 'totalDischargeFlow', totalFlow}));
    }

    const onClickDistributeFlowEvenly = (totalFlowValue: number) => {
        dispatch(distributeTotalDischargeFlow(totalFlowValue));
    }

    const onFlowValueInputChange = (event, dischargeEdgeId: string) => {
        const flowValue = event.target.value === "" ? null : Number(event.target.value);
        dispatch(dischargeFlowValueChange({dischargeEdgeId, flowValue}));
    }

    return (
        <>
            <SmallTooltip title="Set flows evenly from total discharge value"
                slotProps={{
                    popper: {
                        disablePortal: true,
                    }
                }}>
                <span>
                    <Button onClick={() => onClickDistributeFlowEvenly(totalDischargeFlow)}
                        disabled={!totalDischargeFlow}
                        variant="outlined"
                        sx={{
                            marginRight: '1rem',
                            padding: '2px 12px',
                            display: 'inline-block',
                            minWidth: 0
                        }}>
                        <CallSplitOutlinedIcon
                            sx={{
                                transform: 'rotate(180deg) scaleX(-1)',

                            }} />
                    </Button>
                </span>
            </SmallTooltip>
            <TextField
                label={'Total Flow'}
                id={'totalDischargeFlow'}
                type={'number'}
                size="small"
                value={totalDischargeFlow ?? ''}
                onChange={(event) => onTotalFlowValueInputChange(event)}
                // color={validation.totalFlowValueDifferent? 'error' : 'primary'}
                // error={validation.totalFlowValueDifferent ? true : false}
                // helperText={validation.totalFlowValueDifferent}
                FormHelperTextProps={{ sx: { whiteSpace: 'normal', maxWidth: 250 } }}
                InputProps={{
                    endAdornment: <InputAdornment position="end">
                        <FlowDisplayUnit />
                    </InputAdornment>,
                }}
            />
            <Divider sx={{ marginY: '1rem', backgroundColor: '#1976d2' }}></Divider>

            <List sx={{ padding: 0 }}>
                {componentDischargeEdges.map((edge: Edge<CustomEdgeData>) => {
                    const { source, target } = getEdgeSourceAndTarget(edge, nodes);
                    let flowValue: number | string = edge.data.flowValue === null ? "" : Number(edge.data.flowValue);

                    return (
                        <ListItem
                            sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '.5rem' }}
                            key={edge.id}
                            disablePadding>
                            <InputField
                                label={<FlowConnectionText source={source} target={target} />}
                                id={edge.id}
                                type={'number'}
                                size="small"
                                value={flowValue}
                                // color={validation.flowValues[edge.id]?.flowValueGreaterThan? 'warning' : 'primary'}
                                // helperText={validation.flowValues[edge.id]?.flowValueGreaterThan}
                                // warning={validation.flowValues[edge.id]?.flowValueGreaterThan? true : false}
                                onChange={(event) => onFlowValueInputChange(event, edge.id)}
                                sx={{ m: 1, width: '100%' }}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end" sx={{ zIndex: 1 }}>
                                        <span style={{ zIndex: 1, background: 'white' }}>
                                            <FlowDisplayUnit />
                                        </span>
                                    </InputAdornment>,
                                }}
                            />
                        </ListItem>
                    )
                })
                }
            </List>
        </>

    );

}

export default DischargeFlowForm;

export interface DischargeFlowFormProps {
    selectedNodeId: string,
}
