import { memo, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { ProcessFlowPart, WaterTreatment } from "../../../../src/process-flow-types/shared-process-flow-types";
import { Box, Select, MenuItem, IconButton, TextField, Button, Divider } from "@mui/material";
import { waterTreatmentTypeOptions } from "../../../../src/process-flow-types/shared-process-flow-constants";
import DeleteIcon from '@mui/icons-material/Delete';
import { getStoreSerializedDate, nodeDataPropertyChange } from "../Diagram/diagramReducer";
import SelectTreatmentType from "./SelectTreatmentType";
import {
    type Node,
  } from '@xyflow/react';
import { getWaterTreatmentComponent } from "../../../../src/process-flow-types/shared-process-flow-logic";

const InSystemTreatmentForm = (props: InSystemTreatmentFormProps) => {
    const dispatch = useAppDispatch();
    const [treatments, setTreatments] = useState<Array<WaterTreatment>>(props.selectedNode.data.inSystemTreatment || []);

    useEffect(() => {
        dispatch(nodeDataPropertyChange({ optionsProp: 'inSystemTreatment', updatedValue: treatments }));
    }, [treatments]);

    const addTreatment = () => {
        const newTreatment = getWaterTreatmentComponent(undefined, true);
        const updatedTreatments = [...treatments, newTreatment];
        setTreatments(updatedTreatments);
    };

    const handleTreatmentChange = (id: string, field: 'name' | 'treatmentType', value: string | number) => {
        const updatedTreatments = treatments.map((treatment: WaterTreatment) => treatment.diagramNodeId === id ? { ...treatment, [field]: value } : treatment);
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
            <Box key={treatment.diagramNodeId} display="flex" alignItems="center" gap={1} marginY={'1rem'}>
                <TextField
                    label="Treatment Name"
                    value={treatment.name}
                    onChange={(e) => handleTreatmentChange(treatment.diagramNodeId, 'name', e.target.value)}
                    size="small"
                />
                {/* <select className="form-control diagram-select" id={'treatmentType'} name="treatmentType"
                    style={{ width: '50%', height: '2.25rem' }}    
                    value={treatment.treatmentType}
                    onChange={(e) => handleTreatmentChange(treatment.diagramNodeId, 'treatmentType', Number(e.target.value))}>
                    {treatmentTypeOptions.map((option, index) => {
                        return (
                            <option key={option.display + '_' + index} value={option.value}>{option.display}</option>
                        )
                    })
                    }
                </select> */}
                <SelectTreatmentType 
                    style={{ width: '50%' }}
                    treatmentType={treatment.treatmentType}
                    handleTreatmentTypeChange={(value: number) => handleTreatmentChange(treatment.diagramNodeId, 'treatmentType', value)}
                ></SelectTreatmentType>
                <IconButton onClick={() => removeTreatment(treatment.diagramNodeId)} size="small" color="error">
                    <DeleteIcon />
                </IconButton>
            </Box>
        ))}

    </Box>);
}

export default memo(InSystemTreatmentForm);

export interface InSystemTreatmentFormProps {
    selectedNode: Node<ProcessFlowPart>;
}



