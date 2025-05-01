import * as React from 'react';
import FlowDisplayUnit from '../Diagram/FlowDisplayUnit';
import { Box } from '@mui/material';
import { ComponentEdgeFlowConnectionCosts, CustomEdgeData, DiagramCalculatedData, DiagramSettings, DischargeOutlet, getComponentAncestorCosts, getComponentTypeTotalCost, getHeatEnergyCost, getMotorEnergyCost, getTrueCostOfSystems, getWaterBalanceResults, getWaterTrueCost, HeatEnergy, IntakeSource, MotorEnergy, NodeErrors, NodeGraphIndex, ProcessFlowPart, setWaterUsingSystemFlows, TrueCostOfSystems, WaterBalanceResults, WaterUsingSystem } from 'process-flow-lib';
import { selectCalculatedData, selectDischargeOutletNodes, selectEdges, selectGraphIndex, selectIntakeSourceNodes, selectNodes, selectNodesAsWaterUsingSystems, selectWasteTreatmentNodes, selectWaterTreatmentNodes } from '../Diagram/store';
import { useAppSelector } from '../../hooks/state';
import { Node, Edge } from '@xyflow/react';
import { TrueCostOfSystemResultTable, TwoCellResultRow } from '../StyledMUI/ResultTables';
import { getIsDiagramValid } from '../../validation/Validation';


const DiagramResults = () => {
  // todo - move results to store thunk Or less expensive to keep here?
  const edges: Edge<CustomEdgeData>[] = useAppSelector(selectEdges);
  const nodes: Node[] = useAppSelector(selectNodes);
  const validationErrors: NodeErrors = useAppSelector((state) => state.diagram.nodeErrors);

  const intakes: Node<ProcessFlowPart>[] = useAppSelector(selectIntakeSourceNodes);
  const discharges: Node<ProcessFlowPart>[] = useAppSelector(selectDischargeOutletNodes);
  const waterTreatmentNodes: Node<ProcessFlowPart>[] = useAppSelector(selectWaterTreatmentNodes);
  const wasteTreatmentNodes: Node<ProcessFlowPart>[] = useAppSelector(selectWasteTreatmentNodes);
  const waterUsingSystems: WaterUsingSystem[] = useAppSelector(selectNodesAsWaterUsingSystems);
  const graph: NodeGraphIndex = useAppSelector(selectGraphIndex);
  const calculatedNodeData: DiagramCalculatedData = useAppSelector(selectCalculatedData);
  const settings: DiagramSettings = useAppSelector((state) => state.diagram.settings);
  
  let trueCostOfSystems: TrueCostOfSystems = {};
  console.log(validationErrors);
  if (getIsDiagramValid(validationErrors)) {
    trueCostOfSystems = getTrueCostOfSystems(nodes, calculatedNodeData, graph, settings);
  }
  console.log('trueCostOfSystems', trueCostOfSystems);

  setWaterUsingSystemFlows(waterUsingSystems, edges);
  const diagramResults: WaterBalanceResults = getWaterBalanceResults(waterUsingSystems); 
  // console.log('Diagram WB', diagramResults);
  
  const costTitle = "Annual Costs";
  // direct costs
  const intakeCost = getComponentTypeTotalCost(intakes, 'totalDischargeFlow');
  const dischargeCost = getComponentTypeTotalCost(discharges, 'totalSourceFlow');
  // indirect costs
  const treatmentCost = getComponentTypeTotalCost(waterTreatmentNodes, 'totalSourceFlow');
  const wasteTreatmentCost = getComponentTypeTotalCost(wasteTreatmentNodes, 'totalSourceFlow');
  // todo make assessment settings available in diagram
  const systemMotorEnergyData: MotorEnergy[] = waterUsingSystems.map((system: WaterUsingSystem) => system.addedMotorEnergy || []).flat();
  const intakeMotorEnergy = intakes
    .map((intake: Node<ProcessFlowPart>) => {
      const intakeSource = intake.data as IntakeSource;
      return intakeSource.addedMotorEnergy || [];
    })
    .flat();

  const dischargeMotorEnergy = discharges.map((discharge: Node<ProcessFlowPart>) => {
    const dischargeSource = discharge.data as DischargeOutlet;
    return dischargeSource.addedMotorEnergy || [];
  }).flat();

  const allMotorEnergy: MotorEnergy[] = systemMotorEnergyData.concat(intakeMotorEnergy, dischargeMotorEnergy);
  const motorEnergyCosts = allMotorEnergy.reduce((total, motorEnergy) => {
    // todo bug hardcoded 1, get from settings unitCost?
    return total + getMotorEnergyCost(motorEnergy, 1);
  }, 0);
  // console.log('motorEnergyCosts', motorEnergyCosts);

  const systemHeatEnergyData: HeatEnergy[] = waterUsingSystems.map((system: WaterUsingSystem) => system.heatEnergy);
  const heatEnergyCosts = systemHeatEnergyData.reduce((total, heatEnergy) => {
    return total + getHeatEnergyCost(heatEnergy, 1);
  }, 0);
  // console.log('heatEnergyCosts', heatEnergyCosts);
  
  const indirectCosts = treatmentCost + wasteTreatmentCost + motorEnergyCosts + heatEnergyCosts;
  const trueCost = getWaterTrueCost(intakeCost, dischargeCost, motorEnergyCosts, heatEnergyCosts, treatmentCost, wasteTreatmentCost);

  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });
  const costRows = [
    { label: 'Intake Costs', result: currency.format(intakeCost), unit: '$'},
    { label: 'Discharge Costs', result: currency.format(dischargeCost), unit: '$' },
    { label: 'Indirect Costs', result: currency.format(indirectCosts), unit: '$' },
    { label: 'True Cost', result: currency.format(trueCost), unit: '$' },
  ];
  
  const intakeTitle = "Annual Intake";
  let intakeRows = intakes.map((intake: Node<ProcessFlowPart>) => {
      return { label: intake.data.name, result: intake.data.userEnteredData.totalDischargeFlow, unit: <FlowDisplayUnit/> };
    }
  );
  intakeRows.push(
    { label: 'Total Intake', result: diagramResults.incomingWater, unit: <FlowDisplayUnit/> },
  );

  const dischargeTitle = "Annual Discharge";
  let dischargeRows: TwoCellResultRow[] = discharges.map((discharge: Node<ProcessFlowPart>) => {
      return { label: discharge.data.name, result: discharge.data.userEnteredData.totalSourceFlow, unit: <FlowDisplayUnit/> };
    });
  dischargeRows.push(
    { label: 'Total Known Loss', result: diagramResults.totalKnownLosses, unit:   <FlowDisplayUnit/>},
    { label: 'Estimated Unknown Loss', result: diagramResults.estimatedUnknownLosses, unit:   <FlowDisplayUnit/>},
    { label: 'Total Discharge', result: diagramResults.outgoingWater, unit:   <FlowDisplayUnit/>},
  )

  const balanceTitle = "Annual Imbalance";
  const balanceRows = [
    { label: 'Total Imbalance', result: diagramResults.waterBalance, unit: <FlowDisplayUnit/> },
  ]

  return (
    <Box sx={{marginX: '.5rem'}}>
      {/* <TwoCellResultTable headerTitle={costTitle} rows={costRows} style={{marginBottom: '1rem'}}/>
      <TwoCellResultTable headerTitle={intakeTitle} rows={intakeRows} />
      <TwoCellResultTable headerTitle={dischargeTitle} rows={dischargeRows} />
      <TwoCellResultTable headerTitle={balanceTitle} rows={balanceRows} /> */}
      <TrueCostOfSystemResultTable 
        trueCostOfSystems={trueCostOfSystems} 
        nodes={nodes} 
        />
    </Box>
  );
}

export default DiagramResults;
