import * as React from 'react';
import FlowDisplayUnit from '../Diagram/FlowDisplayUnit';
import { Box } from '@mui/material';
import { DiagramCalculatedData, DiagramSettings, getPlantSummaryResults, NodeErrors, NodeGraphIndex, PlantResults, ProcessFlowPart, TrueCostOfSystems } from 'process-flow-lib';
import { selectCalculatedData, selectGraphIndex, selectNodes, selectWasteTreatmentNodes, selectWaterTreatmentNodes } from '../Diagram/store';
import { useAppSelector } from '../../hooks/state';
import { Node } from '@xyflow/react';
import { TrueCostOfSystemResultTable } from '../StyledMUI/ResultTables';
import { getIsDiagramValid } from '../../validation/Validation';


const DiagramResults = () => {
    const nodes: Node[] = useAppSelector(selectNodes);
    const validationErrors: NodeErrors = useAppSelector((state) => state.diagram.nodeErrors);
    const graph: NodeGraphIndex = useAppSelector(selectGraphIndex);
    const calculatedNodeData: DiagramCalculatedData = useAppSelector(selectCalculatedData);
    const settings: DiagramSettings = useAppSelector((state) => state.diagram.settings);
    const isDiagramValid = getIsDiagramValid(validationErrors);
    const waterTreatmentNodes: Node<ProcessFlowPart>[] = useAppSelector(selectWaterTreatmentNodes);
    const wasteTreatmentNodes: Node<ProcessFlowPart>[] = useAppSelector(selectWasteTreatmentNodes);


    let trueCostOfSystems: TrueCostOfSystems = {};
    let plantResults: PlantResults;

    if (isDiagramValid) {
        plantResults = getPlantSummaryResults(nodes, calculatedNodeData, graph, settings.electricityCost, waterTreatmentNodes, wasteTreatmentNodes, undefined);
        trueCostOfSystems = plantResults.trueCostOfSystems;
    } else {
        console.log('errors', validationErrors);
    }


    return (
        <Box sx={{ marginX: '.5rem' }}>
            {isDiagramValid ?
                <TrueCostOfSystemResultTable trueCostOfSystems={trueCostOfSystems} nodes={nodes} /> : <></>
            }
        </Box>
    );
}

export default DiagramResults;
