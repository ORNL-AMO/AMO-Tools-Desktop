import * as React from 'react';
import FlowDisplayUnit from '../Diagram/FlowDisplayUnit';
import { Box } from '@mui/material';
import { CustomEdgeData, DiagramSettings, DischargeOutlet, getComponentTypeTotalCost, getHeatEnergyCost, getMotorEnergyCost, getWaterBalanceResults, getWaterTrueCost, HeatEnergy, IntakeSource, MotorEnergy, NodeErrors, ProcessFlowPart, setWaterUsingSystemFlows, WaterBalanceResults, WaterUsingSystem } from 'process-flow-lib';
import { selectDischargeOutletNodes, selectEdges, selectIntakeSourceNodes, selectNodesAsWaterUsingSystems, selectWasteTreatmentNodes, selectWaterTreatmentNodes } from '../Diagram/store';
import { useAppSelector } from '../../hooks/state';
import { Node, Edge } from '@xyflow/react';
import { TwoCellResultRow, TwoCellResultTable } from '../StyledMUI/ResultTables';
import { getIsDiagramValid } from '../../validation/Validation';


const DiagramResults = () => {
  // todo - move results to store thunk Or less expensive to keep here?
  const edges: Edge<CustomEdgeData>[] = useAppSelector(selectEdges);
  const validationErrors: NodeErrors = useAppSelector((state) => state.diagram.nodeErrors);

  const intakes: Node<ProcessFlowPart>[] = useAppSelector(selectIntakeSourceNodes);
  const discharges: Node<ProcessFlowPart>[] = useAppSelector(selectDischargeOutletNodes);
  const waterTreatmentNodes: Node<ProcessFlowPart>[] = useAppSelector(selectWaterTreatmentNodes);
  const wasteTreatmentNodes: Node<ProcessFlowPart>[] = useAppSelector(selectWasteTreatmentNodes);
  const waterUsingSystems: WaterUsingSystem[] = useAppSelector(selectNodesAsWaterUsingSystems);
  const settings: DiagramSettings = useAppSelector((state) => state.diagram.settings);
  const isDiagramValid = getIsDiagramValid(validationErrors);

  setWaterUsingSystemFlows(waterUsingSystems, edges);
  const diagramResults: WaterBalanceResults = getWaterBalanceResults(waterUsingSystems);

  const costTitle = "Annual Costs";
  // direct costs
  const intakeCost = getComponentTypeTotalCost(intakes, 'totalDischargeFlow');
  const dischargeCost = getComponentTypeTotalCost(discharges, 'totalSourceFlow');
  // indirect costs
  const treatmentCost = getComponentTypeTotalCost(waterTreatmentNodes, 'totalSourceFlow');
  const wasteTreatmentCost = getComponentTypeTotalCost(wasteTreatmentNodes, 'totalSourceFlow');
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
    return total + getMotorEnergyCost(motorEnergy, settings.electricityCost);
  }, 0);

  const systemHeatEnergyData: HeatEnergy[] = waterUsingSystems.map((system: WaterUsingSystem) => system.heatEnergy).filter((heatEnergy: HeatEnergy) => heatEnergy !== undefined);
  const heatEnergyCosts = systemHeatEnergyData.reduce((total, heatEnergy) => {
    return total + getHeatEnergyCost(heatEnergy, settings.electricityCost);
  }, 0);

  const indirectCosts = treatmentCost + wasteTreatmentCost + motorEnergyCosts + heatEnergyCosts;
  const trueCost = getWaterTrueCost(intakeCost, dischargeCost, motorEnergyCosts, heatEnergyCosts, treatmentCost, wasteTreatmentCost);

  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });
  const costRows = [
    { label: 'Intake Costs', result: currency.format(intakeCost), unit: '$' },
    { label: 'Discharge Costs', result: currency.format(dischargeCost), unit: '$' },
    { label: 'Indirect Costs', result: currency.format(indirectCosts), unit: '$' },
    { label: 'True Cost', result: currency.format(trueCost), unit: '$' },
  ];

  const intakeTitle = "Annual Intake";
  let totalIntake = 0;
  let intakeRows = intakes.map((intake: Node<ProcessFlowPart>) => {
    totalIntake += intake.data.userEnteredData.totalDischargeFlow;
    // todo check for calculated data?
    return { label: intake.data.name, result: intake.data.userEnteredData.totalDischargeFlow, unit: <FlowDisplayUnit /> };
  });
  intakeRows.push(
    { label: 'Total Intake', result: totalIntake, unit: <FlowDisplayUnit /> },
  );

  const dischargeTitle = "Annual Discharge";
  let totalDischarge = 0;
  let dischargeRows: TwoCellResultRow[] = discharges.map((discharge: Node<ProcessFlowPart>) => {
    // todo check for calculated data?
    totalDischarge += discharge.data.userEnteredData.totalSourceFlow;
    return { label: discharge.data.name, result: discharge.data.userEnteredData.totalSourceFlow, unit: <FlowDisplayUnit /> };
  });
  dischargeRows.push(
    { label: 'Total Known Loss', result: diagramResults.totalKnownLosses, unit: <FlowDisplayUnit /> },
    { label: 'Estimated Unknown Loss', result: diagramResults.estimatedUnknownLosses, unit: <FlowDisplayUnit /> },
    { label: 'Total Discharge', result: totalDischarge, unit: <FlowDisplayUnit /> },
  )
  
  const facilityImbalance = totalIntake - totalDischarge - diagramResults.totalKnownLosses - diagramResults.estimatedUnknownLosses;
  const balanceTitle = "Facility Level Imbalance";
  const balanceRows = [
    { label: 'Total Imbalance', result: facilityImbalance, unit: <FlowDisplayUnit /> },
  ]

  const style: React.CSSProperties = { 
    marginBottom: '1rem',
  };
  return (
    <Box sx={{ marginX: '.5rem', width: '100%'}}>
      <TwoCellResultTable headerTitle={costTitle} rows={costRows} style={style} />
      <TwoCellResultTable headerTitle={intakeTitle} rows={intakeRows} style={style}/>
      <TwoCellResultTable headerTitle={dischargeTitle} rows={dischargeRows} style={style}/>
      <TwoCellResultTable headerTitle={balanceTitle} rows={balanceRows} style={style}/>
    </Box>
  );
}

export default DiagramResults;
