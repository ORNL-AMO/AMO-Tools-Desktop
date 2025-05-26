import { Node, Edge } from "@xyflow/react";
import { CustomEdgeData, DiagramCalculatedData, DiagramSettings, NodeFlowData, NodeFlowProperty, ProcessFlowNodeType, ProcessFlowPart } from "../types/diagram";
import { BoilerWater, BoilerWaterResults, CoolingTower, CoolingTowerResults, DiagramWaterSystemFlows, DischargeOutlet, EdgeFlowData, HeatEnergy, IntakeSource, KitchenRestroom, KitchenRestroomResults, Landscaping, LandscapingResults, MotorEnergy, ProcessUse, ProcessUseResults, SystemBalanceResults, WasteWaterTreatment, WaterBalanceResults, WaterProcessComponent, WaterSystemFlowsTotals, WaterSystemTypeEnum, WaterTreatment, WaterUsingSystem } from "../types/water-components";
import { convertAnnualFlow, convertNullInputValueForObjectConstructor } from "./utils";
import { getWaterFlowTotals } from "./water-components";
import { getAncestors, getAncestorPathToNode, getDescendants, getDescendantsDFS, NodeGraphIndex, getAncestorTreatmentChain, getDescendantTreatmentChain, getDescendantHasSystem, getDescendantPathToNode, getAllDescendantPathsToNode } from "../../graph";
import { PlantResults, PlantSystemSummaryResults, SystemAnnualSummaryResults } from "../types/results";
import { WaterAssessment } from "../types/assessment";

// * WASM Module with suite api
declare var Module: any;

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
    // todo when was below done
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
  // todo might not be needed ask Kiran
  if (waterSystem.systemType = WaterSystemTypeEnum.LANDSCAPING) {
    // todo 7121 need info on what this is
    consumptiveIrrigationLoss = 0;
  }

  // * recycled removed 7423
  // systemBalanceResults.incomingWater = waterSystem.systemFlowTotals.sourceWater + waterSystem.systemFlowTotals.recycledSourceWater;
  // systemBalanceResults.outgoingWater = waterSystem.systemFlowTotals.waterInProduct + waterSystem.systemFlowTotals.dischargeWater + waterSystem.systemFlowTotals.dischargeWaterRecycled + consumptiveIrrigationLoss;

  // * reconcile assessment value waterSystem.systemFlowTotals.sourceWater
  const totalSourceFlow = calculatedData? getAssessmentNodeTotalInflow(waterSystem, calculatedData): waterSystem.userEnteredData.totalSourceFlow ?? 0;
  // * reconcile asessment value waterSystem.systemFlowTotals.dischargeWater
  const totalDischargeFlow = calculatedData? getAssessmentNodeTotalOutflow(waterSystem, calculatedData): waterSystem.userEnteredData.totalDischargeFlow ?? 0;
  const estimatedUnknownLosses = getSystemEstimatedUnknownLosses(waterSystem, totalSourceFlow, totalDischargeFlow);

    systemBalanceResults.incomingWater = totalSourceFlow;
    systemBalanceResults.outgoingWater = waterSystem.systemFlowTotals.waterInProduct
    + totalDischargeFlow
    + waterSystem.systemFlowTotals.knownLosses
    + estimatedUnknownLosses
    + consumptiveIrrigationLoss;

  // todo estimatedUnknownLosses absorbed by mistake?
  systemBalanceResults.totalKnownLosses = waterSystem.systemFlowTotals.knownLosses;
  systemBalanceResults.waterBalance = systemBalanceResults.incomingWater - systemBalanceResults.outgoingWater;
  systemBalanceResults.percentIncomingWater = getBalancePercent(systemBalanceResults.incomingWater, systemBalanceResults.waterBalance);
  // console.log('SystemBalanceResults', waterSystem.name, systemBalanceResults);
  return systemBalanceResults;
}

// todo duplicated from results, join after beta
const getAssessmentNodeTotalInflow = (node: WaterProcessComponent, calculatedData: DiagramCalculatedData): number => {
  let totalInflow = node.userEnteredData?.totalSourceFlow;
  if (totalInflow === undefined || totalInflow === null) {
      totalInflow = calculatedData.nodes[node.diagramNodeId]?.totalSourceFlow;
  }
  return totalInflow ?? 0;
}
const getAssessmentNodeTotalOutflow = (node: WaterProcessComponent, calculatedData: DiagramCalculatedData): number => {
  let totalOutflow = node.userEnteredData?.totalDischargeFlow;
  if (totalOutflow === undefined || totalOutflow === null) {
    totalOutflow = calculatedData.nodes[node.diagramNodeId]?.totalDischargeFlow;
  }
  return totalOutflow ?? 0;
}

export const getSystemEstimatedUnknownLosses = (
  componentData: WaterUsingSystem,
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

export const calculateKitchenRestroomResults = (inputData: KitchenRestroom): KitchenRestroomResults => {
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
export const getComponentTypeTotalCost = (components: Node<ProcessFlowPart>[], nodeFlowProperty: NodeFlowProperty, calculatedData: DiagramCalculatedData) => {
  return components.reduce((total: number, component: Node<ProcessFlowPart>) => {
    let totalFlow = 0;
    if (nodeFlowProperty === 'totalSourceFlow') {
      totalFlow = getTotalInflow(component, calculatedData)
    } else if (nodeFlowProperty === 'totalDischargeFlow') {
      totalFlow = getTotalOutflow(component, calculatedData)
    }
    const unitCost = component.data.cost ?? 0;
    let cost = getKGalCost(unitCost, totalFlow);
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
      totalFlow = getTotalInflow(component, calculatedData)
    } else if (nodeFlowProperty === 'totalDischargeFlow') {
      totalFlow = getTotalOutflow(component, calculatedData)
    }
    return total + totalFlow;
  }, 0);
}

/**
* Get annual total flow of all in-system treatment for a component. 
* @param components inSystemTreatment property of WaterUsingSystem 
* @param totalSystemInflow Total of parent system inflow (total source flow). In-system treatment is assumed to treat 100% of this flow through each instance.
* 
*/
export const getInSystemTreatmentCost = (components: WaterTreatment[], totalSystemInflow: number) => {
  return components.reduce((total: number, component: WaterTreatment) => {
    const unitCost = component.cost ?? 0;
    let cost = getKGalCost(unitCost, totalSystemInflow);
    return total + cost;
  }, 0);
}


export const getKGalCost = (kGalUnitCost: number, flowMgal: number): number => {
  return kGalUnitCost * (flowMgal * 1000);
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

const setRecycledFlowData = (node: Node<ProcessFlowPart>, graph: NodeGraphIndex, nodeMap: Record<string, Node<ProcessFlowPart>>, recycledSourcesMap: Record<string, RecycledFlowData>) => {
  const incomingEdges = Object.values(graph.edgeMap).filter((e) => e.target === node.id);
  incomingEdges.forEach((edge: Edge<CustomEdgeData>) => {
    const sourceNode = nodeMap[edge.source];
    if (sourceNode.data.processComponentType === 'water-using-system' || sourceNode.data.processComponentType === 'waste-water-treatment') {
      recycledSourcesMap[sourceNode.id] = {
        recycledSourceName: sourceNode.data.name,
        recycledDestinationId: node.id,
        recycledDestinationName: node.data.name,
      };
    } else {
      const ancestors = getAncestors(sourceNode.id, graph);
      ancestors.forEach((ancestorId: string) => {
        const ancestorNode = nodeMap[ancestorId];
        if (ancestorNode.data.processComponentType === 'water-using-system' || ancestorNode.data.processComponentType === 'waste-water-treatment') {
          recycledSourcesMap[ancestorNode.id] = {
            recycledSourceName: ancestorNode.data.name,
            recycledDestinationId: node.id,
            recycledDestinationName: node.data.name,
          };
        }
      });

    }
  });
}

const setBlockCosts = (node: Node<ProcessFlowPart>, calculatedData: DiagramCalculatedData,
  blockCosts: Record<string, BlockCosts>) => {
  const inflow = getTotalInflow(node, calculatedData);
  const costPerKGal = node.data.cost ?? 0;
  const costOfInflow = getKGalCost(costPerKGal, inflow);

  blockCosts[node.id] = {
    name: node.data.name,
    totalBlockCost: costOfInflow,
    totalInflow: inflow,
    unpaidCostRemaining: costOfInflow,
    unpaidInflowRemaining: inflow,
  };
}

const getAncestorTreatmentCosts = (
  treatmentBlockCosts: Record<string, BlockCosts>,
  connectedAncestorCost: ConnectedCost,
  nodeMap: Record<string, Node<ProcessFlowPart>>,
  graph: NodeGraphIndex,
  nodeNameMap: Record<string, string>,
) => {
  const ancestorId = connectedAncestorCost.sourceId;
  const treatmentChainPath = getAncestorTreatmentChain(ancestorId, graph, nodeMap, connectedAncestorCost.componentType);
  const debuggingNames = treatmentChainPath.map(id => nodeNameMap[id]);

  let totalTreatmentCosts = 0;
  for (const chainedAncestorId of treatmentChainPath) {
    const chainAncestorTreatmentComponent = treatmentBlockCosts[chainedAncestorId];
    if (chainAncestorTreatmentComponent) {
      const remainingBlockCostPortion = chainAncestorTreatmentComponent.totalBlockCost * (connectedAncestorCost.flow / chainAncestorTreatmentComponent.totalInflow);
      let chainAncestorTreatmentCost = remainingBlockCostPortion ?? 0;
      treatmentBlockCosts[chainedAncestorId].unpaidCostRemaining -= chainAncestorTreatmentCost;
      treatmentBlockCosts[chainedAncestorId].unpaidInflowRemaining -= connectedAncestorCost.flow;
      totalTreatmentCosts += chainAncestorTreatmentCost;
    }

  }
  return totalTreatmentCosts;
}


// todo handle case where there is WWT chain of two or more and the beginning of the chain recycles to another system
const getDescendantTreatmentCosts = (
  treatmentBlockCosts: Record<string, BlockCosts>,
  connectedDescendantCost: ConnectedCost,
  nodeMap: Record<string, Node<ProcessFlowPart>>,
  graph: NodeGraphIndex,
  nodeNameMap: Record<string, string>,
) => {
  const descendantId = connectedDescendantCost.targetId;
  const treatmentChainPath = getDescendantTreatmentChain(descendantId, graph, nodeMap, connectedDescendantCost.componentType);
  const debuggingNames = treatmentChainPath.map(id => nodeNameMap[id]);

  // * IF the chain has no descendants that are systems we debit cost attribution from the totalBlockCost as usual
  // * IF the chain DOES have systems (recycled flows) we debit cost attribution from the unpaidCostRemaining  
  let endOfChain = treatmentChainPath[treatmentChainPath.length - 1];
  let chainIsRecycled = getDescendantHasSystem(endOfChain, graph, nodeMap);

  let totalTreatmentCosts = 0;
  for (const chainedDescendantId of treatmentChainPath) {
    const chainDescendantTreatmentComponentCosts = treatmentBlockCosts[chainedDescendantId];
    if (chainDescendantTreatmentComponentCosts) {
      let totalBlockCost = chainIsRecycled ? chainDescendantTreatmentComponentCosts.unpaidCostRemaining : chainDescendantTreatmentComponentCosts.totalBlockCost;
      const remainingBlockCostPortion = totalBlockCost * (connectedDescendantCost.flow / chainDescendantTreatmentComponentCosts.totalInflow);
      let chainDescendantTreatmentCost = remainingBlockCostPortion ?? 0;
      treatmentBlockCosts[chainedDescendantId].unpaidCostRemaining -= chainDescendantTreatmentCost;
      treatmentBlockCosts[chainedDescendantId].unpaidInflowRemaining -= connectedDescendantCost.flow;
      totalTreatmentCosts += chainDescendantTreatmentCost;
    }
  }
  return totalTreatmentCosts;
}


// * Fine for beta - refactor to mimick method for discharge proportion
const getIntakeFlowProportionCost = (
  graph: NodeGraphIndex,
  currentSystem: Node<ProcessFlowPart>,
  intakeNodes: Node[],
  ancestorCostsMap: Record<string, ConnectedCost[]>,
  calculatedData: DiagramCalculatedData,
  nodeMap: Record<string, Node<ProcessFlowPart>>,
  systemAnnualSummaryResults: SystemAnnualSummaryResults,
  systemCostContributionsResults: SystemTrueCostContributions,
  electricityCost: number,
  settings: DiagramSettings,
  nodeNameMap: Record<string, string>,
) => {
  let portionIntakeCosts = 0;
  let intakeSources = ancestorCostsMap[currentSystem.id]?.filter(cost => cost.componentType === 'water-intake');

  if (intakeSources && intakeSources.length > 1) {
    // * Handle multiple intakes, split intakes, todo losses

    intakeNodes.forEach((intakeNode: Node<ProcessFlowPart>) => {
      const intakeId = intakeNode.id;
      const connectedAncestorCost = ancestorCostsMap[currentSystem.id]?.find((cost) => cost.sourceId === intakeId);

      if (connectedAncestorCost) {
        const ancestorId = connectedAncestorCost.sourceId;
        const directPathAncestors: string[] = getAncestorPathToNode(currentSystem.id, graph, ancestorId);
        const debuggingNames = directPathAncestors.map(id => nodeNameMap[id]);

        // * act as if every path is a chain with N components in between
        if (directPathAncestors.length > 0) {
          const [system, immediateAncestor] = directPathAncestors;
          const intakeSourceId: string = directPathAncestors[directPathAncestors.length - 1];
          const immediateReceiver: string = directPathAncestors[directPathAncestors.length - 2];
          const intakeToReceiver: Edge<CustomEdgeData> = Object.values(graph.edgeMap).find((e) => e.target === immediateReceiver && e.source === intakeSourceId);
          const immediateAncestorToSystem: Edge<CustomEdgeData> = Object.values(graph.edgeMap).find((e) => e.target === system && e.source === immediateAncestor);
          const immediateFlowValue = immediateAncestorToSystem.data?.flowValue ?? 0;

          let totalFlowResponsiblity = getTotalOutflow(nodeMap[immediateReceiver], calculatedData) ?? 0;
            const isDirectIntakeToFlow = directPathAncestors.length === 2;
            if (isDirectIntakeToFlow) {
              totalFlowResponsiblity = immediateFlowValue;
            }

          systemAnnualSummaryResults.sourceWaterIntake += immediateFlowValue;
          // todo prevent dividing by 0
          const fractionImmediateReceiverTotalInflow = immediateFlowValue / totalFlowResponsiblity;
          const targetFlowReceived = intakeToReceiver.data.flowValue ?? 0;
          const targetPortion = targetFlowReceived * fractionImmediateReceiverTotalInflow;
          const targetPortionFractionOfInitialFlowSent = (targetPortion / connectedAncestorCost.selfTotalFlow);
          const targetPortionCost = targetPortionFractionOfInitialFlowSent * connectedAncestorCost.selfTotalCost;

          portionIntakeCosts += targetPortionCost;

          // * Apply pump energy costs
          const pumpAndMotorEnergyCost = getPumpAndMotorEnergyContribution(intakeNode.data as IntakeSource, electricityCost, settings.unitsOfMeasure);
          const energyCost = pumpAndMotorEnergyCost * targetPortionFractionOfInitialFlowSent;
          systemCostContributionsResults.systemPumpAndMotorEnergy += energyCost;
        }
      }
    });
  } else {
    // * Handle single water intake
    const [connectedAncestorCost] = intakeSources;
    if (connectedAncestorCost) {

      const ancestorId = connectedAncestorCost.sourceId;
      const directPathAncestors = getAncestorPathToNode(currentSystem.id, graph, ancestorId);

      if (directPathAncestors.length > 0) {
        const [system, immediateAncestor] = directPathAncestors;
        const receivingEdges: Edge<CustomEdgeData>[] = Object.values(graph.edgeMap).filter((e) => e.target === system && e.source === immediateAncestor);

        receivingEdges.forEach((edge: Edge<CustomEdgeData>) => {
          const flowValue = edge.data.flowValue ?? 0;
          systemAnnualSummaryResults.sourceWaterIntake += flowValue;

          const fractionAncestorFlowReceived = flowValue / connectedAncestorCost.selfTotalFlow;
          const costAttributed = fractionAncestorFlowReceived * connectedAncestorCost.selfTotalCost;
          portionIntakeCosts += costAttributed;

          // * Apply pump energy costs
          const intakeNode = nodeMap[connectedAncestorCost.sourceId];
          const pumpAndMotorEnergyCost = getPumpAndMotorEnergyContribution(intakeNode.data as IntakeSource, electricityCost, settings.unitsOfMeasure);
          const energyCost = pumpAndMotorEnergyCost * fractionAncestorFlowReceived;
          systemCostContributionsResults.systemPumpAndMotorEnergy += energyCost;
        });
      }
    }
  }

  return portionIntakeCosts;
}


// * mirror this for intake costs refactor
const getDischargeFlowProportionCost = (
  graph: NodeGraphIndex,
  currentSystem: Node<ProcessFlowPart>,
  descendantCostMap: Record<string, ConnectedCost[]>,
  calculatedData: DiagramCalculatedData,
  nodeMap: Record<string, Node<ProcessFlowPart>>,
  systemAnnualSummaryResults: SystemAnnualSummaryResults,
  systemCostContributionsResults: SystemTrueCostContributions,
  electricityCost: number,
  settings: DiagramSettings,
  nodeNameMap: Record<string, string>,
) => {
  let portionDischargeCosts = 0;
  let dischargeOutlets = descendantCostMap[currentSystem.id]?.filter(cost => cost.componentType === 'water-discharge');

  if (dischargeOutlets) {
    // * Handle multiple discharge, split discharge, todo losses
      const distinctDischargeIds = Array.from(new Set(dischargeOutlets.map(d => d.targetId)));
      let allDirectDescendantPaths: Array<string[]> = [];

      distinctDischargeIds.forEach((dischargeId: string) => {
       let allPossiblePaths: Array<string[]> = getAllDescendantPathsToNode(currentSystem.id, graph, dischargeId);
       allDirectDescendantPaths = allDirectDescendantPaths.concat(allPossiblePaths);
      });
      // let allDirectPathDescendantsDebuggingNames: Array<string[]> = allDirectDescendantPaths.map(path => path.map(id => nodeNameMap[id]));
      
      if (allDirectDescendantPaths.length > 0) {
        allDirectDescendantPaths.forEach((directPathDescendants: string[]) => {
          let descendantTypes = directPathDescendants.map((descendantId) => nodeMap[descendantId]?.data.processComponentType);
          descendantTypes.shift();
          const recyclesToSystem = descendantTypes.some((descendantType) => descendantType === 'water-using-system');

          if (!recyclesToSystem) {
            const [systemId, systemImmediateDescendantId] = directPathDescendants;
            const dischargeDestinationId: string = directPathDescendants[directPathDescendants.length - 1];
            const dischargeImmediateAncestor: string = directPathDescendants[directPathDescendants.length - 2];
            const immediateAncestorToDischarge: Edge<CustomEdgeData> = Object.values(graph.edgeMap).find((e) => e.target === dischargeDestinationId && e.source === dischargeImmediateAncestor);
            const systemToImmediateDescendant: Edge<CustomEdgeData> = Object.values(graph.edgeMap).find((e) => e.source === systemId && e.target === systemImmediateDescendantId);
            const immediateFlowValue = systemToImmediateDescendant.data?.flowValue ?? 0;
            // const debugName = `immediateAncestorToDischarge: ${nodeNameMap[dischargeImmediateAncestor]} -> ${nodeNameMap[dischargeDestinationId]}, systemToImmediateDescendant: ${nodeNameMap[system]} -> ${nodeNameMap[systemImmediateDescendantId]}`;
            // const debugName2 = `systemToImmediateDescendant: ${nodeNameMap[systemId]} -> ${nodeNameMap[systemImmediateDescendantId]}`;
            
            let totalFlowResponsiblity = getTotalOutflow(nodeMap[dischargeImmediateAncestor], calculatedData) ?? 0;
            const isDirectFlowToDischarge = directPathDescendants.length === 2;
            if (isDirectFlowToDischarge) {
              totalFlowResponsiblity = immediateFlowValue;
            }

            systemAnnualSummaryResults.dischargeWater += immediateFlowValue;
            // todo prevent dividing by 0
            const fractionImmediateReceiverTotalOutflow = immediateFlowValue / totalFlowResponsiblity;
            const targetFlowReceived = immediateAncestorToDischarge.data.flowValue ?? 0;
            const targetPortion = targetFlowReceived * fractionImmediateReceiverTotalOutflow;
            const totalDischargeFlow = getTotalInflow(nodeMap[dischargeDestinationId], calculatedData) ?? 0;
            const totalDischargeCost = descendantCostMap[systemId].find((cost) => cost.targetId === dischargeDestinationId)?.selfTotalCost ?? 0;

            const targetPortionFractionOfInitialFlowSent = (targetPortion / totalDischargeFlow);
            const targetPortionCost = targetPortionFractionOfInitialFlowSent * totalDischargeCost;
            portionDischargeCosts += targetPortionCost;

            // * Apply pump energy costs
            const dischargeNode = nodeMap[dischargeDestinationId];
            const pumpAndMotorEnergyCost = getPumpAndMotorEnergyContribution(dischargeNode.data as DischargeOutlet, electricityCost, settings.unitsOfMeasure);
            const energyCost = pumpAndMotorEnergyCost * targetPortionFractionOfInitialFlowSent;
            systemCostContributionsResults.systemPumpAndMotorEnergy += energyCost;

          }
        });

      }
  } 

  return portionDischargeCosts;
}



export const getPlantSummaryResults = (
  nodes: Node[],
  calculatedData: DiagramCalculatedData,
  graph: NodeGraphIndex,
  electricityCost: number,
  waterTreatmentNodes: Node<ProcessFlowPart>[],
  wasteTreatmentNodes: Node<ProcessFlowPart>[],
  settings: DiagramSettings,
): PlantResults => {
  const nodeMap: Record<string, Node<ProcessFlowPart>> = Object.fromEntries(nodes.map((n) => [n.id, n as Node<ProcessFlowPart>]));
  const nodeNameMap: Record<string, string> = {};
  const trueCostOfSystems: TrueCostOfSystems = {};
  const recycledSourcesMap: Record<string, RecycledFlowData> = {};

  nodes.forEach((flowNode) => {
    const node = nodeMap[flowNode.id];
    if (node) {
      nodeNameMap[node.id] = node.data.name;
    }
  });
  console.log('nodeNameMap', nodeNameMap);

  const waterUsingSystems = nodes.map((node: Node<ProcessFlowPart>) => {
    if (node.data.processComponentType === 'water-using-system') {
      // * Important: preprocess recycled nodes
      setRecycledFlowData(node, graph, nodeMap, recycledSourcesMap);
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
    allSystemResults: []
  }

  // * Build block costs for cases:
  // * Where WT/WWT costs that are recycled to another system must be applied first so descendant WT/WWT costs can know remaining amount
  let treatmentBlockCosts: Record<string, BlockCosts> = {};
  if (wasteTreatmentNodes && wasteTreatmentNodes.length > 0) {
    wasteTreatmentNodes.forEach((node: Node<ProcessFlowPart>) => {
      setBlockCosts(node, calculatedData, treatmentBlockCosts);
    });
  }
  if (waterTreatmentNodes && waterTreatmentNodes.length > 0) {
    waterTreatmentNodes.forEach((node: Node<ProcessFlowPart>) => {
      setBlockCosts(node, calculatedData, treatmentBlockCosts);
    });
  }

  const systemCostContributionsResultsMap: Record<string, SystemTrueCostContributions> = {};
  const systemAnnualSummaryResultsMap: Record<string, SystemAnnualSummaryResults> = {};
  const ancestorCostsMap: Record<string, ConnectedCost[]> = {};
  const descendantCostsMap: Record<string, ConnectedCost[]> = {};
  const intakeNodes: Node[] = nodes.filter((node: Node<ProcessFlowPart>) => node.data.processComponentType === 'water-intake');

  if (waterUsingSystems.length > 0) {
    // * IMPORTANT: all ancestor costs for WT/WWT specifically should be calculated first so that the system can deduct descendant costs
    waterUsingSystems.forEach((currentSystem: Node<ProcessFlowPart>) => {
      ancestorCostsMap[currentSystem.id] = getComponentAncestorCosts(currentSystem, calculatedData, nodeMap, graph, nodeNameMap);
      descendantCostsMap[currentSystem.id] = getComponentDescendantCosts(currentSystem, calculatedData, nodeMap, graph, nodeNameMap);
      systemCostContributionsResultsMap[currentSystem.id] = {
        intake: 0,
        discharge: 0,
        thirdParty: 0,
        treatment: 0,
        wasteTreatment: 0,
        systemPumpAndMotorEnergy: 0,
        heatEnergyWastewater: 0,
        total: 0
      };
      systemAnnualSummaryResultsMap[currentSystem.id] = {
        id: currentSystem.id,
        name: currentSystem.data.name,
        sourceWaterIntake: 0,
        dischargeWater: 0,
        directCostPerYear: 0,
        directCostPerUnit: 0,
        trueCostPerYear: 0,
        trueCostPerUnit: 0,
        trueOverDirectResult: 0,
      }


      let waterUsingSystem = currentSystem.data as WaterUsingSystem;
      if (waterUsingSystem.heatEnergy) {
        // todo cleanup implementation
        const totalInflow = getTotalInflow(currentSystem, calculatedData);
        let heatEnergy = JSON.parse(JSON.stringify(waterUsingSystem.heatEnergy));
        heatEnergy.systemWaterUse = totalInflow;
        const unitCost = heatEnergy.heatingFuelType === 0 ? settings.electricityCost : settings.fuelCost;
        systemCostContributionsResultsMap[currentSystem.id].heatEnergyWastewater = getHeatEnergyCost(heatEnergy, unitCost, settings.unitsOfMeasure);
      }

      if (waterUsingSystem.inSystemTreatment && waterUsingSystem.inSystemTreatment.length > 0) {
        const totalSystemInflow = getTotalInflow(currentSystem, calculatedData);
        const inSystemTreatmentCost = getInSystemTreatmentCost(waterUsingSystem.inSystemTreatment, totalSystemInflow);
        systemCostContributionsResultsMap[currentSystem.id].treatment = inSystemTreatmentCost;
      }
      systemCostContributionsResultsMap[currentSystem.id].systemPumpAndMotorEnergy = getPumpAndMotorEnergyContribution(waterUsingSystem, electricityCost, settings.unitsOfMeasure);

      let intakeCosts = getIntakeFlowProportionCost(
        graph,
        currentSystem,
        intakeNodes,
        ancestorCostsMap,
        calculatedData,
        nodeMap,
        systemAnnualSummaryResultsMap[currentSystem.id],
        systemCostContributionsResultsMap[currentSystem.id],
        electricityCost,
        settings,
        nodeNameMap
      );
      systemCostContributionsResultsMap[currentSystem.id].intake += intakeCosts;

      let dischargeCosts = getDischargeFlowProportionCost(
        graph,
        currentSystem,
        descendantCostsMap,
        calculatedData,
        nodeMap,
        systemAnnualSummaryResultsMap[currentSystem.id],
        systemCostContributionsResultsMap[currentSystem.id],
        electricityCost,
        settings,
        nodeNameMap
      );
      systemCostContributionsResultsMap[currentSystem.id].discharge += dischargeCosts;


      // * Current system owns costs for water-treatment, and waste-water-treatment (if recycled into their system)
      ancestorCostsMap[currentSystem.id].forEach((connectedAncestorCost: ConnectedCost) => {
        const ancestorId = connectedAncestorCost.sourceId;

        let isImmediateAncestor = false;
        switch (connectedAncestorCost.componentType) {
          case 'water-treatment':
            // * only apply cost while visiting immediate ancestor so we can manage recycled flows
            isImmediateAncestor = getIsImmediateAncestor(ancestorId, graph, currentSystem.id);
            if (isImmediateAncestor && connectedAncestorCost.flow > 0) {
              const totalTreatmentCosts = getAncestorTreatmentCosts(
                treatmentBlockCosts,
                connectedAncestorCost,
                nodeMap,
                graph,
                nodeNameMap
              );
              systemCostContributionsResultsMap[currentSystem.id].treatment += totalTreatmentCosts;
            }

            break;
          case 'waste-water-treatment':
            // * only apply cost while visiting immediate ancestor so we can manage recycled flows
            isImmediateAncestor = getIsImmediateAncestor(ancestorId, graph, currentSystem.id);
            if (isImmediateAncestor && connectedAncestorCost.flow > 0) {
              const totalWWTCosts = getAncestorTreatmentCosts(
                treatmentBlockCosts,
                connectedAncestorCost,
                nodeMap,
                graph,
                nodeNameMap
              );
              systemCostContributionsResultsMap[currentSystem.id].wasteTreatment += totalWWTCosts;
            }
            break;
        }
      });
    });


    waterUsingSystems.forEach((currentSystem: Node<ProcessFlowPart>) => {
      // * Current system owns costs for water-treatment waste-water-treatment (if not recycled to another system)
      descendantCostsMap[currentSystem.id].forEach((connectedDescendantCost: ConnectedCost) => {
        const descendantId = connectedDescendantCost.targetId;

        let isImmediateDescendant = false;
        switch (connectedDescendantCost.componentType) {
          case 'water-treatment':
            // * only apply cost at immediate descendant so we can manage recycled flows
            isImmediateDescendant = getIsImmediateDescendant(descendantId, graph, currentSystem.id);
            if (isImmediateDescendant && connectedDescendantCost.flow > 0) {
              const totalTreatmentCosts = getDescendantTreatmentCosts(
                treatmentBlockCosts,
                connectedDescendantCost,
                nodeMap,
                graph,
                nodeNameMap
              );
              systemCostContributionsResultsMap[currentSystem.id].treatment += totalTreatmentCosts;
            }
            break;
          case 'waste-water-treatment':
            // * only apply cost at immediate descendant so we can manage recycled flows
            isImmediateDescendant = getIsImmediateDescendant(descendantId, graph, currentSystem.id);
            if (isImmediateDescendant && connectedDescendantCost.flow > 0) {
              const totalWWTCosts = getDescendantTreatmentCosts(
                treatmentBlockCosts,
                connectedDescendantCost,
                nodeMap,
                graph,
                nodeNameMap
              );
              systemCostContributionsResultsMap[currentSystem.id].wasteTreatment += totalWWTCosts;
            }
            break;
        }
      });

      const trueCost = getWaterTrueCost(
        systemCostContributionsResultsMap[currentSystem.id].intake,
        systemCostContributionsResultsMap[currentSystem.id].discharge,
        systemCostContributionsResultsMap[currentSystem.id].systemPumpAndMotorEnergy,
        systemCostContributionsResultsMap[currentSystem.id].heatEnergyWastewater,
        systemCostContributionsResultsMap[currentSystem.id].treatment,
        systemCostContributionsResultsMap[currentSystem.id].wasteTreatment
      );

      const totalFlows = systemCostContributionsResultsMap[currentSystem.id].intake
        + systemCostContributionsResultsMap[currentSystem.id].discharge
        + systemCostContributionsResultsMap[currentSystem.id].systemPumpAndMotorEnergy
        + systemCostContributionsResultsMap[currentSystem.id].heatEnergyWastewater
        + systemCostContributionsResultsMap[currentSystem.id].treatment
        + systemCostContributionsResultsMap[currentSystem.id].wasteTreatment;

      const directFlowTotal = systemAnnualSummaryResultsMap[currentSystem.id].sourceWaterIntake + systemAnnualSummaryResultsMap[currentSystem.id].dischargeWater;
      systemAnnualSummaryResultsMap[currentSystem.id].directCostPerYear = systemCostContributionsResultsMap[currentSystem.id].intake + systemCostContributionsResultsMap[currentSystem.id].discharge;

      let flowperKUnit = (directFlowTotal / 1000);
      systemAnnualSummaryResultsMap[currentSystem.id].directCostPerUnit = systemAnnualSummaryResultsMap[currentSystem.id].directCostPerYear / flowperKUnit;
      systemAnnualSummaryResultsMap[currentSystem.id].trueCostPerYear = trueCost;

      flowperKUnit = (totalFlows / 1000);
      systemAnnualSummaryResultsMap[currentSystem.id].trueCostPerUnit = systemAnnualSummaryResultsMap[currentSystem.id].trueCostPerYear / flowperKUnit;
      systemAnnualSummaryResultsMap[currentSystem.id].trueOverDirectResult = trueCost / systemAnnualSummaryResultsMap[currentSystem.id].directCostPerYear;


      plantSystemSummaryResults.sourceWaterIntake += systemAnnualSummaryResultsMap[currentSystem.id].sourceWaterIntake;
      plantSystemSummaryResults.directCostPerYear += systemAnnualSummaryResultsMap[currentSystem.id].directCostPerYear;
      plantSystemSummaryResults.directCostPerUnit += systemAnnualSummaryResultsMap[currentSystem.id].directCostPerUnit
      plantSystemSummaryResults.trueCostPerYear += systemAnnualSummaryResultsMap[currentSystem.id].trueCostPerYear;
      plantSystemSummaryResults.trueCostPerUnit += systemAnnualSummaryResultsMap[currentSystem.id].trueCostPerUnit;
      plantSystemSummaryResults.trueOverDirectResult += systemAnnualSummaryResultsMap[currentSystem.id].trueOverDirectResult;

      plantSystemSummaryResults.allSystemResults.push(systemAnnualSummaryResultsMap[currentSystem.id])


      systemCostContributionsResultsMap[currentSystem.id].total = Object.values(systemCostContributionsResultsMap[currentSystem.id]).reduce((total: number, cost: number) => total + cost, 0);
      trueCostOfSystems[currentSystem.id] = systemCostContributionsResultsMap[currentSystem.id];
    });
  }

  return { trueCostOfSystems, plantSystemSummaryResults };
}


const getPumpAndMotorEnergyContribution = (component: IntakeSource | DischargeOutlet | WaterUsingSystem, electricityCost: number, unitsOfMeasure: string): number => {
  let pumpAndMotorEnergy = 0;
  if (component.addedMotorEnergy?.length) {
    pumpAndMotorEnergy = component.addedMotorEnergy.reduce(
      (sum, motor) => sum + getMotorEnergyCost(motor, electricityCost, unitsOfMeasure)
      , 0);
  }
  return pumpAndMotorEnergy;
}


/**
* Get total inflow for a node. If user entered data is not available, use calculated data.
*/
export const getTotalInflow = (node: Node<ProcessFlowPart>, calculatedData: DiagramCalculatedData): number => {
  let totalInflow = node.data.userEnteredData?.totalSourceFlow;
  if (totalInflow === undefined || totalInflow === null) {
      totalInflow = calculatedData.nodes[node.id]?.totalSourceFlow;
  }
  return totalInflow ?? 0;
}

/**
* Get total outflow for a node. If user entered data is not available, use calculated data.
*/
export const getTotalOutflow = (node: Node<ProcessFlowPart>, calculatedData: DiagramCalculatedData): number => {
  let totalOutflow = node.data.userEnteredData?.totalDischargeFlow;
  if (totalOutflow === undefined || totalOutflow === null) {
    totalOutflow = calculatedData.nodes[node.id]?.totalDischargeFlow;
  }
  return totalOutflow ?? 0;
}


export const getComponentAncestorCosts = (
  targetNode: Node<ProcessFlowPart>,
  calculatedData: DiagramCalculatedData,
  nodeMap: Record<string, Node<ProcessFlowPart>>,
  graph: NodeGraphIndex,
  nodeNameMap: Record<string, string>
): Array<ConnectedCost> => {
  let systemConnectedCosts: ConnectedCost[] = [];
  const targetNodeTotalInflow = getTotalInflow(targetNode, calculatedData);

  const ancestors: {
    nodeId: string;
    componentType: ProcessFlowNodeType;
    flowValue: number;
    targetNodeTotalInflow: number;
  }[] = [];

  const incomingEdges = Object.values(graph.edgeMap).filter((e) => e.target === targetNode.id);
  incomingEdges.forEach((edge: Edge<CustomEdgeData>) => {
    const sourceNode = nodeMap[edge.source];
    ancestors.push({
      nodeId: edge.source,
      componentType: sourceNode.data.processComponentType,
      flowValue: edge.data.flowValue ?? 0,
      targetNodeTotalInflow: targetNodeTotalInflow,
    });
  });
  const visited = new Set<string>();
  while (ancestors.length > 0) {
    const { nodeId, flowValue, targetNodeTotalInflow } = ancestors.shift()!;
    const node = nodeMap[nodeId];
    const costPerKGal = node.data.cost ?? 0;

    const selfTotalFlow = getTotalOutflow(node, calculatedData);
    // * starting outflow to target node (does not factor losses on the way)
    const outFlow = flowValue;
    // * AKA block costs 
    const selfTotalCost = getKGalCost(costPerKGal, selfTotalFlow);
    // * fraction of flow leaving component (does not account for losses)
    const fractionSelfTotalFlowToTarget = (outFlow / (selfTotalFlow || 1));
    // * cost of total outflow leaving the component NOT outflow received by target node
    const costOfOutflow = getKGalCost(costPerKGal, outFlow);
    // // * cost of flow received at destination (accounts for unknown losses)
    // const targetCost = selfTotalCost * fractionSelfTotalFlowToTarget;

    systemConnectedCosts.push({
      name: node.data.name,
      componentType: node.data.processComponentType,
      selfTotalCost: selfTotalCost,
      selfTotalFlow: selfTotalFlow,
      cost: costOfOutflow,
      flow: outFlow,
      fractionSelfTotalFlowToTarget: fractionSelfTotalFlowToTarget,
      sourceId: node.id,
      targetId: targetNode.id,
      sourceName: nodeNameMap[node.id],
      targetName: nodeNameMap[targetNode.id],
    });

    // * Don't observe costs of recycled system flows,
    // * but still need to observe costs for recycled waste-water-treatment flows. In some cases multiple WWT are chained together.
    const ignoreRecycledSystemFlow = node.data.processComponentType === 'water-using-system';
    if (visited.has(nodeId) || ignoreRecycledSystemFlow) {
      continue;
    } else {
      visited.add(nodeId);
    }

    const inflow = getTotalInflow(node, calculatedData);
    // * add ancestors of current ancestor to visit
    const ancestorEdges = Object.values(graph.edgeMap).filter((e) => e.target === nodeId);
    ancestorEdges.forEach((ancestorEdge: Edge<CustomEdgeData>) => {
      const sourceNode = nodeMap[ancestorEdge.source];
      ancestors.push({
        nodeId: ancestorEdge.source,
        componentType: sourceNode.data.processComponentType,
        flowValue: ancestorEdge.data.flowValue ?? 0,
        targetNodeTotalInflow: inflow,
      });
    });
  }

  return systemConnectedCosts;
};


/**
* Get costs for component target descendants. 
* Handles Water Using System flows being recycled into other systems. These flows are ignored as the current system does not pay for end of line discharge 
* Handles Waste Water Treatment flows being recycled into other systems. This has been already attributed during ancestor calculation
*/
export const getComponentDescendantCosts = (
  sourceNode: Node<ProcessFlowPart>,
  calculatedData: DiagramCalculatedData,
  nodeMap: Record<string, Node<ProcessFlowPart>>,
  graph: NodeGraphIndex,
  nodeNameMap: Record<string, string>
): Array<ConnectedCost> => {
  let systemConnectedCosts: ConnectedCost[] = [];
  const sourceNodeTotalOutflow = getTotalOutflow(sourceNode, calculatedData);

  const descendants: {
    nodeId: string;
    sourceId?: string;
    componentType: ProcessFlowNodeType;
    flowValue: number;
    sourceTotalOutflow: number;
  }[] = [];

  const outgoingEdges = Object.values(graph.edgeMap).filter((e) => e.source === sourceNode.id);
  outgoingEdges.forEach((edge: Edge<CustomEdgeData>) => {
    const targetNode = nodeMap[edge.target];
    if (targetNode.data.processComponentType !== 'water-using-system') {
      descendants.push({
        nodeId: edge.target,
        sourceId: edge.source,
        componentType: targetNode.data.processComponentType,
        flowValue: edge.data.flowValue ?? 0,
        sourceTotalOutflow: sourceNodeTotalOutflow,
      });
    }
  });

  const visited = new Set<string>();

  while (descendants.length > 0) {
    const { nodeId, sourceId, flowValue, sourceTotalOutflow } = descendants.shift()!;
    const node = nodeMap[nodeId];
    const costPerKGal = node.data.cost ?? 0;

    const selfTotalFlow = getTotalInflow(node, calculatedData);
    // * starting inflow to target node (does not factor losses on the way)
    const inflow = flowValue;
    // * fraction of flow leaving component (does not account for losses)
    const fractionSelfTotalFlowToTarget = (inflow / (selfTotalFlow || 1));
    // * AKA block costs 
    const selfTotalCost = getKGalCost(costPerKGal, selfTotalFlow);
    // * cost of total flow leaving the component NOT flow received by target node
    const costOfInflow = getKGalCost(costPerKGal, inflow);


    // * note sourceId used here is edge source not system source
    systemConnectedCosts.push({
      name: node.data.name,
      componentType: node.data.processComponentType,
      selfTotalCost: selfTotalCost,
      selfTotalFlow: selfTotalFlow,
      cost: costOfInflow,
      flow: flowValue,
      fractionSelfTotalFlowToTarget: fractionSelfTotalFlowToTarget,
      sourceId: sourceId,
      targetId: node.id,
      sourceName: nodeNameMap[sourceId],
      targetName: nodeNameMap[node.id],
    });

    if (visited.has(nodeId)) {
      continue;
    } else {
      visited.add(nodeId);
    }

    const outflow = getTotalOutflow(node, calculatedData);
    // * add descendants of current descendant to visit
    const descendantEdges = Object.values(graph.edgeMap).filter((e) => e.source === nodeId);
    descendantEdges.forEach((descendantEdge: Edge<CustomEdgeData>) => {
      const targetNode = nodeMap[descendantEdge.target];
      descendants.push({
        nodeId: descendantEdge.target,
        sourceId: descendantEdge.source,
        componentType: targetNode.data.processComponentType,
        flowValue: descendantEdge.data.flowValue ?? 0,
        sourceTotalOutflow: outflow,
      });
    });
  }

  return systemConnectedCosts;
};

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

export interface ComponentEdgeFlowConnectionCosts {
  [connectionKey: string]: ConnectedCost;
}

export interface ConnectedCost {
  name: string,
  componentType: ProcessFlowNodeType,
  selfTotalCost: number,
  selfTotalFlow: number,
  cost: number,
  flow: number,
  destinationCost?: number,
  fractionSelfTotalFlowToTarget?: number,
  sourceId: string,
  targetId: string,
  sourceName: string,
  targetName: string,
}

export interface TrueCostOfSystems {
  [connectedId: string]: SystemTrueCostContributions
}

// each property = total cost vs. flow proportion for all connected to system
export interface SystemTrueCostContributions {
  intake: number,
  discharge: number,
  thirdParty: number
  treatment: number,
  wasteTreatment: number,
  systemPumpAndMotorEnergy: number,
  heatEnergyWastewater: number,
  total: number
}

export interface RecycledFlowData {
  recycledSourceName: string;
  recycledDestinationId: string;
  recycledDestinationName: string;
}

export interface BlockCosts { name: string, totalBlockCost: number, totalInflow: number, unpaidInflowRemaining: number, unpaidCostRemaining: number }