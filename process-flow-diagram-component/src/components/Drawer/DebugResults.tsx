import * as React from 'react';
import { Box } from '@mui/material';
import { CustomEdgeData, DiagramCalculatedData, DiagramSettings, getIsDiagramValid, getPlantSummaryResults, DiagramFlowErrors, NodeGraphIndex, PlantResults, ProcessFlowPart, TrueCostOfSystems } from 'process-flow-lib';
import { selectCalculatedData, selectGraphIndex, selectNodes, selectWasteTreatmentNodes, selectWaterTreatmentNodes } from '../Diagram/store';
import { useAppSelector } from '../../hooks/state';
import { Edge, Node } from '@xyflow/react';
import { TrueCostOfSystemResultTable } from '../StyledMUI/ResultTables';


const DiagramResults = () => {
    const nodes: Node[] = useAppSelector(selectNodes);
    const edges: Edge<CustomEdgeData>[] = useAppSelector((state) => state.diagram.edges) as Edge<CustomEdgeData>[];
    const validationErrors: DiagramFlowErrors = useAppSelector((state) => state.diagram.diagramFlowErrors);
    const calculatedNodeData: DiagramCalculatedData = useAppSelector(selectCalculatedData);
    const settings: DiagramSettings = useAppSelector((state) => state.diagram.settings);
    const isDiagramValid = getIsDiagramValid(validationErrors);

    let trueCostOfSystems: TrueCostOfSystems = {};
    
    if (isDiagramValid) {
        let plantResults: PlantResults = getPlantSummaryResults(nodes, calculatedNodeData, edges, settings.electricityCost, settings, {});
        console.log('plantResults:', plantResults);
        trueCostOfSystems = plantResults.trueCostOfSystems;
    } else {
        console.log('errors', validationErrors);
    }

    return (
        <Box>
            {isDiagramValid ?
                <TrueCostOfSystemResultTable trueCostOfSystems={trueCostOfSystems} nodes={nodes} /> : <></>
            }
        </Box>
    );
}

export default DiagramResults;
