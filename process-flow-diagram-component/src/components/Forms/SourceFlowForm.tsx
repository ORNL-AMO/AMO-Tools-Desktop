import React from "react";
import { List, TextField, InputAdornment, ListItem, Divider, Button } from "@mui/material";
import { getEdgeSourceAndTarget } from "../Diagram/FlowUtils";
import { Edge, Node } from "@xyflow/react";
import CallSplitOutlinedIcon from '@mui/icons-material/CallSplitOutlined';
import FlowConnectionText from "../Drawer/FlowConnectionText";
import { CustomEdgeData } from "../../../../src/process-flow-types/shared-process-flow-types";
import InputField from "../StyledMUI/InputField";
import SmallTooltip from "../StyledMUI/SmallTooltip";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { distributeTotalSourceFlow, sourceFlowValueChange, totalFlowChange } from "../Diagram/diagramReducer";
import FlowDisplayUnit from "../Diagram/FlowDisplayUnit";
import { selectNodes, selectNodeSourceEdges, selectTotalSourceFlow } from "../Diagram/store";


/**
   * Handle Flow states for source edges of selected node/component
   * Functionality for SourceFlowForm.tsx vs DischargeFlowForm.tsx is similar, but separated for readability and future flexibility
   */
const SourceFlowForm = () => {
    const dispatch = useAppDispatch();
    const totalSourceFlow = useAppSelector(selectTotalSourceFlow);
    const nodes: Node[] = useAppSelector(selectNodes);
    const componentSourceEdges = useAppSelector(selectNodeSourceEdges);

    const onTotalFlowValueInputChange = (event) => {
        const totalFlow = event.target.value === "" ? null : Number(event.target.value);
        dispatch(totalFlowChange({flowProperty: 'totalSourceFlow', totalFlow}));
    }

    const onClickDistributeFlowEvenly = (totalFlowValue: number) => {
        dispatch(distributeTotalSourceFlow(totalFlowValue));
    }

    const onFlowValueInputChange = (event, sourceEdgeId: string) => {
        const flowValue = event.target.value === "" ? null : Number(event.target.value);
        dispatch(sourceFlowValueChange({sourceEdgeId, flowValue}));
    }
    return (
        <>
            <SmallTooltip title="Set flows evenly from total source value"
                slotProps={{
                    popper: {
                        disablePortal: true,
                    }
                }}>
                <span>
                    <Button onClick={() => onClickDistributeFlowEvenly(totalSourceFlow)}
                        disabled={!totalSourceFlow}
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
                id={'totalSourceFlow'}
                type={'number'}
                size="small"
                value={totalSourceFlow ?? ''}
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
                {componentSourceEdges.map((edge: Edge<CustomEdgeData>) => {
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

export default SourceFlowForm;

export interface SourceFlowFormProps {}


