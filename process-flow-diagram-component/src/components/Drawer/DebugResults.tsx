import * as React from 'react';
import FlowDisplayUnit from '../Diagram/FlowDisplayUnit';
import { Box } from '@mui/material';
import { DiagramCalculatedData, DiagramSettings, getPlantSummaryResults, NodeErrors, NodeGraphIndex, PlantResults, TrueCostOfSystems } from 'process-flow-lib';
import { selectCalculatedData, selectGraphIndex, selectNodes } from '../Diagram/store';
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
    let trueCostOfSystems: TrueCostOfSystems = {};
    let plantResults: PlantResults;

    if (isDiagramValid) {
        plantResults = getPlantSummaryResults(nodes, calculatedNodeData, graph, settings.electricityCost);
        trueCostOfSystems = plantResults.trueCostOfSystems;

        console.log('plantResults', plantResults);
        console.log('trueCostOfSystems', trueCostOfSystems);
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
