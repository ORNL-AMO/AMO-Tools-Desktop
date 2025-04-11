import { Node, Edge } from "@xyflow/react";
import { CustomEdgeData, DiagramSettings, NodeFlowData, NodeFlowProperty, ProcessFlowPart } from "../types/diagram";
import { BoilerWater, BoilerWaterResults, CoolingTower, CoolingTowerResults, DiagramWaterSystemFlows, EdgeFlowData, HeatEnergy, KitchenRestroom, KitchenRestroomResults, Landscaping, LandscapingResults, MotorEnergy, ProcessUse, ProcessUseResults, SystemBalanceResults, WaterBalanceResults, WaterProcessComponent, WaterSystemFlowsTotals, WaterSystemTypeEnum, WaterUsingSystem } from "../types/water-components";
import { convertAnnualFlow, convertNullInputValueForObjectConstructor} from "./utils";
import { getWaterFlowTotals } from "./water-components";

// * WASM Module with suite api
declare var Module: any;

export const getWaterBalanceResults = (waterUsingSystems: WaterUsingSystem[]): WaterBalanceResults => {
  let allSystemBalanceResults = [];
  let allSystemsTotalBalance = 0;
  
  waterUsingSystems.forEach(system => {
    let systemBalanceResults: SystemBalanceResults = getSystemBalanceResults(system);
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
    estimatedUnknownLosses: allSystemsTotalBalance,
    allSystemBalanceResults: []
  }

  // todo verify
  // * outgoingWater - seems to be including estimated loss. Is this correct? Or should we only consider discharge outlet flow
  plantBalanceResults.allSystemBalanceResults = allSystemBalanceResults.map(systemResult => {
    plantBalanceResults.incomingWater += systemResult.incomingWater;
    plantBalanceResults.outgoingWater += systemResult.outgoingWater;
    plantBalanceResults.waterBalance += systemResult.waterBalance;
    plantBalanceResults.totalKnownLosses += systemResult.totalKnownLosses;
    plantBalanceResults.percentTotalBalance += systemResult.percentTotalBalance;

    systemResult.percentTotalBalance = getBalancePercent(allSystemsTotalBalance, systemResult.waterBalance);
    return systemResult;
  });

  console.log('Water Balance Results', plantBalanceResults);
  return plantBalanceResults;
}

export const getSystemBalanceResults = (waterSystem: WaterUsingSystem): SystemBalanceResults => {
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
  
  const estimatedUnknownLosses = getSystemEstimatedUnknownLosses(waterSystem, waterSystem.userEnteredData.totalSourceFlow, waterSystem.userEnteredData.totalDischargeFlow);
  systemBalanceResults.incomingWater = waterSystem.systemFlowTotals.sourceWater;
  systemBalanceResults.outgoingWater = waterSystem.systemFlowTotals.waterInProduct 
    + waterSystem.systemFlowTotals.dischargeWater 
    + waterSystem.systemFlowTotals.knownLosses 
    + estimatedUnknownLosses
    + consumptiveIrrigationLoss;
  // todo + total known loss and estimated known losses
  
  systemBalanceResults.totalKnownLosses = waterSystem.systemFlowTotals.knownLosses;
  systemBalanceResults.waterBalance = systemBalanceResults.incomingWater - systemBalanceResults.outgoingWater;
  systemBalanceResults.percentIncomingWater = getBalancePercent(systemBalanceResults.incomingWater, systemBalanceResults.waterBalance);
  console.log('SystemBalanceResults', waterSystem.name, systemBalanceResults);
  return systemBalanceResults;
}

export const getSystemEstimatedUnknownLosses = (
  componentData: WaterUsingSystem, 
  systemTotalSourceFlow: number, 
  systemTotalDischargeFlow: number
): number => {
  systemTotalDischargeFlow = systemTotalDischargeFlow?? 0;
  systemTotalSourceFlow = systemTotalSourceFlow?? 0; 
  const totalKnownLosses = componentData.userEnteredData.totalKnownLosses?? 0;
  const waterInProduct = componentData.userEnteredData.waterInProduct?? 0;
  const allKnownLosses = totalKnownLosses + waterInProduct;
  const unknownLoss: number = systemTotalSourceFlow - systemTotalDischargeFlow; 
  const totalUnknownLoss = unknownLoss - allKnownLosses;
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
      sourceWater: {total: 0, flows: []},
      recirculatedWater: {total: 0, flows: []},
      dischargeWater: {total: 0, flows: []},
      knownLosses: {total: 0, flows: []},
      waterInProduct: {total: 0, flows: []},
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

    componentFlows.sourceWater.total = getTotalFlowValue(componentFlows.sourceWater.flows)?? 0;
    componentFlows.recirculatedWater.total = getTotalFlowValue(componentFlows.recirculatedWater.flows)?? 0;
    componentFlows.dischargeWater.total = getTotalFlowValue(componentFlows.dischargeWater.flows)?? 0;
    const totalKnownLosses = system.userEnteredData.totalKnownLosses?? system.userDiagramFlowOverrides.knownLosses;
    componentFlows.knownLosses.total = totalKnownLosses?? 0;
    // componentFlows.knownLosses.total = system.userEnteredData.totalKnownLosses? system.userEnteredData.totalKnownLosses : getTotalFlowValue(componentFlows.knownLosses.flows);
    componentFlows.waterInProduct.total = system.userEnteredData.waterInProduct?? 0;
    diagramWaterSystemFlows.push(componentFlows);

    // todo override above values if user has entered their own
    // let waterFlows: WaterSystemFlowsTotals = getWaterFlowsFromSource(componentFlows);
    let systemFlowTotals: WaterSystemFlowsTotals = getWaterFlowTotals(componentFlows);
    system.systemFlowTotals = systemFlowTotals;

    return system;
  });
  
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
export const getComponentTypeTotalCost = (components: Node<ProcessFlowPart>[], nodeFlowProperty: NodeFlowProperty) => {
  return components.reduce((total: number, component: Node<ProcessFlowPart>) => {
    let acc = getKGalCost(component.data.cost, component.data.userEnteredData[nodeFlowProperty]?? 0);
    return acc; 
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
    // todo
    const directCosts = intakeCost + dischargeCost;
    
    let energyCosts = motorEnergyCost + heatEnergyCost;
    energyCosts = energyCosts ?? 0;
    const indirectCost = waterTreatmentCost + wasteTreatmentCost;
    const trueCost =  directCosts + indirectCost;
    console.log('dc, id, true cost', directCosts, indirectCost, trueCost); 
  return trueCost;
}

/**
* Get cost for MotorEnergy
* @param motorEnergy MotorEnergy object
* @param energyUnitCost Cost of energy per kWh or MMBTU / GJ
*/
export const getMotorEnergyCost = (motorEnergy: MotorEnergy, energyUnitCost: number): number => {
  // todo verify conversion
  const ratedPowerKW = motorEnergy.ratedPower * 0.7457; // convert HP to kW
  const energyKwPerYear = (motorEnergy.hoursPerYear * motorEnergy.loadFactor) / 100 * (ratedPowerKW * motorEnergy.systemEfficiency) / 100;
  const motorEnergyCost = energyKwPerYear * energyUnitCost;
  return motorEnergyCost;
}


/**
* Get Cost for HeatEnergy
* @param heatEnergy HeatEnergy object
* @param energyUnitCost Cost of energy per kWh or MMBTU / GJ
*/
export const getHeatEnergyCost = (systemHeatEnergy: HeatEnergy, energyUnitCost: number): number => {
  const heatEnergy: HeatEnergy = {
    incomingTemp: systemHeatEnergy.incomingTemp?? 0,
    outgoingTemp: systemHeatEnergy.outgoingTemp?? 0,
    heaterEfficiency: systemHeatEnergy.heaterEfficiency?? 0,
    wasteWaterDischarge: systemHeatEnergy.wasteWaterDischarge?? 0,
    hoursPerYear: systemHeatEnergy.hoursPerYear?? 0,
    heatingFuelType: systemHeatEnergy.heatingFuelType?? 0,
  }
  const energy = heatEnergy.wasteWaterDischarge * (heatEnergy.outgoingTemp - heatEnergy.incomingTemp) * 1 * 8.3454 * heatEnergy.heaterEfficiency / 1000000
  const heatEnergyCost = energy * energyUnitCost;
  return heatEnergyCost;
}