import { CustomEdgeData, DiagramValidation, FlowDiagramData, ComponentFlowValidation, ProcessFlowPart, ComponentValidation, ValidationStatus } from "../../../src/process-flow-types/shared-process-flow-types";
import { Node, Edge } from "reactflow";
import { getNodeFlowTotals } from "../components/Diagram/FlowUtils";


export const getInitialDiagramValidation = (flowDiagramData: FlowDiagramData, allEdges: Edge[]): DiagramValidation => {
    let diagramValidation: DiagramValidation = { nodes: {}};

    flowDiagramData.nodes.forEach((nd: Node<ProcessFlowPart>) => {
        const componentSourceEdges = allEdges.filter((edge: Edge<CustomEdgeData>) => edge.target === nd.data.diagramNodeId);
        const componentDischargeEdges = allEdges.filter((edge: Edge<CustomEdgeData>) => edge.source === nd.data.diagramNodeId);
        const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(componentSourceEdges.concat(componentDischargeEdges), flowDiagramData.nodes, nd.data.diagramNodeId);
        let sourceValidation: ComponentFlowValidation = {totalFlowValueDifferent: undefined, flowValues: {}, status: 'VALID'};
        sourceValidation.totalFlowValueDifferent = validateTotalFlowValue(totalCalculatedSourceFlow, nd.data.userEnteredData.totalSourceFlow, nd.data.userEnteredData.totalSourceFlow);
         componentSourceEdges.map((edge: Edge<CustomEdgeData>) => {
             const validationMessage = validateFlowValue(edge.data.flowValue);
             sourceValidation.status = validationMessage? 'WARNING' : sourceValidation.status;
             sourceValidation.flowValues = {
                 ...sourceValidation.flowValues,
                 [edge.id]: {
                     flowValueGreaterThan: validationMessage,
                 }
             }
         });

        let dischargeFlowValidation: ComponentFlowValidation = {totalFlowValueDifferent: undefined, flowValues: {}, status: 'VALID'};
        dischargeFlowValidation.totalFlowValueDifferent = validateTotalFlowValue(totalCalculatedDischargeFlow, nd.data.userEnteredData.totalDischargeFlow, nd.data.userEnteredData.totalDischargeFlow);
        componentDischargeEdges.map((edge: Edge<CustomEdgeData>) => {
             const validationMessage = validateFlowValue(edge.data.flowValue);
             dischargeFlowValidation.status = validationMessage? 'WARNING' : dischargeFlowValidation.status;
             dischargeFlowValidation.flowValues = {
                 ...dischargeFlowValidation.flowValues,
                 [edge.id]: {
                     flowValueGreaterThan: validationMessage,
                 }
             }
         });


        diagramValidation.nodes[nd.data.diagramNodeId] = {
            status: getComponentValidStatus(sourceValidation, dischargeFlowValidation),
            source: sourceValidation,
            discharge: dischargeFlowValidation,
        }
    });

    return diagramValidation;
}


export const validateFlowValue = (value: number | null) => {
    let validationMessage = "";
    if (value === null || value === undefined || value <= 0) {
        validationMessage = "Flow value must be greater than 0";
    }
    return validationMessage;
};

// todo cleanup inputs
/**
   * Check accuracy of calculated or stateful total flow against each other
   * @param calculatedValue retrived from getNodeFlowTotals()
   * @param userEnteredTotalFlow componentData.userEnteredData.totalSourceFlow or componentData.userEnteredData.totalSourceFlow 
   * @param statefulTotalFlow totalSourceFlow or totalDischargeFlow as either state of component or as saved to userEnteredData
   */
export const validateTotalFlowValue = (calculatedTotalFlow: number, userEnteredTotalFlow: number, statefulTotalFlow: number) => {
    let validationMessage = "";
    let hasFlows = calculatedTotalFlow !== null && calculatedTotalFlow !== undefined;
    // *If a user entered value exists, check that our calculated total does not differ with component saved value (useEnteredValue)
    if (hasFlows) {
        if (userEnteredTotalFlow !== undefined && statefulTotalFlow !== undefined && calculatedTotalFlow !== statefulTotalFlow) {
            validationMessage = "The sum of all source flows should equal Total Flow";
        }
    } 
    return validationMessage;
};


export const isValidComponent = (componentValidation: ComponentValidation) => {
    return componentValidation && !InvalidStates.includes(componentValidation.status);
}

export const isDiagramValid = (diagramValidation: DiagramValidation) => {
    if (diagramValidation.nodes) {
        const invalid = Object.entries(diagramValidation.nodes).some(([nodeId, componentValidation]) => {
            return !isValidComponent(componentValidation);
        });
        return !invalid;
    }
    return true;
}

export const getComponentValidStatus = (sourceFlowValidation: ComponentFlowValidation, dischargeFlowValidation: ComponentFlowValidation) => {
    let componentStatus: ValidationStatus = 'VALID';
    if (sourceFlowValidation?.status === 'ERROR' || dischargeFlowValidation?.status === 'ERROR') {
        componentStatus = 'ERROR';
    } else if (sourceFlowValidation?.status === 'WARNING' || dischargeFlowValidation?.status === 'WARNING') {
        componentStatus = 'WARNING';
    }
    return componentStatus;
}

export const InvalidStates = ['ERROR', 'WARNING'] as ValidationStatus[];