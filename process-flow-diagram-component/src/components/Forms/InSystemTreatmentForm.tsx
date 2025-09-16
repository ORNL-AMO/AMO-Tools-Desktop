import { memo, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector, } from "../../hooks/state";
import { Box, IconButton, TextField, Button, Divider, InputAdornment } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { nodeDataPropertyChange } from "../Diagram/diagramReducer";
import SelectTreatmentType from "./SelectTreatmentType";
import {
    type Node,
  } from '@xyflow/react';
import { WaterTreatment, ProcessFlowPart, getNewWaterTreatmentComponent, inSystemTreatmentTypeOptions } from "process-flow-lib";
import InputField from "../StyledMUI/InputField";

const InSystemTreatmentForm = (props: InSystemTreatmentFormProps) => {
    const dispatch = useAppDispatch();
    const settings = useAppSelector((state) => state.diagram.settings);
    const [treatments, setTreatments] = useState<Array<WaterTreatment>>(props.selectedNode.data.inSystemTreatment || []);
    const treatmentTypeOptions = inSystemTreatmentTypeOptions;

    useEffect(() => {
        dispatch(nodeDataPropertyChange({ optionsProp: 'inSystemTreatment', updatedValue: treatments }));
    }, [treatments]);

    const addTreatment = () => {
        const newTreatment = getNewWaterTreatmentComponent(true);
        const updatedTreatments = [...treatments, newTreatment];
        setTreatments(updatedTreatments);
    };

    const handleTreatmentNameChange = (id: string, value: string) => {
        const updatedTreatments = treatments.map((treatment: WaterTreatment) => 
            treatment.diagramNodeId === id ? { 
                ...treatment, 
                name: value 
            } : treatment
        );
        setTreatments(updatedTreatments);
    };

    
    const handleTreatmentTypeChange = (id: string, value: string) => {
        const updatedTreatments = treatments.map((treatment: WaterTreatment) => 
            treatment.diagramNodeId === id ? { 
                ...treatment, 
                treatmentType: Number(value)
            } : treatment
        );
        setTreatments(updatedTreatments);
    };

    const handleTreatmentCostChange = (id: string, value) => {
        const updatedTreatments = treatments.map((treatment: WaterTreatment) => 
            treatment.diagramNodeId === id ? { 
                ...treatment, 
                cost: value === "" ? null : Number(value)
            } : treatment
        );
        setTreatments(updatedTreatments);
    };

    const removeTreatment = (id: string) => {
        const updatedTreatments = treatments.filter((treatment: WaterTreatment) => treatment.diagramNodeId !== id);
        setTreatments(updatedTreatments);

    };

    return (<Box sx={{ width: '100%' }} role="presentation" >
        <Button sx={{ width: '100%', marginBottom: '.5rem'}} variant="contained" color="primary" onClick={addTreatment}>Add Treatment</Button>
        <Divider />
        {treatments.map((treatment: WaterTreatment) => (
            <Box key={`${treatment.diagramNodeId}-box`}>
            <Box display="flex" flexDirection={'column'} alignItems="center" gap={1} marginY={'1rem'}>
                <Box display="flex" alignItems="center" gap={1} marginY={'.5rem'}>
                <TextField
                    label="Treatment Name"
                    value={treatment.name}
                    onChange={(event) => handleTreatmentNameChange(treatment.diagramNodeId, event.target.value)}
                    size="small"
                    />
                <SelectTreatmentType 
                    style={{ width: '50%' }}
                    treatmentType={treatment.treatmentType}
                    treatmentOptions={treatmentTypeOptions}
                    handleTreatmentTypeChange={(event) => handleTreatmentTypeChange(treatment.diagramNodeId, event.target.value)}
                    ></SelectTreatmentType>
                <IconButton onClick={() => removeTreatment(treatment.diagramNodeId)} size="small" color="error">
                    <DeleteIcon />
                </IconButton>
                </Box>
                <InputField
                    label={'Cost'}
                    id={`${treatment.diagramNodeId}-cost`}
                    name={`cost`}
                    type={'number'}
                    size="small"
                    value={treatment.cost?? ''}
                    onChange={(event) => handleTreatmentCostChange(treatment.diagramNodeId, event.target.value)}
                    sx={{ m: '1 0', width: '100%' }}
                    InputProps={{
                        endAdornment:
                        <InputAdornment position="end" sx={{ zIndex: 1 }}>
                                {settings.unitsOfMeasure === 'Imperial' ?
                                    <span style={{ zIndex: 1, background: 'white' }}>$/kGal</span>
                                    : <span style={{ zIndex: 1, background: 'white' }}>$/L</span>
                                }
                            </InputAdornment>,
                    }}
                    />
            </Box>
            <Divider sx={{ width: '100%' }} />
            </Box>
        ))}

    </Box>);
}

export default memo(InSystemTreatmentForm);

export interface InSystemTreatmentFormProps {
    selectedNode: Node<ProcessFlowPart>;
}



