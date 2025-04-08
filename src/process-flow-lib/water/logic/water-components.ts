import { CustomNodeStyleMap } from "../constants";
import { Node } from "@xyflow/react";
import { Handles, ProcessFlowNodeType, ProcessFlowPart, WaterProcessComponentType } from "../types/diagram";
import { ConnectedFlowType, DiagramWaterSystemFlows, WaterProcessComponent, WaterSystemFlowsTotals, WaterTreatment, WaterUsingSystem } from "../types/water-components";
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
  
  
     /**
 * Add new component or return component based from a diagram component
 * @param processFlowPart Build from diagram component
 */
  export const getWaterUsingSystem = (processFlowPart?: WaterProcessComponent): WaterUsingSystem => {
      let waterUsingSystem: WaterUsingSystem;
      let newComponent: WaterProcessComponent;
      if (!processFlowPart) {
        newComponent = getNewProcessComponent('water-using-system') as WaterUsingSystem;
      } else {
        newComponent = processFlowPart as WaterUsingSystem;
      }
      waterUsingSystem = {
        ...newComponent,
        createdByAssessment: true,
        hoursPerYear: 8760,
        userDiagramFlowOverrides: {
          sourceWater: undefined,
          recirculatedWater: undefined,
          dischargeWater: undefined,
          knownLosses: undefined,
          waterInProduct: undefined,
        }, 
        intakeSources: [
          {
            sourceType: 0,
            annualUse: 0
          }
        ],
        processUse: {
          waterRequiredMetric: 0,
          waterRequiredMetricValue: undefined,
          waterConsumedMetric: 0,
          waterConsumedMetricValue: undefined,
          waterLossMetric: 0,
          waterLossMetricValue: undefined,
          annualProduction: undefined,
          fractionGrossWaterRecirculated: undefined,
        },
        coolingTower: {
          tonnage: undefined,
          loadFactor: undefined,
          evaporationRateDegree: undefined,
          temperatureDrop: undefined,
          makeupConductivity: undefined,
          blowdownConductivity: undefined,
        },
        boilerWater: {
          power: undefined,
          loadFactor: undefined,
          steamPerPower: undefined,
          feedwaterConductivity: undefined,
          makeupConductivity: undefined,
          blowdownConductivity: undefined,
        },
        kitchenRestroom: {
          employeeCount: undefined,
          workdaysPerYear: undefined,
          dailyUsePerEmployee: undefined
        },
        landscaping: {
          areaIrrigated: undefined,
          yearlyInchesIrrigated: undefined,
        },
        heatEnergy: {
          incomingTemp: undefined,
          outgoingTemp: undefined,
          heaterEfficiency: undefined,
          heatingFuelType: 0,
          wasteWaterDischarge: undefined
        },
        addedMotorEnergy: [],
        waterFlows: {
          sourceWater: 0,
          recirculatedWater: 0,
          dischargeWater: 0,
          knownLosses: 0,
          waterInProduct: 0,
        }
  
      }
  
      return waterUsingSystem;
    }
  

    /**
 * Set flows from users values, or default to diagram values
 */
  export const getWaterFlowsFromSource = (waterUsingSystem: WaterUsingSystem, diagramWaterSystemFlows: DiagramWaterSystemFlows): WaterSystemFlowsTotals => {
    let systemFlowTotals: WaterSystemFlowsTotals = {
      sourceWater: diagramWaterSystemFlows.sourceWater.total,
      recirculatedWater: diagramWaterSystemFlows.recirculatedWater.total,
      dischargeWater: diagramWaterSystemFlows.dischargeWater.total,
      knownLosses: diagramWaterSystemFlows.knownLosses.total,
      waterInProduct: diagramWaterSystemFlows.waterInProduct.total,
    };
    Object.keys(waterUsingSystem.userDiagramFlowOverrides).forEach((key: ConnectedFlowType) => {
      systemFlowTotals[key] = waterUsingSystem.userDiagramFlowOverrides[key]? waterUsingSystem.userDiagramFlowOverrides[key] : diagramWaterSystemFlows[key].total;
    });
    return systemFlowTotals;
  }

  export const getWaterFlowTotals = (diagramWaterSystemFlows: DiagramWaterSystemFlows): WaterSystemFlowsTotals => {
    let systemFlowTotals: WaterSystemFlowsTotals = {
      sourceWater: diagramWaterSystemFlows.sourceWater.total,
      recirculatedWater: diagramWaterSystemFlows.recirculatedWater.total,
      dischargeWater: diagramWaterSystemFlows.dischargeWater.total,
      knownLosses: diagramWaterSystemFlows.knownLosses.total,
      waterInProduct: diagramWaterSystemFlows.waterInProduct.total,
    };
    return systemFlowTotals;
  }