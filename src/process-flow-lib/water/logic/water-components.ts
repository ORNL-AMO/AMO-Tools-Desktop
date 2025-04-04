import { CustomNodeStyleMap } from "../constants";
import { Node } from "@xyflow/react";
import { Handles, ProcessFlowNodeType, ProcessFlowPart, WaterProcessComponentType } from "../types/diagram";
import { WaterTreatment } from "../types/water-components";
import { getNewIdString } from "./utils";

 
  const getDefaultHandles = (componentType?: ProcessFlowNodeType): Handles => {
    let handles = {
      inflowHandles: {
        a: true,
        b: true,
        c: false,
        d: false,
      },
      outflowHandles: {
        e: true,
        f: true,
        g: false,
        h: false,
      }
    }
  
    if ('water-intake' === componentType) {
      return { outflowHandles: handles.outflowHandles };
    }
    
    if ('water-discharge' === componentType) {
      return { inflowHandles: handles.inflowHandles };
    }
  
    return handles;
  }
  
  
  export const processFlowDiagramParts: ProcessFlowPart[] = [
    {
      processComponentType: 'water-intake',
      name: 'Intake Source',
      className: 'water-intake',
      isValid: true,
      userEnteredData: {
        totalDischargeFlow: undefined,
        totalSourceFlow: undefined
      },
      disableInflowConnections: true,
      createdByAssessment: false,
      handles: getDefaultHandles('water-intake')
    },
    {
      processComponentType: 'water-using-system',
      name: 'Water Using System',
      className: 'water-using-system',
      isValid: true,
      inSystemTreatment: [],
      userEnteredData: {
        totalDischargeFlow: undefined,
        totalSourceFlow: undefined
      },
      createdByAssessment: false,
      handles: getDefaultHandles()
    },
    {
      processComponentType: 'water-discharge',
      name: 'Discharge Outlet',
      className: 'water-discharge',
      disableOutflowConnections: true,
      isValid: true,
      userEnteredData: {
        totalDischargeFlow: undefined,
        totalSourceFlow: undefined
      },
      createdByAssessment: false,
      handles: getDefaultHandles('water-discharge')
    },
    {
      processComponentType: 'water-treatment',
      name: 'Water Treatment',
      className: 'water-treatment',
      isValid: true,
      userEnteredData: {
        totalDischargeFlow: undefined,
        totalSourceFlow: undefined
      },
      createdByAssessment: false,
      handles: getDefaultHandles()
    },
    {
      processComponentType: 'waste-water-treatment',
      name: 'Waste Treatment',
      className: 'waste-water-treatment',
      isValid: true,
      userEnteredData: {
        totalDischargeFlow: undefined,
        totalSourceFlow: undefined
      },
      createdByAssessment: false,
      handles: getDefaultHandles()
    },
    {
      processComponentType: 'known-loss',
      name: 'Known Loss',
      className: 'known-loss',
      isValid: true,
      userEnteredData: {
        totalDischargeFlow: undefined,
        totalSourceFlow: undefined
      },
      createdByAssessment: false,
      handles: getDefaultHandles()
    },
    {
      processComponentType: 'summing-node',
      name: 'Summing Connector',
      className: 'summing-node',
      isValid: true,
      userEnteredData: {
        totalDischargeFlow: undefined,
        totalSourceFlow: undefined
      },
      createdByAssessment: false,
      handles: {
        inflowHandles: {
          a: true,
          b: true,
          c: true,
          d: true,
        },
        outflowHandles: {
          e: true,
          f: true,
          g: true,
          h: true,
        }
      }
    }
  ];
  
  
  export const getComponentNameFromType = (componentType) => {
    let component = processFlowDiagramParts.find(part => part.processComponentType === componentType);
    return component ? component.name : '';
  }
  
  export const getNewProcessComponent = (processComponentType: WaterProcessComponentType): ProcessFlowPart => {
    let diagramComponent: ProcessFlowPart = processFlowDiagramParts.find(part => part.processComponentType === processComponentType);
    let newProcessComponent: ProcessFlowPart = {
      processComponentType: diagramComponent.processComponentType,
      createdByAssessment: false,
      name: diagramComponent.name,
      className: diagramComponent.className,
      systemType: 0,
      treatmentType: 0,
      customTreatmentType: undefined,
      cost: undefined,
      isValid: diagramComponent.isValid,
      disableInflowConnections: diagramComponent.disableInflowConnections,
      disableOutflowConnections: diagramComponent.disableOutflowConnections,
      userEnteredData: {
        totalDischargeFlow: diagramComponent.totalDischargeFlow as number,
        totalSourceFlow: diagramComponent.totalSourceFlow as number
      },
      diagramNodeId: getNewNodeId(),
      modifiedDate: new Date(),
      handles: { ...diagramComponent.handles },
    };
  
    if (newProcessComponent.processComponentType === 'water-using-system') {
      newProcessComponent.inSystemTreatment = [];
    }
  
    return newProcessComponent;
  }
  
  
  export const getNewNodeId = () => {
    let nodeId = `n_${getNewIdString()}`;
    return nodeId;
  }
  
  
  export const getWaterTreatmentComponent = (existingTreatment?: WaterTreatment, inSystem: boolean = false, createdByAssessment: boolean = false): WaterTreatment => {
      let waterTreatment: WaterTreatment;
      let newComponent: WaterTreatment;
      if (!existingTreatment) {
        newComponent = getNewProcessComponent('water-treatment') as WaterTreatment;
      } else {
        newComponent = existingTreatment as WaterTreatment;
      }
      waterTreatment = {
        ...newComponent,
        createdByAssessment: createdByAssessment,
        treatmentType: newComponent.treatmentType !== undefined? newComponent.treatmentType : 0,
        customTreatmentType: newComponent.customTreatmentType,
        cost: newComponent.cost !== undefined? newComponent.cost : 0,
        name: newComponent.name,
        flowValue: newComponent.flowValue
      };
  
      if (inSystem) {
        delete waterTreatment.modifiedDate
      }
      
      return waterTreatment;
    }
  
  
  export const getNewNode = (nodeType: WaterProcessComponentType, newProcessComponent: ProcessFlowPart, position?: { x: number, y: number }): Node => {
    const newNode: Node = {
      id: newProcessComponent.diagramNodeId,
      type: nodeType,
      position: position,
      className: newProcessComponent.className,
      data: newProcessComponent,
      style: CustomNodeStyleMap[nodeType]
    };
  
    return newNode;
  }
  
  