import { Node, Edge } from "@xyflow/react";
import { CustomEdgeData, DiagramCalculatedData, DiagramSettings, NodeFlowData, NodeFlowProperty, ProcessFlowNodeType, ProcessFlowPart } from "../types/diagram";
import { BoilerWater, BoilerWaterResults, CoolingTower, CoolingTowerResults, DiagramWaterSystemFlows, DischargeOutlet, EdgeFlowData, HeatEnergy, IntakeSource, KitchenRestroom, KitchenRestroomResults, Landscaping, LandscapingResults, MotorEnergy, ProcessUse, ProcessUseResults, SystemBalanceResults, WasteWaterTreatment, WaterBalanceResults, WaterProcessComponent, WaterSystemFlowsTotals, WaterSystemTypeEnum, WaterUsingSystem } from "../types/water-components";
import { convertAnnualFlow, convertNullInputValueForObjectConstructor } from "./utils";
import { getWaterFlowTotals } from "./water-components";
import { getAncestors, getAncestorsDFS, getDescendants, getDescendantsDFS, NodeGraphIndex } from "../../graph";
import { PlantResults, PlantSystemSummaryResults, SystemAnnualSummaryResults } from "../types/results";

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
    estimatedUnknownLosses: allSystemsTotalBalance >= 0 ? allSystemsTotalBalance : 0,
    allSystemBalanceResults: []
  }

  plantBalanceResults.allSystemBalanceResults = allSystemBalanceResults.map(systemResult => {
    plantBalanceResults.incomingWater += systemResult.incomingWater;
    plantBalanceResults.outgoingWater += systemResult.outgoingWater;
    plantBalanceResults.waterBalance += systemResult.waterBalance;
    plantBalanceResults.totalKnownLosses += systemResult.totalKnownLosses;
    plantBalanceResults.percentTotalBalance += systemResult.percentTotalBalance;

    systemResult.percentTotalBalance = getBalancePercent(allSystemsTotalBalance, systemResult.waterBalance);
    return systemResult;
  });

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

  systemBalanceResults.totalKnownLosses = waterSystem.systemFlowTotals.knownLosses;
  systemBalanceResults.waterBalance = systemBalanceResults.incomingWater - systemBalanceResults.outgoingWater;
  systemBalanceResults.percentIncomingWater = getBalancePercent(systemBalanceResults.incomingWater, systemBalanceResults.waterBalance);
  // console.log('SystemBalanceResults', waterSystem.name, systemBalanceResults);
  return systemBalanceResults;
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
    componentFlows.sourceWater.total = system.userEnteredData.totalSourceFlow?? 0;
    componentFlows.recirculatedWater.total = getTotalFlowValue(componentFlows.recirculatedWater.flows)?? 0;
    componentFlows.dischargeWater.total = system.userEnteredData.totalDischargeFlow?? 0;

    const totalKnownLosses = system.userEnteredData.totalKnownLosses?? system.userDiagramFlowOverrides?.knownLosses;
    componentFlows.knownLosses.total = totalKnownLosses?? 0;
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
export const getComponentTypeTotalCost = (components: Node<ProcessFlowPart>[], nodeFlowProperty: NodeFlowProperty) => {
  return components.reduce((total: number, component: Node<ProcessFlowPart>) => {
    const flowMgal = component.data.userEnteredData[nodeFlowProperty] ?? 0;
    const unitCost = component.data.cost ?? 0;
    let cost = getKGalCost(unitCost, flowMgal);
    return total + cost;
  }, 0);
}

/**
* Get annual total flow of all components for a given type
* @param components WaterProcessComponent/ProcessFlowPart 
* @param nodeFlowProperty NodeFlowData property that represents flow cost, i.e. totalDischargeflow for intakes, totalSourceflow for discharges
* 
*/
export const getComponentTypeTotalFlow = (components: Node<ProcessFlowPart>[], nodeFlowProperty: NodeFlowProperty) => {
  return components.reduce((total: number, component: Node<ProcessFlowPart>) => {
    const flow = component.data.userEnteredData[nodeFlowProperty] ?? 0;
    return total + flow;
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
* @param energyUnitCost Cost of energy per kWh or MMBTU / GJ
*/
export const getMotorEnergyCost = (motorEnergy: MotorEnergy, energyUnitCost: number): number => {
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
    incomingTemp: systemHeatEnergy.incomingTemp ?? 0,
    outgoingTemp: systemHeatEnergy.outgoingTemp ?? 0,
    heaterEfficiency: systemHeatEnergy.heaterEfficiency ?? 0,
    wasteWaterDischarge: systemHeatEnergy.wasteWaterDischarge ?? 0,
    hoursPerYear: systemHeatEnergy.hoursPerYear ?? 0,
    heatingFuelType: systemHeatEnergy.heatingFuelType ?? 0,
  }
  const energy = heatEnergy.wasteWaterDischarge * (heatEnergy.outgoingTemp - heatEnergy.incomingTemp) * 1 * 8.3454 * heatEnergy.heaterEfficiency / 1000000
  const heatEnergyCost = energy * energyUnitCost;
  return heatEnergyCost;
}

const setRecycledFlowData = (node: Node<ProcessFlowPart>, graph: NodeGraphIndex, nodeMap: Record<string, Node<ProcessFlowPart>>, recycledSourcesMap: Record<string, RecycledFlowData>)=> {
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

export const getPlantSummaryResults = (
  nodes: Node[], 
  calculatedData: DiagramCalculatedData, 
  graph: NodeGraphIndex, 
  electricityCost: number, 
  settings?: DiagramSettings
): PlantResults => {
  const nodeMap: Record<string, Node<ProcessFlowPart>> = Object.fromEntries(nodes.map((n) => [n.id, n as Node<ProcessFlowPart>]));
  const nodeNameMap: Record<string, string> = {};
  const trueCostOfSystems: TrueCostOfSystems = {};
  const recycledSourcesMap: Record<string, RecycledFlowData> = {};

  // ! debugging
  const debugname = 'CTB';
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
  
  if (waterUsingSystems.length > 0) {
    waterUsingSystems.forEach((currentSystem: Node<ProcessFlowPart>) => {
      const ancestorCosts: ConnectedCost[] = getComponentAncestorCosts(currentSystem, calculatedData, nodeMap, graph);
      const descendantCosts: ConnectedCost[] = getComponentDescendantCosts(currentSystem, calculatedData, nodeMap, graph);
      let systemCostContributions: SystemTrueCostContributions = {
        intake: 0,
        discharge: 0,
        thirdParty: 0,
        treatment: 0,
        wasteTreatment: 0,
        systemPumpAndMotorEnergy: 0,
        heatEnergyWastewater: 0,
        total: 0
      };

      let systemAnnualSummaryResults: SystemAnnualSummaryResults = {
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


      const waterUsingSystem = currentSystem.data as WaterUsingSystem;
      if (waterUsingSystem.heatEnergy) {
        systemCostContributions.heatEnergyWastewater = getHeatEnergyCost(waterUsingSystem.heatEnergy, electricityCost);
      }
      systemCostContributions.systemPumpAndMotorEnergy = getPumpAndMotorEnergyContribution(waterUsingSystem, electricityCost);

      // * Current system owns costs for intake, water-treatment, and waste-water-treatment (if recycled into their system)
        ancestorCosts.forEach((connectedAncestorCost: ConnectedCost) => {
        const ancestorId = connectedAncestorCost.sourceId;
        const ancestorNode = nodeMap[ancestorId];
        switch (connectedAncestorCost.componentType) {
          case 'water-intake': {
            // * ignore costs of intake descendants flowing into a recycled flow into the current system
            const directPathDescendants = getDescendantsDFS(ancestorId, graph, currentSystem.id);
            const isIntakeInRecycledFlow = directPathDescendants.some((descendantId: string) => Boolean(recycledSourcesMap[descendantId]));

            const isImmediateAncestor = graph.edgesByNode[ancestorId]?.some((edge: Edge<CustomEdgeData>) => {
              return edge.target === currentSystem.id;
            });

            if (!isIntakeInRecycledFlow || isImmediateAncestor) {
              const intake = ancestorNode.data as IntakeSource;
              systemCostContributions.intake += connectedAncestorCost.cost;
              const pumpAndMotorEnergy = getPumpAndMotorEnergyContribution(intake, electricityCost);
              const energyCost = pumpAndMotorEnergy * (connectedAncestorCost.percentSelfTotalFlow / 100);
              systemCostContributions.intake += energyCost;

              systemAnnualSummaryResults.sourceWaterIntake += connectedAncestorCost.flow;
            }
            break;
          }
          case 'water-treatment':
                 systemCostContributions.treatment += connectedAncestorCost.cost;
            break;
          case 'waste-water-treatment':
            systemCostContributions.wasteTreatment += connectedAncestorCost.cost;
            break;
        }
      });


      // * Current system owns costs for discharge (if not recycled to another system) and waste-water-treatment (if not recycled to another system)
      descendantCosts.forEach((connectedDescendantCost: ConnectedCost) => {
        const descendantId = connectedDescendantCost.targetId;
        const descendantNode = nodeMap[descendantId];
        switch (connectedDescendantCost.componentType) {
          case 'water-discharge': {
            const discharge = descendantNode.data as DischargeOutlet;

            // * ignore costs of discharge ancestors recycling flow into current path
            const directPathAncestors = getAncestorsDFS(connectedDescendantCost.sourceId, graph, currentSystem.id);
            const debugDirectPathAncestorNames = directPathAncestors.map((ancestorId: string) => nodeMap[ancestorId]?.data.name);
            const isDischargeFromRecycledFlow = directPathAncestors.some((ancestorId: string) => {
              const recycledData = recycledSourcesMap[ancestorId];
              return recycledData && directPathAncestors.includes(recycledData.recycledDestinationId);
            });

            const isImmediateDescendant = graph.edgesByNode[descendantId]?.some((edge: Edge<CustomEdgeData>) => {
              return edge.source === currentSystem.id;
            });

            if (!isDischargeFromRecycledFlow || isImmediateDescendant) {
              systemCostContributions.discharge += connectedDescendantCost.cost;
              const pumpAndMotorEnergy = getPumpAndMotorEnergyContribution(discharge, electricityCost);
              const energyCost = pumpAndMotorEnergy * (connectedDescendantCost.percentSelfTotalFlow / 100);
              systemCostContributions.discharge += energyCost;

              systemAnnualSummaryResults.dischargeWater += connectedDescendantCost.flow;

            }
            break;
          }
          case 'waste-water-treatment':
            // * ignore costs for descendant who is a recycled source or has a descendant who is a recycled source
            // todo has unsupported cases
            let hasRecycledSource = Boolean(recycledSourcesMap[descendantId]);
            if (!hasRecycledSource) {
              const descendants = getDescendants(descendantId, graph);
              hasRecycledSource = descendants.some((subDescId: string) => Boolean(recycledSourcesMap[subDescId]));
            }

            if (!hasRecycledSource) {
              systemCostContributions.wasteTreatment += connectedDescendantCost.cost;
            }
            break;
        }
      });

      const trueCost = getWaterTrueCost(
        systemCostContributions.intake, 
        systemCostContributions.discharge, 
        systemCostContributions.systemPumpAndMotorEnergy, 
        systemCostContributions.heatEnergyWastewater, 
        systemCostContributions.treatment, 
        systemCostContributions.wasteTreatment
      );

      const totalFlows = systemCostContributions.intake
      + systemCostContributions.discharge 
      + systemCostContributions.systemPumpAndMotorEnergy 
      + systemCostContributions.heatEnergyWastewater 
      + systemCostContributions.treatment 
      + systemCostContributions.wasteTreatment;

      const directFlowTotal = systemAnnualSummaryResults.sourceWaterIntake + systemAnnualSummaryResults.dischargeWater;
      systemAnnualSummaryResults.directCostPerYear = systemCostContributions.intake + systemCostContributions.discharge;

      let flowperKUnit = (directFlowTotal / 1000);
      systemAnnualSummaryResults.directCostPerUnit = systemAnnualSummaryResults.directCostPerYear / flowperKUnit;
      systemAnnualSummaryResults.trueCostPerYear = trueCost;

      flowperKUnit = (totalFlows / 1000);
      systemAnnualSummaryResults.trueCostPerUnit = systemAnnualSummaryResults.trueCostPerYear / flowperKUnit;
      systemAnnualSummaryResults.trueOverDirectResult = trueCost / systemAnnualSummaryResults.directCostPerYear;
      
      
      plantSystemSummaryResults.sourceWaterIntake += systemAnnualSummaryResults.sourceWaterIntake;
      plantSystemSummaryResults.directCostPerYear += systemAnnualSummaryResults.directCostPerYear;
      plantSystemSummaryResults.directCostPerUnit += systemAnnualSummaryResults.directCostPerUnit
      plantSystemSummaryResults.trueCostPerYear += systemAnnualSummaryResults.trueCostPerYear;
      plantSystemSummaryResults.trueCostPerUnit += systemAnnualSummaryResults.trueCostPerUnit;
      plantSystemSummaryResults.trueOverDirectResult += systemAnnualSummaryResults.trueOverDirectResult;

      plantSystemSummaryResults.allSystemResults.push(systemAnnualSummaryResults)

      
      systemCostContributions.total = Object.values(systemCostContributions).reduce((total: number, cost: number) => total + cost, 0);
      trueCostOfSystems[currentSystem.id] = systemCostContributions;
    });
  }

  return {trueCostOfSystems, plantSystemSummaryResults};
}


const getPumpAndMotorEnergyContribution = (component: IntakeSource | DischargeOutlet | WaterUsingSystem, electricityCost: number): number => {
  let pumpAndMotorEnergy = 0;
  if (component.addedMotorEnergy?.length) {
    pumpAndMotorEnergy = component.addedMotorEnergy.reduce(
      (sum, motor) => sum + getMotorEnergyCost(motor, electricityCost)
      , 0);
  }
  return pumpAndMotorEnergy;
}


/**
* Get total inflow for a node. If user entered data is not available, use calculated data.
*/
const getTotalInflow = (node: Node<ProcessFlowPart>, calculatedData: DiagramCalculatedData): number => {
  let totalInflow = node.data.userEnteredData?.totalSourceFlow;
  if (totalInflow === undefined || totalInflow === null) {
    totalInflow = calculatedData.nodes[node.id]?.totalSourceFlow;
  }
  return totalInflow ?? 0;
}

/**
* Get total outflow for a node. If user entered data is not available, use calculated data.
*/
const getTotalOutflow = (node: Node<ProcessFlowPart>, calculatedData: DiagramCalculatedData): number => {
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
    const selfTotalFlow = getTotalOutflow(node, calculatedData);

    const outFlow = flowValue;
    const inflow = getTotalInflow(node, calculatedData);
    const flowFraction = flowValue / (targetNodeTotalInflow || 1);
    const percentDestinationInflow = flowFraction * 100;
    const percentSelfTotalFlow = (flowValue / (selfTotalFlow || 1)) * 100;

    const costPerKGal = node.data.cost ?? 0;
    const costOfOutflow = getKGalCost(costPerKGal, outFlow);

    systemConnectedCosts.push({
      name: node.data.name,
      componentType: node.data.processComponentType,
      flow: flowValue,
      cost: costOfOutflow,
      percentSelfTotalFlow: percentSelfTotalFlow,
      percentDestinationInflow: percentDestinationInflow,
      sourceId: node.id,
      targetId: targetNode.id
    });

    // * Don't observe costs of recycled system flows,
    // * but still need to observe costs for recycled waste-water-treatment flows. In some cases multiple WWT are chained together.
    const ignoreRecycledSystemFlow = node.data.processComponentType === 'water-using-system';
    if (visited.has(nodeId) || ignoreRecycledSystemFlow) {
      continue;
    } else {
      visited.add(nodeId);
    }
    
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
    const selfTotalFlow = getTotalInflow(node, calculatedData);


    const inflow = flowValue;
    const outflow = getTotalOutflow(node, calculatedData);
    const flowFraction = flowValue / (sourceTotalOutflow || 1);
    const percentSourceOutflow = flowFraction * 100;
    const percentSelfTotalFlow = (flowValue / (selfTotalFlow || 1)) * 100;

    const costPerKGal = node.data.cost ?? 0;
    const costOfInflow = getKGalCost(costPerKGal, inflow);

    // * note sourceId used here is edge source not system source
    systemConnectedCosts.push({
      name: node.data.name,
      componentType: node.data.processComponentType,
      cost: costOfInflow,
      flow: flowValue,
      percentSelfTotalFlow: percentSelfTotalFlow,
      percentDestinationInflow: percentSourceOutflow,
      sourceId: sourceId,
      targetId: node.id
    });


    if (visited.has(nodeId)) {
      continue;
    } else {
      visited.add(nodeId);
    }
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


export interface ComponentEdgeFlowConnectionCosts {
  [connectionKey: string]: ConnectedCost;
}

export interface ConnectedCost {
  name: string,
  componentType: ProcessFlowNodeType,
  cost: number,
  flow: number,
  percentDestinationInflow: number,
  percentSelfTotalFlow: number,
  sourceId?: string,
  targetId?: string,
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
