import { Node, Edge } from "@xyflow/react";
import { CustomEdgeData, DiagramCalculatedData, DiagramSettings, NodeFlowProperty, ProcessFlowNodeType, ProcessFlowPart } from "../types/diagram";
import { BoilerWater, BoilerWaterResults, CoolingTower, CoolingTowerResults, DiagramWaterSystemFlows, DischargeOutlet, EdgeFlowData, HeatEnergy, IntakeSource, KitchenRestroom, KitchenRestroomResults, Landscaping, LandscapingResults, MotorEnergy, ProcessUse, ProcessUseResults, SystemBalanceResults, WaterBalanceResults, WaterProcessComponent, WaterSystemFlowsTotals, WaterSystemTypeEnum, WaterTreatment, WaterUsingSystem, WasteWaterTreatment } from "../types/water-components";
import { convertAnnualFlow, convertNullInputValueForObjectConstructor } from "./utils";
import { getEdgeDescription, getWaterFlowTotals } from "./water-components";
import { NodeGraphIndex, createGraphIndex, getAllUpstreamEdgePaths, getAllDownstreamEdgePaths } from "../../graph";
import { BlockCosts, CostComponentMap, CostComponentPathData, PlantResults, PlantSystemSummaryResults, SystemAnnualSummaryResults, SystemAttributionMap, SystemTrueCostContributions, SystemTrueCostData, TrueCostOfSystems, CostComponentAttribution, PathAttribution } from "../types/results";

export const getWaterBalanceResults = (waterUsingSystems: WaterUsingSystem[], calculatedData: DiagramCalculatedData): WaterBalanceResults => {
  let allSystemBalanceResults = [];
  let allSystemsTotalBalance = 0;

  waterUsingSystems.forEach(system => {
    let systemBalanceResults: SystemBalanceResults = getSystemBalanceResults(system, calculatedData);
    allSystemBalanceResults.push(systemBalanceResults);
    allSystemsTotalBalance += systemBalanceResults.waterBalance;
  });

  let plantBalanceResults: WaterBalanceResults = {
    incomingWater: 0,
    outgoingWater: 0,
    waterBalance: 0,
    percentIncomingWater: 0,
    percentTotalBalance: 0,
    totalKnownLosses: 0,
    estimatedUnknownLosses: 0,
    // estimatedUnknownLosses: allSystemsTotalBalance >= 0 ? allSystemsTotalBalance : 0,
    allSystemBalanceResults: []
  }

  plantBalanceResults.allSystemBalanceResults = allSystemBalanceResults.map(systemResult => {
    plantBalanceResults.incomingWater += systemResult.incomingWater;
    plantBalanceResults.outgoingWater += systemResult.outgoingWater;
    plantBalanceResults.waterBalance += systemResult.waterBalance;
    plantBalanceResults.totalKnownLosses += systemResult.totalKnownLosses;
    plantBalanceResults.percentTotalBalance += systemResult.percentTotalBalance;
    plantBalanceResults.estimatedUnknownLosses += systemResult.estimatedUnknownLosses;

    systemResult.percentTotalBalance = getBalancePercent(allSystemsTotalBalance, systemResult.waterBalance);
    return systemResult;
  });

  return plantBalanceResults;
}

export const getSystemBalanceResults = (waterSystem: WaterUsingSystem, calculatedData: DiagramCalculatedData): SystemBalanceResults => {
  let systemBalanceResults: SystemBalanceResults = {
    id: waterSystem.diagramNodeId,
    name: waterSystem.name,
    incomingWater: 0,
    outgoingWater: 0,
    waterBalance: 0,
    totalKnownLosses: 0,
    estimatedUnknownLosses: 0,
    percentIncomingWater: 0,
    percentTotalBalance: 0,
  }
  let consumptiveIrrigationLoss = 0;
  if (waterSystem.systemType = WaterSystemTypeEnum.LANDSCAPING) {
    consumptiveIrrigationLoss = 0;
  }

  // * recycled removed 7423
  // systemBalanceResults.incomingWater = waterSystem.systemFlowTotals.sourceWater + waterSystem.systemFlowTotals.recycledSourceWater;
  // systemBalanceResults.outgoingWater = waterSystem.systemFlowTotals.waterInProduct + waterSystem.systemFlowTotals.dischargeWater + waterSystem.systemFlowTotals.dischargeWaterRecycled + consumptiveIrrigationLoss;

  // * reconcile assessment value waterSystem.systemFlowTotals.sourceWater
  const totalSourceFlow = calculatedData ? getNodeTotalInflow(waterSystem, calculatedData) : waterSystem.userEnteredData.totalSourceFlow ?? 0;
  // * reconcile asessment value waterSystem.systemFlowTotals.dischargeWater
  const totalDischargeFlow = calculatedData ? getNodeTotalOutflow(waterSystem, calculatedData) : waterSystem.userEnteredData.totalDischargeFlow ?? 0;
  const estimatedUnknownLosses = getNodeEstimatedUnknownLosses(waterSystem, totalSourceFlow, totalDischargeFlow);

  systemBalanceResults.incomingWater = totalSourceFlow;
  systemBalanceResults.outgoingWater = waterSystem.systemFlowTotals.waterInProduct
    + totalDischargeFlow
    + waterSystem.systemFlowTotals.knownLosses
    + estimatedUnknownLosses
    + consumptiveIrrigationLoss;

  systemBalanceResults.totalKnownLosses = waterSystem.systemFlowTotals.knownLosses;
  systemBalanceResults.estimatedUnknownLosses = estimatedUnknownLosses;
  systemBalanceResults.waterBalance = systemBalanceResults.incomingWater - systemBalanceResults.outgoingWater;
  systemBalanceResults.percentIncomingWater = getBalancePercent(systemBalanceResults.incomingWater, systemBalanceResults.waterBalance);
  return systemBalanceResults;
}

/**
* Get total inflow for a node. If user entered data is not available, use calculated data.
*/
export const getNodeTotalInflow = (node: Node<ProcessFlowPart> | ProcessFlowPart | WaterProcessComponent, calculatedData: DiagramCalculatedData): number => {
  const nodeData: ProcessFlowPart | WaterProcessComponent = 'data' in node ? node.data as WaterProcessComponent : node;
  let totalInflow = nodeData.userEnteredData?.totalSourceFlow;
  if (totalInflow === undefined || totalInflow === null) {
    totalInflow = calculatedData.nodes[nodeData.diagramNodeId]?.totalSourceFlow;
  }
  return totalInflow ?? 0;
}

/**
* Get total outflow for a node. If user entered data is not available, use calculated data.
*/
export const getNodeTotalOutflow = (node: Node<ProcessFlowPart> | ProcessFlowPart | WaterProcessComponent, calculatedData: DiagramCalculatedData): number => {
  const nodeData: ProcessFlowPart | WaterProcessComponent = 'data' in node ? node.data as WaterProcessComponent : node;
  let totalOutflow = nodeData.userEnteredData?.totalDischargeFlow;
  if (totalOutflow === undefined || totalOutflow === null) {
    totalOutflow = calculatedData.nodes[nodeData.diagramNodeId]?.totalDischargeFlow;
  }
  return totalOutflow ?? 0;
}

export const getNodeEstimatedUnknownLosses = (
  componentData: WaterUsingSystem | WaterTreatment | WasteWaterTreatment,
  systemTotalSourceFlow: number,
  systemTotalDischargeFlow: number
): number => {
  systemTotalDischargeFlow = systemTotalDischargeFlow ?? 0;
  systemTotalSourceFlow = systemTotalSourceFlow ?? 0;
  const totalKnownLosses = componentData.userEnteredData.totalKnownLosses ?? 0;
  const waterInProduct = componentData.userEnteredData.waterInProduct ?? 0;
  const totalUnknownLoss = systemTotalSourceFlow - systemTotalDischargeFlow - totalKnownLosses - waterInProduct;
  return totalUnknownLoss;
}


export const getBalancePercent = (total: number, segment: number) => {
  if (total) {
    let percent = Math.abs((segment / total) * 100);
    return percent;
  }
  return 0;
}


/**
 * TODO - Needs maintenance. The functionality this is meant to support is not fully implemented nor currently being used. Logic may not be correct. 
 * TODO advise starting fresh when we come back to assessment enhancements
 * 
 * related - 7432, 7433
 * Sets the individual water flows for each water using system based on the edges in the diagram and user entered data.
 */
export const setWaterUsingSystemFlows = (waterUsingSystems: WaterUsingSystem[], edges: Edge[]): DiagramWaterSystemFlows[] => {
  let diagramWaterSystemFlows: DiagramWaterSystemFlows[] = []
  waterUsingSystems = waterUsingSystems.map((system: WaterUsingSystem) => {
    let componentFlows: DiagramWaterSystemFlows = {
      id: system.diagramNodeId,
      componentName: system.name,
      sourceWater: { total: 0, flows: [] },
      recirculatedWater: { total: 0, flows: [] },
      dischargeWater: { total: 0, flows: [] },
      knownLosses: { total: 0, flows: [] },
      waterInProduct: { total: 0, flows: [] },
    }

    edges.forEach((edge: Edge<CustomEdgeData>) => {
      let flowData: EdgeFlowData = {
        source: edge.source,
        target: edge.target,
        flowValue: edge.data.flowValue,
        diagramEdgeId: edge.id,
      }

      // * totalKnownLoss field should now be used as source of truth for known losses.
      // * Users may have crated known loss components - these are currently just for visual representation
      // replace assessment known losses empty array with actual data
      // const isKnownLossFlow = edge.source === system.diagramNodeId && getIsKnownLossFlow(edge.target, [])

      if (system.diagramNodeId === edge.target && edge.source === edge.target) {
        componentFlows.recirculatedWater.flows.push(flowData)
      }
      // else if (isKnownLossFlow) {
      //   componentFlows.knownLosses.flows.push(flowData);
      //   componentFlows.waterInProduct.flows.push(flowData);
      // } 
      else if (edge.source === system.diagramNodeId) {
        componentFlows.dischargeWater.flows.push(flowData);
      } else if (edge.target === system.diagramNodeId) {
        componentFlows.sourceWater.flows.push(flowData);
      }
    });


    // componentFlows.sourceWater.total = getTotalFlowValue(componentFlows.sourceWater.flows)?? 0;
    // componentFlows.recirculatedWater.total = getTotalFlowValue(componentFlows.recirculatedWater.flows)?? 0;
    // componentFlows.dischargeWater.total = getTotalFlowValue(componentFlows.dischargeWater.flows)?? 0;

    // * above commented out. below we're populating the diagram water flows from user input totals as that is what assessment to diagram override does
    componentFlows.sourceWater.total = system.userEnteredData.totalSourceFlow ?? 0;
    componentFlows.recirculatedWater.total = getTotalFlowValue(componentFlows.recirculatedWater.flows) ?? 0;
    componentFlows.dischargeWater.total = system.userEnteredData.totalDischargeFlow ?? 0;

    const totalKnownLosses = system.userEnteredData.totalKnownLosses ?? system.userDiagramFlowOverrides?.knownLosses;
    componentFlows.knownLosses.total = totalKnownLosses ?? 0;
    componentFlows.waterInProduct.total = system.userEnteredData.waterInProduct ?? 0;
    diagramWaterSystemFlows.push(componentFlows);

    // todo override above values if user has entered their own
    // let waterFlows: WaterSystemFlowsTotals = getWaterFlowsFromSource(componentFlows);
    let systemFlowTotals: WaterSystemFlowsTotals = getWaterFlowTotals(componentFlows);
    system.systemFlowTotals = systemFlowTotals;

    return system;
  });

  // todo 7481 should userDiagramFlowOverrides also be reset here?

  return diagramWaterSystemFlows;
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

export const getTotalFlowValue = (flows: Array<EdgeFlowData>) => {
  return flows.reduce((total, flow) => total + flow.flowValue, 0);
}

export const sortTrueCostReport = (report: SystemTrueCostData[], order: 'asc' | 'desc' = 'desc'): SystemTrueCostData[] => {
  // * sort by total cost (connectionCostByType[7].cost) in specified order
  return [...report].sort((a, b) => {
    const totalA = a.connectionCostByType?.[7]?.cost ?? 0;
    const totalB = b.connectionCostByType?.[7]?.cost ?? 0;
    return order === 'asc' ? totalA - totalB : totalB - totalA;
  });
}

export const getSystemTrueCostData = (trueCostOfSystems: TrueCostOfSystems, nodeNameMap: Record<string, string>, systemAttributionMap?: SystemAttributionMap): SystemTrueCostData[] => {
  let systemCosts = [];
  Object.entries(trueCostOfSystems).forEach(([key, systemCostContributions]: [key: string, systemCostContributions: SystemTrueCostContributions]) => {
    const systemKey = key as keyof TrueCostOfSystems;
    const adjustedComponentTypes: string[] = getSystemAdjustedComponentTypes(systemAttributionMap, systemKey as string);
    const results: {cost: number, isAdjusted: boolean}[] = Object.entries(systemCostContributions).map(([costType, costValue]: [costType: string, costValue: number]) => {
      let isAdjusted = false;

      // todo SystemTrueCostCotnributions keys refactor to use ProcessFlowNodeType and remove this
      switch (costType) {
        case 'intake':
          isAdjusted = adjustedComponentTypes.includes('water-intake');
          break;
        case 'discharge':
          isAdjusted = adjustedComponentTypes.includes('water-discharge');
          break;
        case 'treatment':
          isAdjusted = adjustedComponentTypes.includes('water-treatment');
          break;
        case 'wasteTreatment':
          isAdjusted = adjustedComponentTypes.includes('waste-water-treatment');
          break;

          // * These are combined costs, we would need more information to know if these are adjusted. 
        // case 'systemPumpAndMotorEnergy':
        //   isAdjusted = adjustedComponentTypes.includes('pump-and-motor-energy');
        //   break;
        // case 'heatEnergyWastewater':
        //   isAdjusted = adjustedComponentTypes.includes('heat-energy-in-wastewater');
        //   break;
      }
      
      return {
        cost: costValue,
        isAdjusted: isAdjusted
      };
    });

    systemCosts.push({
      label: nodeNameMap[systemKey],
      connectionCostByType: results,
      unit: 'currency',
    });
  });
  return systemCosts;
}

const getSystemAdjustedComponentTypes = (systemAttributionMap: SystemAttributionMap, systemKey: string) => {
  let adjustedComponentTypes: string[] = [];
  if (systemAttributionMap && systemAttributionMap[systemKey] && Object.keys(systemAttributionMap[systemKey]).length > 0) {
    Object.keys(systemAttributionMap[systemKey]).forEach((componentId: string) => {
      const attribution: CostComponentAttribution = systemAttributionMap[systemKey][componentId];
      if (attribution.totalAttribution.adjusted !== undefined) {
        adjustedComponentTypes.push(attribution.processComponentType);
      }
    });
  }
  return adjustedComponentTypes;
}


export const calculateBoilerWaterResults = (inputData: BoilerWater, hoursPerYear: number, WaterAssessmentInstance): BoilerWaterResults => {
  const suiteApiInputData = JSON.parse(JSON.stringify(inputData));
  hoursPerYear = convertNullInputValueForObjectConstructor(hoursPerYear);
  suiteApiInputData.power = convertNullInputValueForObjectConstructor(suiteApiInputData.power);
  suiteApiInputData.loadFactor = convertNullInputValueForObjectConstructor(suiteApiInputData.loadFactor);
  suiteApiInputData.loadFactor = suiteApiInputData.loadFactor / 100;
  suiteApiInputData.steamPerPower = convertNullInputValueForObjectConstructor(suiteApiInputData.steamPerPower);
  suiteApiInputData.feedwaterConductivity = convertNullInputValueForObjectConstructor(suiteApiInputData.feedwaterConductivity);
  suiteApiInputData.makeupConductivity = convertNullInputValueForObjectConstructor(suiteApiInputData.makeupConductivity);
  suiteApiInputData.blowdownConductivity = convertNullInputValueForObjectConstructor(suiteApiInputData.blowdownConductivity);
  let output = WaterAssessmentInstance.calculateBoilerWaterLosses(
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

  output.delete();

  return results;
}

export const calculateCoolingTowerResults = (inputData: CoolingTower, hoursPerYear: number, WaterAssessmentInstance): CoolingTowerResults => {
  const suiteApiInputData = JSON.parse(JSON.stringify(inputData));
  hoursPerYear = convertNullInputValueForObjectConstructor(hoursPerYear);
  suiteApiInputData.tonnage = convertNullInputValueForObjectConstructor(suiteApiInputData.tonnage);
  suiteApiInputData.loadFactor = convertNullInputValueForObjectConstructor(suiteApiInputData.loadFactor);
  suiteApiInputData.loadFactor = suiteApiInputData.loadFactor / 100;
  suiteApiInputData.evaporationRateDegree = convertNullInputValueForObjectConstructor(suiteApiInputData.evaporationRateDegree);
  suiteApiInputData.evaporationRateDegree = suiteApiInputData.evaporationRateDegree / 100;
  suiteApiInputData.temperatureDrop = convertNullInputValueForObjectConstructor(suiteApiInputData.temperatureDrop);
  suiteApiInputData.makeupConductivity = convertNullInputValueForObjectConstructor(suiteApiInputData.makeupConductivity);
  suiteApiInputData.blowdownConductivity = convertNullInputValueForObjectConstructor(suiteApiInputData.blowdownConductivity);

  let output = WaterAssessmentInstance.calculateCoolingTowerLoss(
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

  output.delete();

  return results;

}

export const calculateKitchenRestroomResults = (inputData: KitchenRestroom, WaterAssessmentInstance): KitchenRestroomResults => {
  const suiteApiInputData = JSON.parse(JSON.stringify((inputData)));
  suiteApiInputData.employeeCount = convertNullInputValueForObjectConstructor(suiteApiInputData.employeeCount);
  suiteApiInputData.workdaysPerYear = convertNullInputValueForObjectConstructor(suiteApiInputData.workdaysPerYear);
  suiteApiInputData.dailyUsePerEmployee = convertNullInputValueForObjectConstructor(suiteApiInputData.dailyUsePerEmployee);
  let grossWaterUse = WaterAssessmentInstance.calculateKitchenRestroomGrossWaterUse(
    suiteApiInputData.employeeCount,
    suiteApiInputData.workdaysPerYear,
    suiteApiInputData.dailyUsePerEmployee,
  );

  let results: KitchenRestroomResults = {
    grossWaterUse: grossWaterUse
  };


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


export const calculateLandscapingResults = (inputData: Landscaping, WaterAssessmentInstance): LandscapingResults => {
  const suiteApiInputData = JSON.parse(JSON.stringify((inputData)));
  suiteApiInputData.areaIrrigated = convertNullInputValueForObjectConstructor(suiteApiInputData.areaIrrigated);
  suiteApiInputData.yearlyInchesIrrigated = convertNullInputValueForObjectConstructor(suiteApiInputData.yearlyInchesIrrigated);

  let grossWaterUse = WaterAssessmentInstance.calculateLandscapingGrossWaterUse(
    suiteApiInputData.areaIrrigated,
    suiteApiInputData.yearlyInchesIrrigated,
  );

  let results: LandscapingResults = {
    grossWaterUse: grossWaterUse
  }

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

export const convertLandscapingResults = (results: LandscapingResults, unitsOfMeasure: string): LandscapingResults => {
  if (unitsOfMeasure == 'Imperial') {
    // * return in3 to gal 
    results.grossWaterUse = results.grossWaterUse * 0.004329;
  }
  return results;
}


export const getUnknownLossees = (totalSourceFlow: number, totalDischargeFlow: number, knownLosses: number, waterInProduct: number): number => {
  return totalSourceFlow - totalDischargeFlow - knownLosses - waterInProduct;
}

/**
* Get annual cost of all components for a given type
* @param components WaterProcessComponent/ProcessFlowPart 
* @param nodeFlowProperty NodeFlowData property that represents flow cost, i.e. totalDischargeflow for intakes, totalSourceflow for discharges
* 
*/
export const getComponentTypeTotalCost = (components: Node<ProcessFlowPart>[], nodeFlowProperty: NodeFlowProperty, calculatedData: DiagramCalculatedData, unitsOfMeasure: string) => {
  return components.reduce((total: number, component: Node<ProcessFlowPart>) => {
    let totalFlow = 0;
    if (nodeFlowProperty === 'totalSourceFlow') {
      totalFlow = getNodeTotalInflow(component.data, calculatedData)
    } else if (nodeFlowProperty === 'totalDischargeFlow') {
      totalFlow = getNodeTotalOutflow(component, calculatedData)
    }
    const unitCost = component.data.cost ?? 0;
    let cost = getFlowCost(unitCost, totalFlow, unitsOfMeasure);
    return total + cost;
  }, 0);
}

/**
* Get annual total flow of all components for a given type
* @param components WaterProcessComponent/ProcessFlowPart 
* @param nodeFlowProperty NodeFlowData property that represents flow cost, i.e. totalDischargeflow for intakes, totalSourceflow for discharges
* 
*/
export const getComponentTypeTotalFlow = (components: Node<ProcessFlowPart>[], nodeFlowProperty: NodeFlowProperty, calculatedData: DiagramCalculatedData) => {
  return components.reduce((total: number, component: Node<ProcessFlowPart>) => {
    let totalFlow = 0;
    if (nodeFlowProperty === 'totalSourceFlow') {
      totalFlow = getNodeTotalInflow(component.data, calculatedData)
    } else if (nodeFlowProperty === 'totalDischargeFlow') {
      totalFlow = getNodeTotalOutflow(component, calculatedData)
    }
    return total + totalFlow;
  }, 0);
}

/**
* Get annual total cost of flow of all in-system treatment for a component. 
* @param components inSystemTreatment property of WaterUsingSystem 
* @param totalSystemInflow Total of parent system inflow (total source flow). In-system treatment is assumed to treat 100% of this flow through each instance.
* 
*/
export const getInSystemTreatmentCost = (components: WaterTreatment[], totalSystemInflow: number, unitsOfMeasure: string) => {
  return components.reduce((total: number, component: WaterTreatment) => {
    const unitCost = component.cost ?? 0;
    let cost = getFlowCost(unitCost, totalSystemInflow, unitsOfMeasure);
    return total + cost;
  }, 0);
}


/**
* Get annual total cost of flow of all in-system treatment for a component. 
* @param flow in Mgal or m3
* @param unitCost cost per kGal or L
* 
*/
export const getFlowCost = (unitCost: number, flow: number, unitsOfMeasure: string): number => {
  return unitCost * (flow * 1000);
}


/**
* Get annual true cost. Direct costs (intake and discharges) + indirect costs (energy, treatment, etc.)
*/
export const getWaterTrueCost = (
  intakeCost: number,
  dischargeCost: number,
  motorEnergyCost?: number,
  heatEnergyCost?: number,
  waterTreatmentCost?: number,
  wasteTreatmentCost?: number,
): number => {
  let energyCosts = motorEnergyCost + heatEnergyCost;
  energyCosts = energyCosts ?? 0;
  const directCosts = intakeCost + dischargeCost;
  const indirectCost = waterTreatmentCost + wasteTreatmentCost + energyCosts;
  const trueCost = directCosts + indirectCost;
  // console.log('direct costs, indirect costs, true cost', directCosts, indirectCost, trueCost);
  return trueCost;
}

/**
* Get cost for MotorEnergy
* @param motorEnergy MotorEnergy object
* @param energyUnitCost 
*/
export const getMotorEnergyCost = (motorEnergy: MotorEnergy, energyUnitCost: number, unitsOfMeasure: string): number => {
  //  N = Number of pumps, fans or motors.
  // H = Hours of Operation per Year
  // L = Load Factor
  // hp = Horsepowe
  // h = Efficiency
  // E = Pump Energy Use (kWh)

  // E = (0.746 * hp * N * L / h) * H
  let motorEnergyCost = 0;
  if (motorEnergy.systemEfficiency) {
    const ratedPowerKW = unitsOfMeasure === 'Imperial' ? motorEnergy.ratedPower * 0.7457 : motorEnergy.ratedPower;
    motorEnergyCost = energyUnitCost * ((ratedPowerKW * motorEnergy.numberUnits * motorEnergy.loadFactor / motorEnergy.systemEfficiency) * motorEnergy.hoursPerYear);
  }
  return motorEnergyCost;
}

/**
* Get Cost for HeatEnergy
* @param heatEnergy HeatEnergy object
* @param energyUnitCost Cost of energy per kWh or MMBTU / GJ
*/
export const getHeatEnergyCost = (systemHeatEnergy: HeatEnergy, energyUnitCost: number, unitsOfMeasure: string): number => {
  let heatEnergyCost = 0;
  if (systemHeatEnergy.heaterEfficiency) {
    const heatEnergy: HeatEnergy = {
      incomingTemp: systemHeatEnergy.incomingTemp ?? 0,
      outgoingTemp: systemHeatEnergy.outgoingTemp ?? 0,
      heaterEfficiency: systemHeatEnergy.heaterEfficiency ?? 0,
      wasteWaterDischarge: systemHeatEnergy.wasteWaterDischarge ?? 0,
      hoursPerYear: systemHeatEnergy.hoursPerYear ?? 0,
      heatingFuelType: systemHeatEnergy.heatingFuelType ?? 0,
      systemWaterUse: systemHeatEnergy.systemWaterUse ?? 0,
    }
    const densityOfWater = unitsOfMeasure === 'Imperial' ? 8.345385 : 1000;
    const specificHeatWater = unitsOfMeasure === 'Imperial' ? 1.00 : 4.1868 / 1000000; // GJ/kg-°C

    //  V = Quantity of water used by system (Million Gallon ; m^3) (from water balance)
    // r = Density of Water = 8.345385 lb/gal = 8.345385 million lb/ million gal (constant)
    // r = 1000 kg/m3  (metrics units)
    // Cp = Specific Heat of Water = 1.00 Btu/lb-°F = 1.0 MMBtu/million lb-°F (constant)
    // Cp = 4.1868 kJ/kg-°C or 4.1868/1000000 GJ/kg-°C (metrics units)
    // Ti = Average Temperature of Source Water (°F ; °C) (user input)
    // To = Average Temperature of Leaving Wastewater (°F ; °C) (user input)
    // h = Heating Efficiency = 0.78 (default) (user input)
    // Q = Heat Energy in Wastewater (Million Btu ; GJ) (calculated)

    // Q = [V*r*Cp*(To-Ti)]/h

    const energy = (heatEnergy.systemWaterUse * densityOfWater * specificHeatWater * (heatEnergy.outgoingTemp - heatEnergy.incomingTemp)) / (heatEnergy.heaterEfficiency / 100);
    heatEnergyCost = energy * energyUnitCost;
  }
  return heatEnergyCost;
}


/**
 * Sets the block costs for inflow cost components, i.e. water treatment and waste water treatment nodes, discharge outlet nodes.
 * 
 * Block costs represent the total cost center for each non-system node/component. 
 * 
 * Costs are deducted from the block costs and attributed to each system based on flow proportions.
 * 
 * Example value representing Sand Filtration (Waste Water Treatment) block costs 
 * {
 *   "name": "Sand Filtration",
 *   "processComponentType": "waste-water-treatment",
 *   "totalBlockCost": 12000,
 *   "totalFlow": 12,
    * }
 */
const getInflowBlockCosts = (
  node: Node<ProcessFlowPart>,
  calculatedData: DiagramCalculatedData,
  unitsOfMeasure: string
) => {
  const inflow = getNodeTotalInflow(node.data, calculatedData);
  const costPerKGal = node.data.cost ?? 0;
  const costOfInflow = getFlowCost(costPerKGal, inflow, unitsOfMeasure);

  const blockCosts: BlockCosts = {
    name: node.data.name,
    processComponentType: node.data.processComponentType,
    totalBlockCost: costOfInflow,
    totalFlow: inflow,
  };

  return blockCosts;
}


/**
 * Sets the block costs for outflow cost components, i.e. water intake. 
 * 
 */
const getOutflowBlockCosts = (
  node: Node<ProcessFlowPart>,
  calculatedData: DiagramCalculatedData,
  unitsOfMeasure: string
) => {
  const outflow = getNodeTotalOutflow(node, calculatedData);
  const costPerKGal = node.data.cost ?? 0;
  const costOfOutflow = getFlowCost(costPerKGal, outflow, unitsOfMeasure);

  const blockCosts: BlockCosts = {
    name: node.data.name,
    processComponentType: node.data.processComponentType,
    totalBlockCost: costOfOutflow,
    totalFlow: outflow,
  };

  return blockCosts;
}

/**
 * Set default attribution, adjusted is handled in the scope of each apply____Costs method
 */
const setSystemAttribution = (
  systemAttributionMap: SystemAttributionMap,
  edge: Edge<CustomEdgeData>,
  currentSystemId: string,
  systemAttributionFraction: number,
  costComponentId: string,
  processComponentType: ProcessFlowNodeType,
  nameMap: Record<string, string>,
) => {
  if (systemAttributionMap[currentSystemId] === undefined) {
    systemAttributionMap[currentSystemId] = {};
  }

  const pathAttribution: PathAttribution = {
    edgeId: edge.id,
    edgeDescription: getEdgeDescription(
      edge,
      undefined,
      {
        source: nameMap[edge.source],
        target: nameMap[edge.target]
      }),
    attribution: systemAttributionFraction
  };

  if (!systemAttributionMap[currentSystemId][costComponentId]) {
    const newComponentAttribution: CostComponentAttribution = {
      componentId: costComponentId,
      name: nameMap[costComponentId],
      processComponentType: processComponentType,
      totalAttribution: {
        default: systemAttributionFraction,
        adjusted: undefined
      },
      componentPathAttribution: [pathAttribution]
    }
    systemAttributionMap[currentSystemId][costComponentId] = newComponentAttribution;
    return;
  }

  if (!systemAttributionMap[currentSystemId][costComponentId].componentPathAttribution) {
    systemAttributionMap[currentSystemId][costComponentId].componentPathAttribution = [];
  }

  systemAttributionMap[currentSystemId][costComponentId].componentPathAttribution.push(pathAttribution);
  const currentDefaultAttribution = systemAttributionMap[currentSystemId][costComponentId].totalAttribution.default;
  systemAttributionMap[currentSystemId][costComponentId].totalAttribution.default = currentDefaultAttribution + systemAttributionFraction;
}

/**
 * Local branch ratio contributed by a single path edge toward a system's branchFraction.
 * Non-treatment-source edges and zero-outflow treatment nodes pass through as 1.0 (see applySystemIntakeCosts).
 */
const getTreatmentEdgeRatio = (
  pathEdgeId: string,
  graph: NodeGraphIndex,
  calculatedData: DiagramCalculatedData,
): number => {
  const pathEdge = graph.edgeMap[pathEdgeId];
  const pathEdgeSource = graph.nodeMap[pathEdge.source];
  if (pathEdgeSource?.data.processComponentType !== 'water-treatment') {
    return 1;
  }
  const treatmentOutflow = getNodeTotalOutflow(pathEdgeSource as Node<ProcessFlowPart>, calculatedData);
  if (treatmentOutflow <= 0) {
    return 1;
  }
  return (pathEdge.data.flowValue ?? 0) / treatmentOutflow;
}

/**
 * Calculate and set intake costs for each system based on their flow responsibility from each intake.
 *
 * Follow: intake node → downstream through any water treatment units.
 * Stop: at the first water-using systems on each path; do not continue into later users even if they receive recycled water.
 * Attribute: walk every edge in the path from intake to system and take the product of each treatment node's local
 *   branch ratio (that edge's flow divided by the treatment node's total outflow to all its children — 1.0 when the
 *   node has a single child and no losses). Multiplying that product by the intake's own path outflow gives the
 *   system's flow responsibility, correct regardless of how many treatment nodes or forks lie between the intake
 *   and the system:
 *   no-losses-path (formerly Cases A and B) — intake splits to multiple paths, or a single lossless treatment chain:
 *       every treatment-source edge in the path has a single lossless child, so each ratio is 1.0 and the product
 *       reduces to each system absorbing its share of the intake's own path outflow.
 *   with-losses-path (formerly Case C) — single treatment path with losses (at any stage): a lossy treatment node
 *       still contributes a ratio of 1.0 to its sole child, so the loss is absorbed through path inflow rather than
 *       shrinking the system's fraction, and this now also holds when the loss and a fork sit at different nodes.
 *   single-system-ro (formerly Case D) — assign 100% to that system regardless of recovery fraction; reject to
 *       discharge is an unavoidable operational loss, not a second beneficiary.
*/

const applySystemIntakeCosts = (
  trueCostOfSystems: TrueCostOfSystems,
  systemAnnualSummaryResultsMap: Record<string, SystemAnnualSummaryResults>,
  graph: NodeGraphIndex,
  intakeCostData: CostComponentMap,
  systemAttributionMap: SystemAttributionMap,
  settings: DiagramSettings,
  calculatedData: DiagramCalculatedData,
  debuggingNameMap: Record<string, string>,
) => {
  Object.entries(intakeCostData).forEach(([intakeId, intakeData]: [string, CostComponentPathData]) => {
    // * reset defaults that will be aggregated
    Object.values(systemAttributionMap).forEach((attributionMap) => {
      if (attributionMap[intakeId]) {
        attributionMap[intakeId].totalAttribution.default = 0;
        attributionMap[intakeId].componentPathAttribution = [];
      }
    });

    // * skip paths whose component→system edge sequence was already attributed; systems reachable via distinct paths are still visited.
    let pathsAttributed: string[][] = [];
    let adjustedAttributions: SystemAttributionMap = {};

    intakeData.downstreamPathsByEdgeId?.forEach((path: string[], index: number) => {
       // * for this path, eliminate mischarging an upstream system who provides reused water to the current system
      let visitedSystemIds: string[] = [];
      for (const edgeId of path) {
        const currentNode = graph.nodeMap[graph.edgeMap[edgeId].target];
        if (visitedSystemIds.includes(currentNode.id)) {
          break;
        }

        if (currentNode.data.processComponentType === 'water-using-system') {
          let pathToSystem: string[] = [...path].slice(0, path.indexOf(edgeId) + 1);
          const isPathAttributed = pathsAttributed.find((attributedPath: string[]) => {
            return pathToSystem.every((edgeId: string, idx: number) => edgeId === attributedPath[idx]);
          });
          if (isPathAttributed) {
            break;
          }

          // * branchFraction: product of localRatio across the path (see doc comment on applySystemIntakeCosts above).
          const currentEdgeIdx = path.indexOf(edgeId);
          const pathToSystemEdges = path.slice(0, currentEdgeIdx + 1);
          const branchFraction = pathToSystemEdges
            .map(pathEdgeId => getTreatmentEdgeRatio(pathEdgeId, graph, calculatedData))
            .reduce((product, ratio) => product * ratio, 1);

          const intakeEdge = graph.edgeMap[path[0]];
          const systemInflow = graph.edgeMap[edgeId].data.flowValue ?? 0;
          const pathInflow = intakeEdge.data.flowValue ?? 0;
          const ROParentIntakeNode = graph.systemsWithRODirectDischarge[currentNode.id]?.intakeNode;

          const systemFlowResponsibility = pathInflow * branchFraction;
          let systemAttributionFraction = systemFlowResponsibility / intakeData.blockCosts.totalFlow;

          // * single-system-ro: reject stream is an unavoidable operational loss, not a second beneficiary — assign 100%.
          if (ROParentIntakeNode && ROParentIntakeNode.id === intakeId) {
            systemAttributionFraction = 1;
          }

          const costToSystem = systemAttributionFraction * intakeData.blockCosts.totalBlockCost;

          setSystemAttribution(
            systemAttributionMap,
            intakeEdge,
            currentNode.id,
            systemAttributionFraction,
            intakeId,
            'water-intake',
            debuggingNameMap
          );
          const hasAdjustedAttribution = systemAttributionMap[currentNode.id][intakeId].totalAttribution.adjusted !== undefined;

          if (hasAdjustedAttribution) {
            if (adjustedAttributions[currentNode.id] === undefined) {
              adjustedAttributions[currentNode.id] = {};
            }
            adjustedAttributions[currentNode.id][intakeId] = systemAttributionMap[currentNode.id][intakeId];

          } else {
            // * if we have adjusted attribution, costs must be set for total attribution of system to component 
            // * i.e (at a higher level than current scope where we are visiting an edge/path attribution)

           logAttributionAndCosts(
              [],
              debuggingNameMap,
              currentNode,
              path,
              intakeId,
              systemAttributionMap,
              graph,
              systemAttributionFraction,
              costToSystem,
              branchFraction,
              systemFlowResponsibility
            );

            trueCostOfSystems[currentNode.id].intake += costToSystem;
            
            const intakeNode = graph.nodeMap[intakeId];
            const pumpAndMotorEnergyCost = getPumpAndMotorEnergyContribution(intakeNode.data as IntakeSource, settings.electricityCost, settings.unitsOfMeasure);
            const energyCost = pumpAndMotorEnergyCost * systemAttributionFraction;
            trueCostOfSystems[currentNode.id].systemPumpAndMotorEnergy += energyCost;
          }
          
          systemAnnualSummaryResultsMap[currentNode.id].sourceWaterIntake += systemInflow;

          // * the first system in the path is the only one responsible for the cost, no need to visit further downstream systems
          visitedSystemIds.push(currentNode.id);
          pathsAttributed.push(pathToSystem);
          break;
        }
      }
    });

    Object.entries(adjustedAttributions).forEach(([systemId, attributionMap]: [systemId: string, Record<string, CostComponentAttribution>]) => {
      const componentAttribution = attributionMap[intakeId];
      if (componentAttribution?.totalAttribution.adjusted !== undefined) {
        let costToSystem = componentAttribution.totalAttribution.adjusted * intakeData.blockCosts.totalBlockCost;
        trueCostOfSystems[systemId].intake += costToSystem;

        const intakeNode = graph.nodeMap[intakeId];
        const pumpAndMotorEnergyCost = getPumpAndMotorEnergyContribution(intakeNode.data as IntakeSource, settings.electricityCost, settings.unitsOfMeasure);
        const energyCost = pumpAndMotorEnergyCost * componentAttribution.totalAttribution.adjusted;
        trueCostOfSystems[systemId].systemPumpAndMotorEnergy += energyCost;

        logAdjustedAttributionAndCosts(
          [],
          debuggingNameMap,
          systemId,
          intakeId,
          componentAttribution.totalAttribution.adjusted,
          costToSystem
        );
      }
    });

  });
}

/**
 * Calculate and set discharge costs for each system based on their flow responsibility to each discharge component.
 *
 * Follow: discharge node → upstream through any waste water treatment units.
 * Stop: at the first water-using system on each path; do not charge upstream users whose water was reused before discharging.
 * Attribute: attribute discharge cost among those responsible systems by discharge volume. Denominator selection:
 *   proportional-discharge (formerly Case J) — how to attribute: attribute proportionally by each system's flow fraction of the total discharge node inflow.
 *   single-system-ro (formerly Case K) — reject stream is an unavoidable operational loss flowing directly to discharge; assign 100%.
 */
const applySystemDischargeCosts = (
  trueCostOfSystems: TrueCostOfSystems,
  systemAnnualSummaryResultsMap: Record<string, SystemAnnualSummaryResults>,
  graph: NodeGraphIndex,
  dischargeCostData: CostComponentMap,
  systemAttributionMap: SystemAttributionMap,
  settings: DiagramSettings,
  debuggingNameMap: Record<string, string>,
) => {
  Object.entries(dischargeCostData).forEach(([dischargeId, dischargeData]: [string, CostComponentPathData]) => {
    // * reset defaults that will be aggregated
    Object.values(systemAttributionMap).forEach((attributionMap) => {
      if (attributionMap[dischargeId]) {
        attributionMap[dischargeId].totalAttribution.default = 0;
        attributionMap[dischargeId].componentPathAttribution = [];
      }
    });

    // * eliminate duplicate attributing of systems appearing in multiple paths where the path from component --> system is identical
    // * outside of this rule, we still need to visit some systems twice
    let pathsAttributed: string[][] = [];
    let adjustedAttributions: SystemAttributionMap = {};

    dischargeData.upstreamPathsByEdgeId?.forEach((path: string[], index: number) => {
      // * for this path, eliminate mischarging an upstream system who provides reused water to the current system
      let visitedSystemIds: string[] = [];
      for (const edgeId of path) {
        const currentNode = graph.nodeMap[graph.edgeMap[edgeId].source];
        if (visitedSystemIds.includes(currentNode.id)) {
          break;
        }

        if (currentNode.data.processComponentType === 'water-using-system') {
          let pathToSystem: string[] = [...path].slice(0, path.indexOf(edgeId) + 1);
          const isPathAttributed = pathsAttributed.find((attributedPath: string[]) => {
            return pathToSystem.every((edgeId: string, idx: number) => edgeId === attributedPath[idx]);
          });

          if (isPathAttributed) {
            break;
          }

          const dischargeEdge = graph.edgeMap[path[0]];
          const systemDischarge = dischargeEdge?.data.flowValue ?? 0;
          const pathDischarge = graph.edgeMap[edgeId].data.flowValue ?? 0;
          const ROChildDischargeNode = graph.systemsWithRODirectDischarge[currentNode.id]?.dischargeNode;

          // * fractionPathDischargeReceived ternary will ignore cases where systemDischarge > pathDischarge due to flow from other discharges. We will observe other discharges on another iteration
          const fractionPathDischargeReceived = (systemDischarge / pathDischarge) > 1 ? 1 : (systemDischarge / pathDischarge);
          const systemFlowResponsibility = pathDischarge * fractionPathDischargeReceived;
          let systemAttributionFraction = (systemFlowResponsibility / dischargeData.blockCosts.totalFlow);

          // * single-system-ro: reject goes to discharge — assign 100% regardless of recovery fraction.
          if (ROChildDischargeNode && ROChildDischargeNode.id === dischargeId) {
            systemAttributionFraction = 1;
          }


          setSystemAttribution(
            systemAttributionMap,
            dischargeEdge,
            currentNode.id,
            systemAttributionFraction,
            dischargeId,
            'water-discharge',
            debuggingNameMap
          );
          const hasAdjustedAttribution = systemAttributionMap[currentNode.id][dischargeId].totalAttribution.adjusted !== undefined;

          if (hasAdjustedAttribution) {
            if (adjustedAttributions[currentNode.id] === undefined) {
              adjustedAttributions[currentNode.id] = {};
            }
            adjustedAttributions[currentNode.id][dischargeId] = systemAttributionMap[currentNode.id][dischargeId];

          } else {
            // * if we have adjusted attribution, costs must be set for total attribution of system to component 
            // * i.e (at a higher level than current scope where we are visiting an edge/path attribution)

            let costToSystem = systemAttributionFraction * dischargeData.blockCosts.totalBlockCost;

             logAttributionAndCosts(
              [],
              debuggingNameMap,
              currentNode,
              path,
              dischargeId,
              systemAttributionMap,
              graph,
              systemAttributionFraction,
              costToSystem,
              fractionPathDischargeReceived,
              systemFlowResponsibility
            );

            trueCostOfSystems[currentNode.id].discharge += costToSystem;
            systemAnnualSummaryResultsMap[currentNode.id].dischargeWater += systemFlowResponsibility;

            const dischargeNode = graph.nodeMap[dischargeId];
            const pumpAndMotorEnergyCost = getPumpAndMotorEnergyContribution(dischargeNode.data as DischargeOutlet, settings.electricityCost, settings.unitsOfMeasure);
            const energyCost = pumpAndMotorEnergyCost * systemAttributionFraction;
            trueCostOfSystems[currentNode.id].systemPumpAndMotorEnergy += energyCost;
          }

          // * the first system in the path is the only one responsible for the cost, no need to visit further downstream systems
          visitedSystemIds.push(currentNode.id);
          pathsAttributed.push(pathToSystem);
          break;
        }
      }
    });

    Object.entries(adjustedAttributions).forEach(([systemId, attributionMap]: [systemId: string, Record<string, CostComponentAttribution>]) => {
      const componentAttribution = attributionMap[dischargeId];
      if (componentAttribution?.totalAttribution.adjusted !== undefined) {
        let costToSystem = componentAttribution.totalAttribution.adjusted * dischargeData.blockCosts.totalBlockCost;
        trueCostOfSystems[systemId].discharge += costToSystem;

        const dischargeNode = graph.nodeMap[dischargeId];
        const pumpAndMotorEnergyCost = getPumpAndMotorEnergyContribution(dischargeNode.data as DischargeOutlet, settings.electricityCost, settings.unitsOfMeasure);
        const energyCost = pumpAndMotorEnergyCost * componentAttribution.totalAttribution.adjusted;
        trueCostOfSystems[systemId].systemPumpAndMotorEnergy += energyCost;

        logAdjustedAttributionAndCosts(
          [],
          debuggingNameMap,
          systemId,
          dischargeId,
          componentAttribution.totalAttribution.adjusted,
          costToSystem
        );
      }
    });

  });
}

/**
 * Calculate and set treatment costs for each system based on their flow responsibility from each treatment component.
 *
 * Follow: water treatment node → downstream through any additional treatment until the first water-using systems.
 * Stop: at the first users consuming the treated water.
 * Attribute: walk every edge in the path from the treatment node to the system and take the product of each further
 *   treatment-source edge's local branch ratio (getTreatmentEdgeRatio) to get branchFraction. Multiplying branchFraction
 *   by the first edge's flow (what this node sent down that branch) gives the system's flow responsibility; dividing by
 *   the treatment node's total outflow gives the attribution fraction. This one formula replaces the former no-losses
 *   (Case E) / with-losses (Case F) branch split — the two denominators (total inflow vs. total outflow) are identical
 *   whenever the node has no loss, so the split never added distinct behavior.
 *   single-system-ro (formerly Case G) — assign 100% regardless of recovery fraction; reject to discharge is an unavoidable operational loss.
 * Series note: If RO → Chlorination → Process, both RO and Chlorination each create a row, each going 100% to Process.
 *   No duplication occurs because each row is its own cost component.
 */
const applySystemTreatmentCosts = (
  trueCostOfSystems: TrueCostOfSystems,
  graph: NodeGraphIndex,
  treatmentCostData: CostComponentMap,
  systemAttributionMap: SystemAttributionMap,
  calculatedData: DiagramCalculatedData,
  debuggingNameMap: Record<string, string>,
) => {
  Object.entries(treatmentCostData).forEach(([treatmentId, treatmentData]: [string, CostComponentPathData]) => {
    // * reset defaults that will be aggregated
    Object.values(systemAttributionMap).forEach((attributionMap) => {
      if (attributionMap[treatmentId]) {
        attributionMap[treatmentId].totalAttribution.default = 0;
        attributionMap[treatmentId].componentPathAttribution = [];
      }
    });

    // * eliminate duplicate attributing of systems appearing in multiple paths where the path from component --> system is identical
    // * outside of this rule, we still need to visit some systems twice
    let pathsAttributed: string[][] = [];
    let adjustedAttributions: SystemAttributionMap = {};

    treatmentData.downstreamPathsByEdgeId?.forEach((path: string[], index: number) => {
      let visitedSystemIds: string[] = [];
      for (const edgeId of path) {
        const currentNode = graph.nodeMap[graph.edgeMap[edgeId].target];
        if (visitedSystemIds.includes(currentNode.id)) {
          break;
        }

        if (currentNode.data.processComponentType === 'water-using-system') {
          let pathToSystem: string[] = [...path].slice(0, path.indexOf(edgeId) + 1);
          const isPathAttributed = pathsAttributed.find((attributedPath: string[]) => {
            return pathToSystem.every((edgeId: string, idx: number) => edgeId === attributedPath[idx]);
          });

          if (isPathAttributed) {
            break;
          }

          const currentEdge = graph.edgeMap[edgeId];
          const treatmentNode = graph.nodeMap[treatmentId];
          const totalTreatmentOutflow = getNodeTotalOutflow(treatmentNode as Node<ProcessFlowPart>, calculatedData);
          const ROTreatmentNode = graph.systemsWithRODirectDischarge[currentNode.id]?.treatmentNode;

          // * branchFraction: product of localRatio across any further treatment nodes in the path (see doc comment on applySystemTreatmentCosts above).
          const currentEdgeIdx = path.indexOf(edgeId);
          const pathToSystemEdges = path.slice(0, currentEdgeIdx + 1);
          const firstEdgeFlow = graph.edgeMap[path[0]].data.flowValue ?? 0;
          const branchFraction = pathToSystemEdges
            .slice(1)
            .map(pathEdgeId => getTreatmentEdgeRatio(pathEdgeId, graph, calculatedData))
            .reduce((product, ratio) => product * ratio, 1);

          const systemFlowResponsibility = firstEdgeFlow * branchFraction;
          let systemAttributionFraction = totalTreatmentOutflow > 0 ? systemFlowResponsibility / totalTreatmentOutflow : 0;

          // * single-system-ro: assign 100% regardless of recovery fraction.
          if (ROTreatmentNode && ROTreatmentNode.id === treatmentId) {
            systemAttributionFraction = 1;
          }

          const costToSystem = systemAttributionFraction * treatmentData.blockCosts.totalBlockCost;

          setSystemAttribution(
            systemAttributionMap,
            currentEdge,
            currentNode.id,
            systemAttributionFraction,
            treatmentId,
            'water-treatment',
            debuggingNameMap
          );
          const hasAdjustedAttribution = systemAttributionMap[currentNode.id][treatmentId].totalAttribution.adjusted !== undefined;

          if (hasAdjustedAttribution) {
            if (adjustedAttributions[currentNode.id] === undefined) {
              adjustedAttributions[currentNode.id] = {};
            }
            adjustedAttributions[currentNode.id][treatmentId] = systemAttributionMap[currentNode.id][treatmentId];

          } else {
            // * if we have adjusted attribution, costs must be set for total attribution of system to component 
            // * i.e (at a higher level than current scope where we are visiting an edge/path attribution)

            logAttributionAndCosts(
              [],
              debuggingNameMap,
              currentNode,
              path,
              treatmentId,
              systemAttributionMap,
              graph,
              systemAttributionFraction,
              costToSystem,
              branchFraction,
              systemFlowResponsibility
            );

            trueCostOfSystems[currentNode.id].treatment += costToSystem;

          }

          // * the first system in the path is the only one responsible for the cost, no need to visit further downstream systems
          visitedSystemIds.push(currentNode.id);
          pathsAttributed.push(pathToSystem);
          break;
        }
      }
    });

    Object.entries(adjustedAttributions).forEach(([systemId, attributionMap]: [systemId: string, Record<string, CostComponentAttribution>]) => {
      const componentAttribution = attributionMap[treatmentId];
      if (componentAttribution?.totalAttribution.adjusted !== undefined) {
        let costToSystem = componentAttribution.totalAttribution.adjusted * treatmentData.blockCosts.totalBlockCost;
        trueCostOfSystems[systemId].treatment += costToSystem;

        logAdjustedAttributionAndCosts(
          [],
          debuggingNameMap,
          systemId,
          treatmentId,
          componentAttribution.totalAttribution.adjusted,
          costToSystem
        );
      }
    });

  });
}



/**
 * Calculate and set waste water treatment costs for each system based on their flow responsibility from each waste water treatment component.
 *
 * Follow: WWT node in two directions — downstream to identify reuse recipients, upstream to identify source dischargers.
 * Attribute:
 *   reuse-and-discharge-split (formerly Case H) — where to allocate:
 *     Reuse portion (downstream pass): WWT output flows to water-using systems; attribute to those downstream users by volume received.
 *     Discharge portion (upstream pass): remaining WWT output flows to discharge; attribute back to upstream dischargers proportionally,
 *       deducting the downstream-attributed (reuse) portion from the upstream system’s flow responsibility before calculating the discharge fraction.
 *   single-system-ro (formerly Case I) — the system associated with the RO node absorbs 100% of WWT cost.
 * Series note: For chains like Filter → Flotation, handle each unit separately based on that unit’s own outputs.
 */
const applySystemWasteTreatmentCosts = (
  trueCostOfSystems: TrueCostOfSystems,
  graph: NodeGraphIndex,
  wasteTreatmentCostData: CostComponentMap,
  systemAttributionMap: SystemAttributionMap,
  debuggingNameMap: Record<string, string>,
) => {
  // * used to deduct flow responsibility from upstream WWT systems
  let downstreamTreatmentAttributionMap: Record<string, {
    chargedPortion: number,
    systemId: string
  }[]> = {};

  Object.entries(wasteTreatmentCostData).forEach(([treatmentId, treatmentData]: [string, CostComponentPathData]) => {

    // * reset defaults that will be aggregated
    Object.values(systemAttributionMap).forEach((attributionMap) => {
      if (attributionMap[treatmentId]) {
        attributionMap[treatmentId].totalAttribution.default = 0;
        attributionMap[treatmentId].componentPathAttribution = [];
      }
    });

    let visitedSystemIds: string[] = [];
    let adjustedAttributions: SystemAttributionMap = {};

    treatmentData.downstreamPathsByEdgeId?.forEach((path: string[], index: number) => {

      for (const edgeId of path) {
        const currentNode = graph.nodeMap[graph.edgeMap[edgeId].target];
        if (visitedSystemIds.includes(currentNode.id)) {
          break;
        }

        // * reuse-and-discharge-split, reuse portion: attribute WWT cost to downstream water-using systems by volume received.
        if (currentNode.data.processComponentType === 'water-using-system') {
          const treatmentEdge = graph.edgeMap[path[0]];
          const systemInflow = graph.edgeMap[edgeId].data.flowValue ?? 0;
          const pathInflow = treatmentEdge.data.flowValue ?? 0;
          // * fractionPathInflowReceived ternary will ignore cases where systemTreatment > pathIntake due to flow from other intakes. We will observe other intakes on another iteration
          const fractionPathInflowReceived = (systemInflow / pathInflow) > 1 ? 1 : (systemInflow / pathInflow);
          const systemFlowResponsibility = pathInflow * fractionPathInflowReceived;
          let systemAttributionFraction = (systemFlowResponsibility / treatmentData.blockCosts.totalFlow);

          setSystemAttribution(
            systemAttributionMap,
            treatmentEdge,
            currentNode.id,
            systemAttributionFraction,
            treatmentId,
            'waste-water-treatment',
            debuggingNameMap
          );
          const hasAdjustedAttribution = systemAttributionMap[currentNode.id][treatmentId].totalAttribution.adjusted !== undefined;

          if (hasAdjustedAttribution) {
            if (adjustedAttributions[currentNode.id] === undefined) {
              adjustedAttributions[currentNode.id] = {};
            }
            adjustedAttributions[currentNode.id][treatmentId] = systemAttributionMap[currentNode.id][treatmentId];

          } else {
            // * if we have adjusted attribution, costs must be set for total attribution of system to component 
            // * i.e (at a higher level than current scope where we are visiting an edge/path attribution)
            const costToSystem = systemAttributionFraction * treatmentData.blockCosts.totalBlockCost;
            trueCostOfSystems[currentNode.id].wasteTreatment += costToSystem;

            logAttributionAndCosts(
              [],
              debuggingNameMap,
              currentNode,
              path,
              treatmentId,
              systemAttributionMap,
              graph,
              systemAttributionFraction,
              costToSystem,
              fractionPathInflowReceived,
              systemFlowResponsibility
            );

          }

          // * the first system in the path is the only one responsible for the cost, no need to visit further downstream systems
          visitedSystemIds.push(currentNode.id);

          if (downstreamTreatmentAttributionMap[treatmentId] === undefined) {
            downstreamTreatmentAttributionMap[treatmentId] = [];
          }
          downstreamTreatmentAttributionMap[treatmentId].push({
            chargedPortion: systemFlowResponsibility,
            systemId: currentNode.id
          });

          break;
        }
      }
    });

    Object.entries(adjustedAttributions).forEach(([systemId, attributionMap]: [systemId: string, Record<string, CostComponentAttribution>]) => {
      const componentAttribution = attributionMap[treatmentId];
      if (componentAttribution?.totalAttribution.adjusted !== undefined) {
        let costToSystem = componentAttribution.totalAttribution.adjusted * treatmentData.blockCosts.totalBlockCost;
        trueCostOfSystems[systemId].wasteTreatment += costToSystem;

         logAdjustedAttributionAndCosts(
          [],
          debuggingNameMap,
          systemId,
          treatmentId,
          componentAttribution.totalAttribution.adjusted,
          costToSystem
        );
      }
    });

  });

  Object.entries(wasteTreatmentCostData).forEach(([treatmentId, treatmentData]: [string, CostComponentPathData]) => {

    let visitedSystemIds: string[] = downstreamTreatmentAttributionMap[treatmentId]?.map(item => item.systemId) || [];
    let adjustedAttributions: SystemAttributionMap = {};

    treatmentData.upstreamPathsByEdgeId?.forEach((path: string[], index: number) => {

      for (const edgeId of path) {
        let currentNode = graph.nodeMap[graph.edgeMap[edgeId].source];
        if (visitedSystemIds.includes(currentNode.id)) {
          break;
        }

        let attributeROCostsToSystem = false;
        let ROWasteTreatmentOwner: Node;
        Object.entries(graph.systemsWithRODirectDischarge).map(([systemId, { treatmentNode, intakeNode, dischargeNode, wasteTreatmentNode }]) => {
            if (wasteTreatmentNode?.id === treatmentId) {
              attributeROCostsToSystem = true;
              ROWasteTreatmentOwner = graph.nodeMap[systemId];
            }
        });
        
        // * reuse-and-discharge-split, discharge portion: attribute back to upstream water-using systems proportionally; single-system-ro applies when upstream path contains RO.
        if (currentNode.data.processComponentType === 'water-using-system' || attributeROCostsToSystem) {
          const treatmentEdge = graph.edgeMap[path[0]];

          const systemOutflow = treatmentEdge.data.flowValue ?? 0;
          const pathOutflow = graph.edgeMap[edgeId].data.flowValue ?? 0;

          // * fractionPathInflowReceived ternary will ignore cases where sstemOutflow > pathOutflow due to flow from other treatment. We will observe other treatment on another iteration
          const fractionPathInflowReceived = (systemOutflow / pathOutflow) > 1 ? 1 : (systemOutflow / pathOutflow);
          let systemFlowResponsibility = pathOutflow * fractionPathInflowReceived;

          // * reuse-and-discharge-split, chained WWT: deduct the downstream-attributed (reuse) portion from upstream flow responsibility before calculating discharge fraction.
          if (downstreamTreatmentAttributionMap[treatmentId]) {
            // * remove recycled flow portion already attributed to downstream systems
            const totalDownstreamChargedPortion = downstreamTreatmentAttributionMap[treatmentId].reduce((total, item) => total + item.chargedPortion, 0);
            systemFlowResponsibility = systemFlowResponsibility - totalDownstreamChargedPortion;
          }

          let systemAttributionFraction = (systemFlowResponsibility / treatmentData.blockCosts.totalFlow);

          // * single-system-ro: assign 100% of WWT cost to the system associated with the RO node.
          if (attributeROCostsToSystem) {
            systemAttributionFraction = 1;
          }

          currentNode = attributeROCostsToSystem ? ROWasteTreatmentOwner : currentNode;
          setSystemAttribution(
            systemAttributionMap,
            treatmentEdge,
            currentNode.id,
            systemAttributionFraction,
            treatmentId,
            'waste-water-treatment',
            debuggingNameMap
          );
          const hasAdjustedAttribution = systemAttributionMap[currentNode.id][treatmentId].totalAttribution.adjusted !== undefined;

          if (hasAdjustedAttribution) {
            if (adjustedAttributions[currentNode.id] === undefined) {
              adjustedAttributions[currentNode.id] = {};
            }
            adjustedAttributions[currentNode.id][treatmentId] = systemAttributionMap[currentNode.id][treatmentId];

          } else {
            // * if we have adjusted attribution, costs must be set for total attribution of system to component 
            // * i.e (at a higher level than current scope where we are visiting an edge/path attribution)

            const costToSystem = systemAttributionFraction * treatmentData.blockCosts.totalBlockCost;
            trueCostOfSystems[currentNode.id].wasteTreatment += costToSystem;

            logAttributionAndCosts(
              [],
              debuggingNameMap,
              currentNode,
              path,
              treatmentId,
              systemAttributionMap,
              graph,
              systemAttributionFraction,
              costToSystem,
              fractionPathInflowReceived,
              systemFlowResponsibility
            );

          }

          // * ROWasteTreatmentOwner - is a false visit outside of expected pattern for observing systems
          if (!ROWasteTreatmentOwner) {

            // * the first system in the path is the only one responsible for the cost, no need to visit further downstream systems
            visitedSystemIds.push(currentNode.id);
            break;
          }
        }
      }
    });

    Object.entries(adjustedAttributions).forEach(([systemId, attributionMap]: [systemId: string, Record<string, CostComponentAttribution>]) => {
      const componentAttribution = attributionMap[treatmentId];
      if (componentAttribution?.totalAttribution.adjusted !== undefined) {
        let costToSystem = componentAttribution.totalAttribution.adjusted * treatmentData.blockCosts.totalBlockCost;  
        trueCostOfSystems[systemId].wasteTreatment += costToSystem;
      
        logAdjustedAttributionAndCosts(
          [],
          debuggingNameMap,
          systemId,
          treatmentId,
          componentAttribution.totalAttribution.adjusted,
          costToSystem
        );
      }
    });
    
  });
}

/**
 * Identifies RO (Reverse Osmosis, treatmentType === 6) water-treatment nodes that feed exactly
 * one water-using-system and writes them into `graph.systemsWithRODirectDischarge`.
 *
 * A treatment node qualifies when ALL of the following hold:
 *   1. `treatmentType === 6` (Reverse Osmosis).
 *   2. It has **exactly two** direct outflow edges (children in the graph).
 *   3. Among the two downstream subtrees, **both** of the following must hold simultaneously:
 *      - One subtree contains exactly one `water-using-system` whose path ends in a 'water-discharge' node, and contains **no** other `water-using-system`
 *        nodes.
 *      - The other subtree ends in a water-discharge node and does not have any `water-using-system` nodes.
 *   4. Traversing upstream from the treatment node reaches **exactly one** `water-intake` node.
 *
 * **Not supported:** RO outflow to multiple `water-using-system` nodes. If the subtree
 * contains more than one system, the treatment node will not qualify and will be skipped.
 *
 * @param waterTreatmentNodes - All `water-treatment` nodes in the diagram.
 * @param graph - The graph index; `graph.systemsWithRODirectDischarge` is initialised and
 *   populated in-place. Keyed by the system (permeate destination) node ID.
 */
const assignsystemsWithRODirectDischarge = (
  waterTreatmentNodes: Node<ProcessFlowPart>[],
  graph: NodeGraphIndex,
) => {
  graph.systemsWithRODirectDischarge = {};

  for (const treatmentNode of waterTreatmentNodes) {
    const treatmentData = treatmentNode.data as WaterTreatment;
    if (treatmentData.treatmentType !== 6) continue;

    const childIds = graph.childMap[treatmentNode.id] || [];
    if (childIds.length !== 2) continue;

    const childPathResults = childIds.map(childId => {
      const visited = new Set<string>();
      const systemsFound: string[] = [];
      const dischargesFound: string[] = [];
      const wasteTreatmentNodesFound: string[] = [];

      const traverseDown = (nodeId: string) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        const node = graph.nodeMap![nodeId];
        if (!node) return;
        const type = node.data.processComponentType;
        if (type === 'water-discharge') {
          dischargesFound.push(nodeId);
        } else if (type === 'water-using-system') {
          systemsFound.push(nodeId);
        } else if (type === 'waste-water-treatment') {
          wasteTreatmentNodesFound.push(nodeId);
        }
        for (const grandChildId of (graph.childMap[nodeId] || [])) {
          traverseDown(grandChildId);
        }
      };

      traverseDown(childId);
      return { systemsFound, dischargesFound, wasteTreatmentNodesFound };
    });

    const dischargePathResult = childPathResults.find(r => r.dischargesFound.length === 1 && r.systemsFound.length === 0);
    const systemPathResult = childPathResults.find(r => r.systemsFound.length === 1 && r.dischargesFound.length === 1);

    if (!dischargePathResult || !systemPathResult) continue;

    const systemNodeId = systemPathResult.systemsFound[0];

    const visitedUp = new Set<string>();
    const intakesFound: string[] = [];

    const traverseUp = (nodeId: string) => {
      if (visitedUp.has(nodeId)) return;
      visitedUp.add(nodeId);
      const node = graph.nodeMap![nodeId];
      if (!node) return;
      if (node.data.processComponentType === 'water-intake') {
        intakesFound.push(nodeId);
        return;
      }
      for (const parentId of (graph.parentMap[nodeId] || [])) {
        traverseUp(parentId);
      }
    };

    traverseUp(treatmentNode.id);

    if (intakesFound.length !== 1) continue;


    const wasteTreatmentNodeId = dischargePathResult.wasteTreatmentNodesFound[0] ?? systemPathResult.wasteTreatmentNodesFound[0];
    
    graph.systemsWithRODirectDischarge[systemNodeId] = {
      intakeNode: graph.nodeMap![intakesFound[0]] as Node,
      treatmentNode: treatmentNode as Node,
      dischargeNode: graph.nodeMap![dischargePathResult.dischargesFound[0]] as Node,
      wasteTreatmentNode: wasteTreatmentNodeId ? graph.nodeMap![wasteTreatmentNodeId] as Node : undefined,
    };
  }
};



/** Vocabulary
* Reused - Water is considered reused if it flows from one water-using system to another. labels > 'system flow reuse'
* Recycled - Water is considered recycled if it comes from a wastewater treatment system into a water-using system.
* Cost Component - Components that carry costs, e.g. water intake, water treatment, waste-water treatment, discharge outlet which must be attributed to water systems. 
* Block Costs - Total costs associated with a cost component block, e.g. intake costs, treatment costs etc.
* 
* Upstream - direction of water flow towards the system entry point (Intake)
* Downstream - direction of water flow towards the system exit point (Discharge) 
*/



/** Calculate Plant level and system true costs, direct costs, cost per unit and summary results
* This is the main algorithm for calculating true cost and plant summary results. Order is important - calculation is broken into three steps.
* 
*   Step 1 - Set block costs and prepare results mapping
* 
*   Step 2 - Iterate through intakes, discharges, water-treatment, and waste-water-treatment and apply costs
* 
*   Step 3 - Iterate through all systems and:
*   - calculate in-system treatment, and energy costs
*   - calculate system true costs, direct costs, cost per unit
*   - calculate plant level results - aggregate costs from systems
*/
export const getPlantSummaryResults = (
  nodes: Node[],
  calculatedData: DiagramCalculatedData,
  edges: Edge<CustomEdgeData>[],
  electricityCost: number,
  settings: DiagramSettings,
  systemAttributionMap: SystemAttributionMap,
): PlantResults => {
  // console.time('getPlantSummaryResults');
  const graph: NodeGraphIndex = createGraphIndex(nodes, edges as Edge<CustomEdgeData>[]);

  // * STEP 1 - Set block costs and prepare results mapping
  const nodeMap: Record<string, Node<ProcessFlowPart>> = Object.fromEntries(nodes.map((n) => [n.id, n as Node<ProcessFlowPart>]));

  // * debugging name map
  const nodeNameMap: Record<string, string> = {};
  nodes.forEach((flowNode) => {
    const node = nodeMap[flowNode.id];
    if (node) {
      nodeNameMap[node.id] = node.data.name;
    }
  });

  console.log(nodeNameMap);

  const trueCostOfSystems: TrueCostOfSystems = {};
  const systemAnnualSummaryResultsMap: Record<string, SystemAnnualSummaryResults> = {};
  const waterUsingSystems = nodes.map((node: Node<ProcessFlowPart>) => {
    if (node.data.processComponentType === 'water-using-system') {
      trueCostOfSystems[node.id] = {
        intake: 0,
        discharge: 0,
        thirdParty: 0,
        treatment: 0,
        wasteTreatment: 0,
        systemPumpAndMotorEnergy: 0,
        heatEnergyWastewater: 0,
        total: 0
      };

      systemAnnualSummaryResultsMap[node.id] = {
        id: node.id,
        name: node.data.name,
        sourceWaterIntake: 0,
        dischargeWater: 0,
        directCostPerYear: 0,
        directCostPerUnit: 0,
        trueCostPerYear: 0,
        trueCostPerUnit: 0,
        trueOverDirectResult: 0,
      }

      return node;
    } else {
      return undefined;
    }
  }).filter(node => Boolean(node)) as Node<WaterUsingSystem>[];

  let plantSystemSummaryResults: PlantSystemSummaryResults = {
    id: '1',
    name: 'all',
    sourceWaterIntake: 0,
    dischargeWater: 0,
    directCostPerYear: 0,
    directCostPerUnit: 0,
    trueCostPerYear: 0,
    trueCostPerUnit: 0,
    trueOverDirectResult: 0,
    allSystemResults: [],
  }


  // * STEP 2 - Iterate through intakes, discharges, water-treatment, and waste-water-treatment and apply costs
  const costComponentsTotalsMap: Record<string, BlockCosts> = {};
  const intakeNodes: Node[] = nodes.filter((node: Node<ProcessFlowPart>) => node.data.processComponentType === 'water-intake');
  const dischargeNodes: Node[] = nodes.filter((node: Node<ProcessFlowPart>) => node.data.processComponentType === 'water-discharge');
  const waterTreatmentNodes: Node<ProcessFlowPart>[] = nodes.filter((node: Node<ProcessFlowPart>) => node.data.processComponentType === 'water-treatment') as Node<ProcessFlowPart>[];
  const wasteTreatmentNodes: Node<ProcessFlowPart>[] = nodes.filter((node: Node<ProcessFlowPart>) => node.data.processComponentType === 'waste-water-treatment') as Node<ProcessFlowPart>[];

  // * Preprocess treatment nodes that are type RO, have one outflow path that leads to a discharge (so long as a water-using-system is not in the path) and have another outflow path that goes to a single system. There should only be two outflow paths. If we find a treatment node that satisfies these conditions, update the graph systemsWithRODirectDischarge with the connected nodeData
  assignsystemsWithRODirectDischarge(waterTreatmentNodes, graph);

  let intakeCostData: CostComponentMap = {};
  if (intakeNodes?.length > 0) {
    intakeNodes.forEach((node: Node<ProcessFlowPart>) => {
      const blockCosts = getOutflowBlockCosts(node, calculatedData, settings.unitsOfMeasure);
      let downstreamPaths: string[][] = getAllDownstreamEdgePaths(node.id, graph);
      intakeCostData[node.id] = {
        blockCosts: blockCosts,
        downstreamPathsByEdgeId: downstreamPaths,
      }

      costComponentsTotalsMap[node.id] = blockCosts;
    });

    applySystemIntakeCosts(
      trueCostOfSystems,
      systemAnnualSummaryResultsMap,
      graph,
      intakeCostData,
      systemAttributionMap,
      settings,
      calculatedData,
      nodeNameMap
    );
  }

  let dischargeCostData: CostComponentMap = {};
  if (dischargeNodes?.length > 0) {
    dischargeNodes.forEach((node: Node<ProcessFlowPart>) => {
      const blockCosts = getInflowBlockCosts(node, calculatedData, settings.unitsOfMeasure);
      let upstreamPaths: string[][] = getAllUpstreamEdgePaths(node.id, graph);
      dischargeCostData[node.id] = {
        blockCosts: blockCosts,
        upstreamPathsByEdgeId: upstreamPaths,
      }

      costComponentsTotalsMap[node.id] = blockCosts;
    });

    applySystemDischargeCosts(
      trueCostOfSystems,
      systemAnnualSummaryResultsMap,
      graph,
      dischargeCostData,
      systemAttributionMap,
      settings,
      nodeNameMap
    );
  }

  let treatmentCostData: CostComponentMap = {};
  if (waterTreatmentNodes?.length > 0) {
    waterTreatmentNodes.forEach((node: Node<ProcessFlowPart>) => {
      const blockCosts = getInflowBlockCosts(node, calculatedData, settings.unitsOfMeasure);
      let downstreamPaths: string[][] = getAllDownstreamEdgePaths(node.id, graph);
      treatmentCostData[node.id] = {
        blockCosts: blockCosts,
        downstreamPathsByEdgeId: downstreamPaths
      }

      costComponentsTotalsMap[node.id] = blockCosts;
    });

    applySystemTreatmentCosts(
      trueCostOfSystems,
      graph,
      treatmentCostData,
      systemAttributionMap,
      calculatedData,
      nodeNameMap
    );
  }

  let wasteTreatmentCostData: CostComponentMap = {};
  if (wasteTreatmentNodes?.length > 0) {
    wasteTreatmentNodes.forEach((node: Node<ProcessFlowPart>) => {
      const blockCosts = getInflowBlockCosts(node, calculatedData, settings.unitsOfMeasure);
      let downstreamPaths: string[][] = getAllDownstreamEdgePaths(node.id, graph);
      let upstreamPaths: string[][] = getAllUpstreamEdgePaths(node.id, graph);
      wasteTreatmentCostData[node.id] = {
        blockCosts: blockCosts,
        downstreamPathsByEdgeId: downstreamPaths,
        upstreamPathsByEdgeId: upstreamPaths,
      }

      costComponentsTotalsMap[node.id] = blockCosts;
    });

    applySystemWasteTreatmentCosts(
      trueCostOfSystems,
      graph,
      wasteTreatmentCostData,
      systemAttributionMap,
      nodeNameMap
    );
  }


  if (waterUsingSystems.length > 0) {
    // * STEP 3 - Iterate through all systems and:
    // *   - calculate in-system treatment, and energy costs
    // *   - calculate system true costs, direct costs, cost per unit
    // *   - calculate plant level results - aggregate costs from systems
    waterUsingSystems.forEach((currentSystem: Node<ProcessFlowPart>) => {
      let waterUsingSystem = currentSystem.data as WaterUsingSystem;
      if (waterUsingSystem.heatEnergy) {
        const totalInflow = getNodeTotalInflow(currentSystem.data, calculatedData);
        let heatEnergy = JSON.parse(JSON.stringify(waterUsingSystem.heatEnergy));
        heatEnergy.systemWaterUse = totalInflow;
        const unitCost = heatEnergy.heatingFuelType === 0 ? settings.electricityCost : settings.fuelCost;
        trueCostOfSystems[currentSystem.id].heatEnergyWastewater = getHeatEnergyCost(heatEnergy, unitCost, settings.unitsOfMeasure);
      }

      if (waterUsingSystem.inSystemTreatment && waterUsingSystem.inSystemTreatment.length > 0) {
        const totalSystemInflow = getNodeTotalInflow(currentSystem.data, calculatedData);
        const inSystemTreatmentCost = getInSystemTreatmentCost(waterUsingSystem.inSystemTreatment, totalSystemInflow, settings.unitsOfMeasure);
        trueCostOfSystems[currentSystem.id].treatment += inSystemTreatmentCost;
      }
      trueCostOfSystems[currentSystem.id].systemPumpAndMotorEnergy = getPumpAndMotorEnergyContribution(waterUsingSystem, electricityCost, settings.unitsOfMeasure);

      setSystemCostsAndTotals(currentSystem, trueCostOfSystems, systemAnnualSummaryResultsMap);

      plantSystemSummaryResults.sourceWaterIntake += systemAnnualSummaryResultsMap[currentSystem.id].sourceWaterIntake;
      plantSystemSummaryResults.directCostPerYear += systemAnnualSummaryResultsMap[currentSystem.id].directCostPerYear;
      plantSystemSummaryResults.trueCostPerYear += systemAnnualSummaryResultsMap[currentSystem.id].trueCostPerYear;
      plantSystemSummaryResults.allSystemResults.push(systemAnnualSummaryResultsMap[currentSystem.id])

    });

    if (plantSystemSummaryResults.sourceWaterIntake > 0) {
      plantSystemSummaryResults.directCostPerUnit = plantSystemSummaryResults.directCostPerYear / (plantSystemSummaryResults.sourceWaterIntake * 1000);
      plantSystemSummaryResults.trueCostPerUnit = plantSystemSummaryResults.trueCostPerYear / (plantSystemSummaryResults.sourceWaterIntake * 1000);
      plantSystemSummaryResults.trueOverDirectResult = plantSystemSummaryResults.trueCostPerYear / plantSystemSummaryResults.directCostPerYear;
    }

  }

  // console.timeEnd('getPlantSummaryResults');
  console.log('System Attribution:', systemAttributionMap);
  console.log('True Cost of Systems:', trueCostOfSystems);
  console.log('Plant System Summary Results:', plantSystemSummaryResults);
  console.log('Cost Components Totals:', costComponentsTotalsMap);
  return { trueCostOfSystems, plantSystemSummaryResults, costComponentsTotalsMap, systemAttributionMap };
}



const setSystemCostsAndTotals = (
  currentSystem: Node<ProcessFlowPart>,
  trueCostOfSystems: TrueCostOfSystems,
  systemAnnualSummaryResultsMap: Record<string, SystemAnnualSummaryResults>,
) => {
  const systemTrueCost = getWaterTrueCost(
    trueCostOfSystems[currentSystem.id].intake,
    trueCostOfSystems[currentSystem.id].discharge,
    trueCostOfSystems[currentSystem.id].systemPumpAndMotorEnergy,
    trueCostOfSystems[currentSystem.id].heatEnergyWastewater,
    trueCostOfSystems[currentSystem.id].treatment,
    trueCostOfSystems[currentSystem.id].wasteTreatment
  );
  systemAnnualSummaryResultsMap[currentSystem.id].trueCostPerYear = systemTrueCost;

  const directFlowTotal = systemAnnualSummaryResultsMap[currentSystem.id].sourceWaterIntake;
  systemAnnualSummaryResultsMap[currentSystem.id].directCostPerYear = trueCostOfSystems[currentSystem.id].intake + trueCostOfSystems[currentSystem.id].discharge;

  let flowperKUnit = directFlowTotal * 1000;
  let directCostPerKUnit = 0;
  if (flowperKUnit) {
    directCostPerKUnit = systemAnnualSummaryResultsMap[currentSystem.id].directCostPerYear / flowperKUnit;
  }
  systemAnnualSummaryResultsMap[currentSystem.id].directCostPerUnit = directCostPerKUnit;

  flowperKUnit = systemAnnualSummaryResultsMap[currentSystem.id].sourceWaterIntake * 1000;
  let trueCostPerUnit = 0;
  if (flowperKUnit) {
    trueCostPerUnit = systemAnnualSummaryResultsMap[currentSystem.id].trueCostPerYear / flowperKUnit;
  }
  systemAnnualSummaryResultsMap[currentSystem.id].trueCostPerUnit = trueCostPerUnit;

  systemAnnualSummaryResultsMap[currentSystem.id].trueOverDirectResult = 0;
  if (systemTrueCost && systemAnnualSummaryResultsMap[currentSystem.id].directCostPerYear) {
    systemAnnualSummaryResultsMap[currentSystem.id].trueOverDirectResult = systemTrueCost / systemAnnualSummaryResultsMap[currentSystem.id].directCostPerYear;
  }
  trueCostOfSystems[currentSystem.id].total = Object.values(trueCostOfSystems[currentSystem.id]).reduce((total: number, cost: number) => total + cost, 0);
};


const getPumpAndMotorEnergyContribution = (component: IntakeSource | DischargeOutlet | WaterUsingSystem, electricityCost: number, unitsOfMeasure: string): number => {
  let pumpAndMotorEnergy = 0;
  if (component.addedMotorEnergy?.length) {
    pumpAndMotorEnergy = component.addedMotorEnergy.reduce((sum, motor) => sum + getMotorEnergyCost(motor, electricityCost, unitsOfMeasure), 0);
  }
  return pumpAndMotorEnergy;
}

export const getIsImmediateAncestor = (nodeId: string, graph: NodeGraphIndex, systemId: string): boolean => {
  return graph.edgesByNode[nodeId]?.some((edge: Edge<CustomEdgeData>) => {
    return edge.target === systemId;
  });
}

export const getIsImmediateDescendant = (nodeId: string, graph: NodeGraphIndex, systemId: string): boolean => {
  return graph.edgesByNode[nodeId]?.some((edge: Edge<CustomEdgeData>) => {
    return edge.source === systemId;
  });
}


const DEBUG_SYSTEM_ATTRIBUTION = false;


const logAttributionAndCosts = (
  searchSystems: string[],
  debuggingNameMap,
  currentNode,
  path,
  componentId,
  systemAttributionMap,
  graph,
  systemAttributionFraction,
  costToSystem,
  fractionPathFlowReceived,
  systemFlowResponsibility
) => {
  if (DEBUG_SYSTEM_ATTRIBUTION) {
    if (searchSystems.includes(debuggingNameMap[currentNode.id]) || searchSystems.length === 0) {
      const costComponentName = debuggingNameMap[componentId];
      const debuggingPath = path.map((edgeId: string) => {
            const edge = graph.edgeMap[edgeId];
            return getEdgeDescription(
              edge,
              undefined,
              {
                source: debuggingNameMap[edge.source],
                target: debuggingNameMap[edge.target]
              });
          });

      console.log('-------------------------')
      console.log(`=== System: ${debuggingNameMap[currentNode.id]} ===`);
      console.log(`=== ${debuggingNameMap[componentId]} Attribution: ===`);
      console.log('*** Current Path:');
      console.log('-- cost', costToSystem);
      console.log('-- system flow responsibility', systemFlowResponsibility);
      console.log('-- system attribution fraction', systemAttributionFraction);
      console.log('-- fraction of path flow received', fractionPathFlowReceived);
      console.log('-- path (ids)', path);
      console.log('-- path (names)', debuggingPath);
      console.log('-- paths attributed', systemAttributionMap[currentNode.id][componentId].componentPathAttribution);
      console.log(`=== END: ${debuggingNameMap[currentNode.id]} ===`);
      console.log('-------------------------')

    }
  }
}

const logAdjustedAttributionAndCosts = (
  searchSystems: string[],
  debuggingNameMap,
  systemId,
  componentId,
  adjustedAttributionFraction,
  costToSystem
) => {
  if (DEBUG_SYSTEM_ATTRIBUTION) {
    if (searchSystems.includes(debuggingNameMap[systemId]) || searchSystems.length === 0) {
      console.log('-------------------------')
      console.log(`$$$ Adjusted Attribution System: ${debuggingNameMap[systemId]} $$$`);
      console.log(`$$$ ${debuggingNameMap[componentId]} Attribution: $$$`);
      console.log('$$ cost', costToSystem);
      console.log('$$ adjusted attribution fraction', adjustedAttributionFraction);
      console.log(`$$$ END: ${debuggingNameMap[systemId]} $$$`);
      console.log('-------------------------')
    }
  }
}