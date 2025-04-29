import { Node, Edge } from "@xyflow/react";
import { CustomEdgeData, DiagramCalculatedData, DiagramSettings, NodeFlowData, NodeFlowProperty, ProcessFlowNodeType, ProcessFlowPart } from "../types/diagram";
import { BoilerWater, BoilerWaterResults, CoolingTower, CoolingTowerResults, DiagramWaterSystemFlows, DischargeOutlet, EdgeFlowData, HeatEnergy, IntakeSource, KitchenRestroom, KitchenRestroomResults, Landscaping, LandscapingResults, MotorEnergy, ProcessUse, ProcessUseResults, SystemBalanceResults, WaterBalanceResults, WaterProcessComponent, WaterSystemFlowsTotals, WaterSystemTypeEnum, WaterUsingSystem } from "../types/water-components";
import { convertAnnualFlow, convertNullInputValueForObjectConstructor } from "./utils";
import { getWaterFlowTotals } from "./water-components";
import { getAncestors, getDescendants, NodeGraphIndex } from "../../graph";

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

  // console.log('Water Balance Results', plantBalanceResults);
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

    componentFlows.sourceWater.total = getTotalFlowValue(componentFlows.sourceWater.flows) ?? 0;
    componentFlows.recirculatedWater.total = getTotalFlowValue(componentFlows.recirculatedWater.flows) ?? 0;
    componentFlows.dischargeWater.total = getTotalFlowValue(componentFlows.dischargeWater.flows) ?? 0;
    const totalKnownLosses = system.userEnteredData.totalKnownLosses ?? system.userDiagramFlowOverrides.knownLosses;
    componentFlows.knownLosses.total = totalKnownLosses ?? 0;
    // componentFlows.knownLosses.total = system.userEnteredData.totalKnownLosses? system.userEnteredData.totalKnownLosses : getTotalFlowValue(componentFlows.knownLosses.flows);
    componentFlows.waterInProduct.total = system.userEnteredData.waterInProduct ?? 0;
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
    const flowMgal = component.data.userEnteredData[nodeFlowProperty] ?? 0;
    const unitCost = component.data.cost ?? 0;
    let cost = getKGalCost(unitCost, flowMgal);
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

// todo unitCost from settings
export const getTrueCostOfSystems = (nodes: Node[], calculatedData: DiagramCalculatedData, graph: NodeGraphIndex): TrueCostOfSystems => {
  // const waterUsingSystems = nodes.filter((node: Node<ProcessFlowPart>) => node.data.processComponentType === 'water-using-system') as Node<WaterUsingSystem>[];
  const allComponentsSourceCosts: Record<string, ComponentEdgeFlowConnectionCosts> = {};
  const allComponentsDischargeCosts: Record<string, ComponentEdgeFlowConnectionCosts> = {};
  const nodeNameMap: Record<string, string> = {};
  const trueCostOfSystems: TrueCostOfSystems = {};

  if (nodes.length > 0) {
    nodes.forEach((node: Node<ProcessFlowPart>) => {
      // * TRAVERSE AND COLLECT COSTS
      let ancestorCosts: ComponentEdgeFlowConnectionCosts = {};
      if (node.data.processComponentType !== 'water-intake') {
        ancestorCosts = getComponentAncestorCosts(node, calculatedData, nodes as Node<ProcessFlowPart>[], graph);
      }
      const descendentCosts: ComponentEdgeFlowConnectionCosts = getComponentDescendantCosts(node, calculatedData, nodes as Node<ProcessFlowPart>[], graph);
      
      // todo for debugging
      nodeNameMap[node.data.diagramNodeId] = node.data.name;
      allComponentsSourceCosts[node.id] = ancestorCosts;
      allComponentsDischargeCosts[node.id] = descendentCosts;
      console.log('allComponentsSourceCosts', allComponentsSourceCosts);
      console.log('allComponentsDischargeCosts', allComponentsDischargeCosts);
      console.log('nodeNameMap', nodeNameMap);

      // todo below what can be optimized into ancestorCosts method
      // * SUM TRUE COSTs SYSTEM 
      const systemCostContributions: SystemTrueCostContributions = {
        intake: 0,
        discharge: 0,
        thirdParty: 0,
        treatment: 0,
        wasteTreatment: 0,
        pumpAndMotorEnergy: 0,  
        heatEnergyWastewater: 0,
        total: 0
      };

      if (node.data.processComponentType === 'water-using-system') {
        const waterUsingSystem = node.data as WaterUsingSystem;
        if (waterUsingSystem.heatEnergy) {
          // todo unitCost from settings
          systemCostContributions.heatEnergyWastewater = getHeatEnergyCost(waterUsingSystem.heatEnergy, 1); 
        }
      }

      Object.entries(ancestorCosts).forEach(([ancestorId, connectedAncestor]: [string, ConnectedCost]) => {
        if (connectedAncestor.componentType === 'water-intake') {
          systemCostContributions.intake += connectedAncestor.cost;
          const intakeSource: IntakeSource = nodes.find((n: Node<ProcessFlowPart>) => n.id === ancestorId)?.data as IntakeSource;
          if (intakeSource) {
            const costs = intakeSource.addedMotorEnergy?.reduce((total: number, motorEnergy: MotorEnergy) => {
              // todo unitCost from settings
              return total + getMotorEnergyCost(motorEnergy, 1);
            }, 0);
            systemCostContributions.pumpAndMotorEnergy += costs ?? 0;
          }
        } else if (connectedAncestor.componentType === 'water-treatment') {
          systemCostContributions.treatment += connectedAncestor.cost;
        }
      });

      Object.entries(descendentCosts).forEach(([ancestorId, connectedAncestor]: [string, ConnectedCost]) => {
        if (connectedAncestor.componentType === 'water-discharge') {
          systemCostContributions.discharge += connectedAncestor.cost;
          const dischargeOutlet: DischargeOutlet = nodes.find((n: Node<ProcessFlowPart>) => n.id === ancestorId)?.data as DischargeOutlet;
          if (dischargeOutlet) {
            const costs = dischargeOutlet.addedMotorEnergy?.reduce((total: number, motorEnergy: MotorEnergy) => {
              // todo unitCost from settings
              return total + getMotorEnergyCost(motorEnergy, 1);
            }, 0);
            systemCostContributions.pumpAndMotorEnergy += costs ?? 0;
          }
        } else if (connectedAncestor.componentType === 'waste-water-treatment') {
          systemCostContributions.wasteTreatment += connectedAncestor.cost;
        }
      });

     
      systemCostContributions.total = Object.values(systemCostContributions).reduce((total: number, cost: number) => total + cost, 0);
      trueCostOfSystems[node.id] = systemCostContributions;

    });
    
  }



  return trueCostOfSystems;
}

// todo optimization don't need to get ancestor of water-discharge types
// todo is incomingEdges made redunant by graph.parentMap?
// todo is direct parent contribution useful?
// todo eventually set ancestor costs as Record/Maps of <componentType, {id, data}>
export const getComponentAncestorCosts = (
  targetNode: Node<ProcessFlowPart>,
  calculatedData: DiagramCalculatedData,
  nodes: Node<ProcessFlowPart>[],
  graph: NodeGraphIndex
): ComponentEdgeFlowConnectionCosts => {
  const nodeMap: Record<string, Node<ProcessFlowPart>> = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const incomingEdges: Edge[] = Object.values(graph.edgeMap).filter((e) => e.target === targetNode.id);
  const targetNodeCalculatedData = calculatedData[targetNode.id] as NodeFlowData;
  const nodeSourceCosts: ComponentEdgeFlowConnectionCosts = {};

  let targetNodeTotalSourceFlow = targetNode.data.userEnteredData?.totalSourceFlow;

  console.log('targetNode', targetNode.data.name, targetNodeTotalSourceFlow);
  console.log('incoming Edges', incomingEdges.map((e) => nodeMap[e.source].data?.name));
  incomingEdges.forEach((edge: Edge<CustomEdgeData>) => {
    const targetSourceId = edge.source;
    const targetSourceNode = nodeMap[targetSourceId];

    const edgeFlowValue = edge.data.flowValue ?? 0;
    const targetNodeSourceFlow = targetNode.data.userEnteredData.totalSourceFlow ?? 0;

    const parentFlowFraction = edgeFlowValue / (targetNodeSourceFlow);
    const parentCost = getKGalCost(targetSourceNode.data.cost ?? 0, targetSourceNode.data.userEnteredData.totalDischargeFlow ?? 0);

    nodeSourceCosts[targetSourceId] = {
      name: targetSourceNode.data.name,
      componentType: targetSourceNode.data.processComponentType,
      cost: parentFlowFraction * parentCost,
      percentOfFlow: parentFlowFraction * 100,
    };

    const ancestors = getAncestors(targetSourceId, graph);
    ancestors.forEach((ancestorId) => {
      const ancestorNode = nodeMap[ancestorId];
      if (!ancestorNode) return;

      // todo what if multiple ancestors
      const edgeFromAncestor: Edge<CustomEdgeData> = Object.values(graph.edgeMap).find((e) => e.source === ancestorId && e.target === targetSourceId);
      const ancestorDischargeFlow = ancestorNode.data.userEnteredData.totalDischargeFlow ?? 0;

      if (edgeFromAncestor && ancestorDischargeFlow) {
        const ancestorFlowFraction = edgeFromAncestor.data.flowValue / ancestorDischargeFlow;
        const percentAncestorFlowReceived  = ancestorDischargeFlow * ancestorFlowFraction;
        const ancestorCost = getKGalCost(ancestorNode.data.cost ?? 0, percentAncestorFlowReceived);
        
        // const effectiveFraction = ancestorFlowFraction * parentFlowFraction;
        // const combinedCost = effectiveFraction * ancestorCost;
        if (ancestorCost) {
          setTargetNodeAncestorCosts(ancestorNode, nodeSourceCosts, ancestorCost, ancestorFlowFraction);
        }
      }

    });
  });

  return nodeSourceCosts;
};

const setTargetNodeAncestorCosts = (
  ancestorNode: Node<ProcessFlowPart>, 
  nodeSourceCosts: ComponentEdgeFlowConnectionCosts, 
  ancestorCost: number, 
  ancestorFlowFraction: number
) => { 
  if (!nodeSourceCosts[ancestorNode.id]) {
    nodeSourceCosts[ancestorNode.id] = {
      name: ancestorNode.data.name,
      componentType: ancestorNode.data.processComponentType,
      cost: ancestorCost,
      percentOfFlow: ancestorFlowFraction * 100,
    };
  } else {
    nodeSourceCosts[ancestorNode.id].name = ancestorNode.data.name,
    nodeSourceCosts[ancestorNode.id].cost = ancestorCost;
    nodeSourceCosts[ancestorNode.id].percentOfFlow = ancestorFlowFraction * 100;
  }
}


export const getComponentDescendantCosts = (
  sourceNode: Node<ProcessFlowPart>,
  calculatedData: DiagramCalculatedData,
  nodes: Node<ProcessFlowPart>[],
  graph: NodeGraphIndex
): ComponentEdgeFlowConnectionCosts => {
  const nodeMap: Record<string, Node<ProcessFlowPart>> = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const outgoingEdges: Edge[] = Object.values(graph.edgeMap).filter((e) => e.source === sourceNode.id);
  const sourceNodeTotalDischargeFlow = sourceNode.data.userEnteredData.totalDischargeFlow;
  
  const nodeTargetCosts: ComponentEdgeFlowConnectionCosts = {};

  outgoingEdges.forEach((edge: Edge<CustomEdgeData>) => {
    const dischargeNodeId = edge.target;
    const dischargeTargetNode = nodeMap[dischargeNodeId];

    const targetFlowFraction = edge.data.flowValue / sourceNodeTotalDischargeFlow;
    const childCost = getKGalCost(dischargeTargetNode.data.cost ?? 0, dischargeTargetNode.data.userEnteredData.totalSourceFlow ?? 0);

    // Direct contribution to immediate child
    nodeTargetCosts[dischargeNodeId] = {
      name: dischargeTargetNode.data.name,
      componentType: dischargeTargetNode.data.processComponentType,
      cost: targetFlowFraction * childCost,
      percentOfFlow: targetFlowFraction * 100,
    };

    const descendants = getDescendants(dischargeNodeId, graph);

    descendants.forEach((descendantId) => {
      const descendantNode = nodeMap[descendantId];
      if (!descendantNode) return;

      const edgeToDescendant: Edge<CustomEdgeData> = Object.values(graph.edgeMap).find((e) =>  e.target === descendantId && e.source === dischargeNodeId);
      const descendantTotalSourceFlow = descendantNode.data.userEnteredData.totalSourceFlow ?? 0;

      if (edgeToDescendant && descendantTotalSourceFlow) {
        const descendantFlowFraction = edgeToDescendant.data.flowValue / descendantTotalSourceFlow;
        const percentDescendantFlowReceived = descendantTotalSourceFlow * descendantFlowFraction;
        const descendantCost = getKGalCost(descendantNode.data.cost ?? 0, percentDescendantFlowReceived);

        if (descendantCost) {
          setSourceNodeDescendantCosts(descendantNode, nodeTargetCosts, descendantCost, descendantFlowFraction);
        }
      }
    });
  });

  return nodeTargetCosts;
};

// todo likely combine with setTargetNodeancestorCosts
const setSourceNodeDescendantCosts = (
  descendantNode: Node<ProcessFlowPart>,
  nodeTargetCosts: ComponentEdgeFlowConnectionCosts,
  descendantCost: number,
  descendantFlowFraction: number
) => {
  if (!nodeTargetCosts[descendantNode.id]) {
    nodeTargetCosts[descendantNode.id] = {
      name: descendantNode.data.name,
      componentType: descendantNode.data.processComponentType,
      cost: descendantCost,
      percentOfFlow: descendantFlowFraction * 100,
    };
  } else {
    nodeTargetCosts[descendantNode.id].name = descendantNode.data.name;
    nodeTargetCosts[descendantNode.id].cost = descendantCost;
    nodeTargetCosts[descendantNode.id].percentOfFlow = descendantFlowFraction * 100;
  }
};



export interface ComponentEdgeFlowConnectionCosts {
  [connectedId: string]: ConnectedCost
}

export interface ConnectedCost {
  name: string,
  componentType: ProcessFlowNodeType,
  cost: number,
  percentOfFlow: number,
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
  pumpAndMotorEnergy: number,
  heatEnergyWastewater: number,
  total: number
}