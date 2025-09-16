import { Node, Edge } from "@xyflow/react";
import { FlowMetric } from "../constants";
import { CustomEdgeData, DiagramCalculatedData, NodeFlowData, ProcessFlowPart } from "../types/diagram";
import { KnownLoss } from "../types/water-components";


export function getNewIdString() {
  return Math.random().toString(36).substring(2, 9);
}


const convertFlowValue = (value: number, newUnits: string) => {
  if (isValidNumber(value)) {
    if (newUnits === 'Metric') {
      // * return m3 
      return value * 3785.4118;
    } else if (newUnits === 'Imperial') {
      // * return mGal 
      return value / 3785.4118;
    }
  }
  return value;
}

const isValidNumber = (num: number): boolean => {
  return !isNaN(num) && num !== null && num !== undefined;
}


export const convertFlowDiagramData = (flowDiagramData: { nodes: Node[], edges: Edge[], calculatedData: DiagramCalculatedData }, newUnits: string) => {
  flowDiagramData.nodes = flowDiagramData.nodes.map((nd: Node<ProcessFlowPart>) => {
    const convertedTotalSourceFlow = convertFlowValue(nd.data.userEnteredData.totalSourceFlow, newUnits);
    const convertedTotalDischargeFlow = convertFlowValue(nd.data.userEnteredData.totalDischargeFlow, newUnits);
    const convertedTotalKnownLosses = convertFlowValue(nd.data.userEnteredData.totalKnownLosses, newUnits);
    const convertedWaterInProduct = convertFlowValue(nd.data.userEnteredData.waterInProduct, newUnits);

    const convertedUserEnteredData: NodeFlowData = {
      totalKnownLosses: convertedTotalKnownLosses,
      waterInProduct: convertedWaterInProduct,
      totalSourceFlow: convertedTotalSourceFlow,
      totalDischargeFlow: convertedTotalDischargeFlow
    };

    return {
      ...nd,
      data: {
        ...nd.data,
        userEnteredData: convertedUserEnteredData
      }
    }
  });

  flowDiagramData.edges = flowDiagramData.edges.map((edge: Edge<CustomEdgeData>) => {
    const convertedEdgeflowValue = convertFlowValue(edge.data.flowValue, newUnits);
    return {
      ...edge,
      data: {
        ...edge.data,
        flowValue: convertedEdgeflowValue
      }
    }
  });

  flowDiagramData.calculatedData = convertCalculatedData(flowDiagramData.calculatedData, newUnits);
}

  export const convertCalculatedData = (diagramCalculatedData: DiagramCalculatedData, newUnits: string): DiagramCalculatedData => {
    if (diagramCalculatedData) {
      let convertedCalculatedData: DiagramCalculatedData = {
        nodes: {}
      };
      Object.entries(diagramCalculatedData.nodes).forEach(([nodeId, nodeData]) => {
        let convertedNodeData: NodeFlowData = {
          name: nodeData.name,
          totalSourceFlow: convertFlowValue(nodeData.totalSourceFlow, newUnits),
          totalDischargeFlow: convertFlowValue(nodeData.totalDischargeFlow, newUnits),
          totalKnownLosses: convertFlowValue(nodeData.totalKnownLosses, newUnits),
          waterInProduct: convertFlowValue(nodeData.waterInProduct, newUnits),
        };
        convertedCalculatedData.nodes[nodeId] = convertedNodeData;
      });
      return convertedCalculatedData;
    }
    return diagramCalculatedData;
  }


export const convertNullInputValueForObjectConstructor = (inputValue: number | string): number => {
  let validInput: number;
  if (inputValue === null || inputValue === undefined) {
    validInput = 0;
  } else if (typeof inputValue === 'string' && inputValue == '') {
    // There are various number type properties in PHAST that 
    // get set to '' in places that aren't clear
    validInput = 0;
  } else {
    validInput = Number(inputValue);
  }
  return validInput;
}

export const convertAnnualFlow = (flowInput: number, metric: number, hoursPerYear: number, annualProduction: number, grossWaterUse?: number, incomingWater?: number): number => {
  if (metric == FlowMetric.ANNUAL) {
    return flowInput;
  } else if (metric == FlowMetric.HOURLY) {
    return flowInput * hoursPerYear;
  } else if (metric == FlowMetric.INTENSITY) {
    return flowInput * annualProduction;
  } else if (metric == FlowMetric.FRACTION_GROSS) {
    return flowInput * grossWaterUse;
  } else if (metric == FlowMetric.FRACTION_INCOMING) {
    return flowInput * incomingWater;
  }
}


export const getIsKnownLossFlow = (targetId: string, knownLosses: KnownLoss[]) => {
  return knownLosses.some((knownLoss: KnownLoss) => knownLoss.diagramNodeId === targetId);
} 