import { Node, Edge } from "@xyflow/react";
import { FlowMetric } from "./shared-process-flow-constants";
import { BoilerWater, BoilerWaterResults, CoolingTower, CoolingTowerResults, CustomEdgeData, CustomNodeStyleMap, DiagramCalculatedData, DiagramSettings, Handles, KitchenRestroom, KitchenRestroomResults, Landscaping, LandscapingResults, ProcessFlowNodeType, ProcessFlowPart, ProcessUse, ProcessUseResults, WaterProcessComponentType, WaterTreatment } from "./shared-process-flow-types";

// * WASM Module with suite api
declare var Module: any;
export const convertAnnualFlow = (flowInput: number, metric: number, hoursPerYear: number, annualProduction: number, grossWaterUse?: number, incomingWater?: number): number => {
    if (metric == FlowMetric.ANNUAL) {
      return flowInput;
    } else if (metric == FlowMetric.HOURLY) {
      return flowInput * hoursPerYear;
    } else if (metric == FlowMetric.INTENSITY) {
      return flowInput * annualProduction;
    }else if (metric == FlowMetric.FRACTION_GROSS) {
      return flowInput * grossWaterUse;
    }else if (metric == FlowMetric.FRACTION_INCOMING) {
      return flowInput * incomingWater;
    }
  }

export const calculateProcessUseResults = (processUse: ProcessUse, hoursPerYear: number): ProcessUseResults => {
  let grossWaterUse = convertAnnualFlow(
      processUse.waterRequiredMetricValue, 
      processUse.waterRequiredMetric, 
      hoursPerYear, 
      processUse.annualProduction
    );
    let recirculatedWater = grossWaterUse * processUse.fractionGrossWaterRecirculated;
    let incomingWater = grossWaterUse - recirculatedWater;
    let waterConsumed = convertAnnualFlow(
      processUse.waterConsumedMetricValue, 
      processUse.waterConsumedMetric, 
      hoursPerYear, 
      processUse.annualProduction,
      grossWaterUse, 
      incomingWater
    );
    let waterLoss = convertAnnualFlow(
      processUse.waterLossMetricValue, 
      processUse.waterLossMetric, 
      hoursPerYear, 
      processUse.annualProduction,
      grossWaterUse, 
      incomingWater
    );
    let wasteDischargedAndRecycledOther = incomingWater - waterConsumed - waterLoss;

    return {
      grossWaterUse,
      recirculatedWater,
      incomingWater,
      waterConsumed,
      waterLoss,
      wasteDischargedAndRecycledOther
    }
  }

  export const calculateBoilerWaterResults = (inputData: BoilerWater, hoursPerYear: number): BoilerWaterResults => {
      const suiteApiInputData = JSON.parse(JSON.stringify(inputData));
      let instance = new Module.WaterAssessment();
      hoursPerYear = convertNullInputValueForObjectConstructor(hoursPerYear);
      suiteApiInputData.power = convertNullInputValueForObjectConstructor(suiteApiInputData.power);
      suiteApiInputData.loadFactor = convertNullInputValueForObjectConstructor(suiteApiInputData.loadFactor);
      suiteApiInputData.loadFactor = suiteApiInputData.loadFactor / 100;
      suiteApiInputData.steamPerPower = convertNullInputValueForObjectConstructor(suiteApiInputData.steamPerPower);
      suiteApiInputData.feedwaterConductivity = convertNullInputValueForObjectConstructor(suiteApiInputData.feedwaterConductivity);
      suiteApiInputData.makeupConductivity = convertNullInputValueForObjectConstructor(suiteApiInputData.makeupConductivity);
      suiteApiInputData.blowdownConductivity = convertNullInputValueForObjectConstructor(suiteApiInputData.blowdownConductivity);
      let output = instance.calculateBoilerWaterLosses(
        hoursPerYear,
        suiteApiInputData.power,
        suiteApiInputData.loadFactor,
        suiteApiInputData.steamPerPower,
        suiteApiInputData.feedwaterConductivity,
        suiteApiInputData.makeupConductivity,
        suiteApiInputData.blowdownConductivity,
      );
  
      let results: BoilerWaterResults = {
        cycleOfConcentration: output.cycleOfConcentration,
        grossWaterUse: output.grossWaterUse,
        makeupWater: output.makeupWater,
        steamLoss: output.steamLoss,
        blowdownLoss: output.blowdownLoss,
        condensateReturn: output.condensateReturn,
        rateOfRecirculation: output.rateOfRecirculation,
      }
  
      instance.delete();
      output.delete();
  
      return results;
    }

    export const calculateCoolingTowerResults = (inputData: CoolingTower, hoursPerYear: number): CoolingTowerResults => {
      const suiteApiInputData = JSON.parse(JSON.stringify(inputData));
      let instance = new Module.WaterAssessment();
      hoursPerYear = convertNullInputValueForObjectConstructor(hoursPerYear);
      suiteApiInputData.tonnage = convertNullInputValueForObjectConstructor(suiteApiInputData.tonnage);
      suiteApiInputData.loadFactor = convertNullInputValueForObjectConstructor(suiteApiInputData.loadFactor);
      suiteApiInputData.loadFactor = suiteApiInputData.loadFactor / 100;
      suiteApiInputData.evaporationRateDegree = convertNullInputValueForObjectConstructor(suiteApiInputData.evaporationRateDegree);
      suiteApiInputData.evaporationRateDegree = suiteApiInputData.evaporationRateDegree / 100;
      suiteApiInputData.temperatureDrop = convertNullInputValueForObjectConstructor(suiteApiInputData.temperatureDrop);
      suiteApiInputData.makeupConductivity = convertNullInputValueForObjectConstructor(suiteApiInputData.makeupConductivity);
      suiteApiInputData.blowdownConductivity = convertNullInputValueForObjectConstructor(suiteApiInputData.blowdownConductivity);
  
      let output = instance.calculateCoolingTowerLoss(
        hoursPerYear,
        suiteApiInputData.tonnage,
        suiteApiInputData.loadFactor,
        suiteApiInputData.evaporationRateDegree,
        suiteApiInputData.temperatureDrop,
        suiteApiInputData.makeupConductivity,
        suiteApiInputData.blowdownConductivity,
      );
  
      let results: CoolingTowerResults = {
        grossWaterUse: output.grossWaterUse,
        evaporationLoss: output.evaporationLoss,
        cycleOfConcentration: output.cycleOfConcentration,
        makeupWater: output.makeupWater,
        blowdownLoss: output.blowdownLoss,
      }
  
      instance.delete();
      output.delete();
  
      return results;
  
    }

    export const calculateKitchenRestroomResults = (inputData: KitchenRestroom): KitchenRestroomResults =>  {
      const suiteApiInputData = JSON.parse(JSON.stringify((inputData)));
      let instance = new Module.WaterAssessment();
      suiteApiInputData.employeeCount = convertNullInputValueForObjectConstructor(suiteApiInputData.employeeCount);
      suiteApiInputData.workdaysPerYear = convertNullInputValueForObjectConstructor(suiteApiInputData.workdaysPerYear);
      suiteApiInputData.dailyUsePerEmployee = convertNullInputValueForObjectConstructor(suiteApiInputData.dailyUsePerEmployee);
      let grossWaterUse = instance.calculateKitchenRestroomGrossWaterUse(
        suiteApiInputData.employeeCount,
        suiteApiInputData.workdaysPerYear,
        suiteApiInputData.dailyUsePerEmployee,
      );
  
      let results: KitchenRestroomResults = {
        grossWaterUse: grossWaterUse
      }
  
      instance.delete();
  
      return results;
    }

    export const convertLandscapingSuiteInput = (landscaping: Landscaping, unitsOfMeasure: string): Landscaping => {
      let convertedLandscaping: Landscaping = {
        areaIrrigated: landscaping.areaIrrigated,
        yearlyInchesIrrigated: landscaping.yearlyInchesIrrigated
      };
      if (unitsOfMeasure == 'Imperial') {
        // * return ft2 to in2
        convertedLandscaping.areaIrrigated = convertedLandscaping.areaIrrigated * 144;
      } else if (unitsOfMeasure == "Metric") {
        // * return m2 to cm2
        convertedLandscaping.areaIrrigated = convertedLandscaping.areaIrrigated * 10000;
      }
  
      return convertedLandscaping;
    }
  
  
    export const calculateLandscapingResults = (inputData: Landscaping): LandscapingResults => {
      const suiteApiInputData = JSON.parse(JSON.stringify((inputData)));
      let instance = new Module.WaterAssessment();
      suiteApiInputData.areaIrrigated = convertNullInputValueForObjectConstructor(suiteApiInputData.areaIrrigated);
      suiteApiInputData.yearlyInchesIrrigated = convertNullInputValueForObjectConstructor(suiteApiInputData.yearlyInchesIrrigated);

      let grossWaterUse = instance.calculateLandscapingGrossWaterUse(
        suiteApiInputData.areaIrrigated,
        suiteApiInputData.yearlyInchesIrrigated,
      );
  
      let results: LandscapingResults = {
        grossWaterUse: grossWaterUse
      }
  
      instance.delete();
      return results;
    }
  

  // todo This may not be correct for metric
// See convert water assessment service
  export const convertAnnualFlowResult = (flowValue: number, settings: DiagramSettings): number => {
    let annualFlowResult = flowValue / 1_000_000; // convert to Mgal/m3
    if (settings.unitsOfMeasure == 'Imperial') {
      return annualFlowResult;
    } else if (settings.unitsOfMeasure == 'Metric') {
      return annualFlowResult * 3785.4118;
    }
    return flowValue;
  }

  export const convertLandscapingResults =(results: LandscapingResults, unitsOfMeasure: string): LandscapingResults => {
    if (unitsOfMeasure == 'Imperial') {
      // * return in3 to gal 
      results.grossWaterUse = results.grossWaterUse * 0.004329;
    }
    return results;
  }


  export const getUnknownLossees = (totalSourceFlow: number, totalDischargeFlow: number, knownLosses: number, waterInProduct: number): number => {
    return totalSourceFlow - totalDischargeFlow - knownLosses - waterInProduct;
  }

  const convertNullInputValueForObjectConstructor = (inputValue: number | string): number => {
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



  export function getNewIdString() {
    return Math.random().toString(36).substring(2, 9);
  }
  
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
  
  
  export const convertFlowDiagramData = (flowDiagramData: {nodes: Node[], edges: Edge[], calculatedData: DiagramCalculatedData}, newUnits: string) => {
    flowDiagramData.nodes = flowDiagramData.nodes.map((nd: Node<ProcessFlowPart>) => {
      const convertedTotalSourceFlow = convertFlowValue(nd.data.userEnteredData.totalSourceFlow, newUnits);
      const convertedTotalDischargeFlow = convertFlowValue(nd.data.userEnteredData.totalDischargeFlow, newUnits);
      return {
        ...nd,
        data: {
          ...nd.data,
          userEnteredData: {
            ...nd.data.userEnteredData,
            totalSourceFlow: convertedTotalSourceFlow,
            totalDischargeFlow: convertedTotalDischargeFlow
          }
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
  
    // todo update new type
    // Object.keys(flowDiagramData.calculatedData).forEach((key: string) => {
    //   flowDiagramData.calculatedData[key].totalSourceFlow = convertFlowValue(flowDiagramData.calculatedData[key].totalSourceFlow, newUnits);
    //   flowDiagramData.calculatedData[key].totalDischargeFlow = convertFlowValue(flowDiagramData.calculatedData[key].totalDischargeFlow, newUnits);
    // });
  
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

//   const convertFlowValue = (value: number, newUnits: string) => {
//     if (newUnits === 'Metric') {
//       // * return m3 
//       return value * 3785.4118;
//     } else if (newUnits === 'Imperial') {
//       // * return mGal 
//       return value / 3785.4118;
//     }
//   return value;
// }
  
  const isValidNumber = (num: number): boolean => {
    return !isNaN(num) && num !== null && num !== undefined;
  }
  