import * as React from 'react';
import FlowDisplayUnit from '../Diagram/FlowDisplayUnit';
import { Box } from '@mui/material';
import { checkDiagramNodeErrors, CustomEdgeData, DiagramCalculatedData, DiagramSettings, DischargeOutlet, getComponentTypeTotalCost, getHeatEnergyCost, getIsDiagramValid, getMotorEnergyCost, getTotalInflow, getTotalOutflow, getWaterBalanceResults, getWaterTrueCost, HeatEnergy, IntakeSource, MotorEnergy, NodeErrors, ProcessFlowPart, setWaterUsingSystemFlows, WaterBalanceResults, WaterUsingSystem } from 'process-flow-lib';
import { selectDischargeOutletNodes, selectEdges, selectIntakeSourceNodes, selectNodes, selectNodesAsWaterUsingSystems, selectWasteTreatmentNodes, selectWaterTreatmentNodes } from '../Diagram/store';
import { useAppSelector } from '../../hooks/state';
import { Node, Edge } from '@xyflow/react';
import { TwoCellResultRow, TwoCellResultTable } from '../StyledMUI/ResultTables';
import { Alert } from '@mui/material';


const DiagramResults = () => {
  const edges: Edge<CustomEdgeData>[] = useAppSelector(selectEdges);
  const nodes: Node[] = useAppSelector(selectNodes);
  const intakes: Node<ProcessFlowPart>[] = useAppSelector(selectIntakeSourceNodes);
  const discharges: Node<ProcessFlowPart>[] = useAppSelector(selectDischargeOutletNodes);
  const waterTreatmentNodes: Node<ProcessFlowPart>[] = useAppSelector(selectWaterTreatmentNodes);
  const wasteTreatmentNodes: Node<ProcessFlowPart>[] = useAppSelector(selectWasteTreatmentNodes);
  const waterUsingSystems: WaterUsingSystem[] = useAppSelector(selectNodesAsWaterUsingSystems);
  const settings: DiagramSettings = useAppSelector((state) => state.diagram.settings);
  const calculatedData: DiagramCalculatedData = useAppSelector((state) => state.diagram.calculatedData);
  
  const validationErrors: NodeErrors = useAppSelector((state) => state.diagram.nodeErrors);
  const nodeErrors: NodeErrors = checkDiagramNodeErrors(nodes, edges, calculatedData, settings);
  // console.log('NEWnodeErrors', nodeErrors);
  // console.log('OLDnodeErrors', validationErrors);
  const isDiagramValid = getIsDiagramValid(validationErrors);
  // console.log(isDiagramValid);

  setWaterUsingSystemFlows(waterUsingSystems, edges);
  const diagramResults: WaterBalanceResults = getWaterBalanceResults(waterUsingSystems, calculatedData);

  const costTitle = "Annual Costs";
  // direct costs
  const intakeCost = getComponentTypeTotalCost(intakes, 'totalDischargeFlow', calculatedData);
  const dischargeCost = getComponentTypeTotalCost(discharges, 'totalSourceFlow', calculatedData);
  // indirect costs
  const treatmentCost = getComponentTypeTotalCost(waterTreatmentNodes, 'totalSourceFlow', calculatedData);
  const wasteTreatmentCost = getComponentTypeTotalCost(wasteTreatmentNodes, 'totalSourceFlow', calculatedData);
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
    return total + getMotorEnergyCost(motorEnergy, settings.electricityCost, settings.unitsOfMeasure);
  }, 0);

  const systemHeatEnergyData: HeatEnergy[] = waterUsingSystems.map((system: WaterUsingSystem) => system.heatEnergy).filter((heatEnergy: HeatEnergy) => heatEnergy !== undefined);
  const heatEnergyCosts = systemHeatEnergyData.reduce((total, heatEnergy) => {
    const unitCost = heatEnergy.heatingFuelType === 0? settings.electricityCost : settings.fuelCost;
    return total + getHeatEnergyCost(heatEnergy, unitCost, settings.unitsOfMeasure);
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
    let totalOutflow = getTotalOutflow(intake, calculatedData);
    totalIntake += totalOutflow;
    return { label: intake.data.name, result: totalOutflow, unit: <FlowDisplayUnit /> };
  });
  intakeRows.push(
    { label: 'Total Intake', result: totalIntake, unit: <FlowDisplayUnit /> },
  );

  const dischargeTitle = "Annual Discharge";
  let totalDischarge = 0;
  let dischargeRows: TwoCellResultRow[] = discharges.map((discharge: Node<ProcessFlowPart>) => {
    let totalInflow = getTotalInflow(discharge, calculatedData);
    totalDischarge += totalInflow;
    return { label: discharge.data.name, result: totalInflow, unit: <FlowDisplayUnit /> };
  });

  const estimatedUnknownLosses = diagramResults.estimatedUnknownLosses || 0;
  const totalFacilityDischarge = totalDischarge + diagramResults.totalKnownLosses + estimatedUnknownLosses;

  dischargeRows.push(
    { label: 'Total Known Loss', result: diagramResults.totalKnownLosses, unit: <FlowDisplayUnit /> },
    { label: 'Estimated Unknown Loss', result: diagramResults.estimatedUnknownLosses, unit: <FlowDisplayUnit /> },
    { label: 'Total Discharge', result: totalFacilityDischarge, unit: <FlowDisplayUnit /> },
  )
  
  const facilityImbalance = totalIntake - totalFacilityDischarge;
  // const intakeDeliveredToSystems = totalIntake - diagramResults.intakeDeliveredToSystems;

  const balanceTitle = "Facility Level Imbalance";
  const balanceRows = [
    { label: 'Net Intake Minus Discharge', result: facilityImbalance, unit: <FlowDisplayUnit /> },
    // { label: 'Net Intake Minus System Intake', result: facilityImbalance, unit: <FlowDisplayUnit /> },
  ]

  const style: React.CSSProperties = { 
    marginBottom: '1rem',
  };
  return (
    <Box sx={{ marginX: '.5rem', width: '100%' }}>
      {isDiagramValid ?
        <>
          <TwoCellResultTable headerTitle={costTitle} rows={costRows} style={style} />
          <TwoCellResultTable headerTitle={intakeTitle} rows={intakeRows} style={style} />
          <TwoCellResultTable headerTitle={dischargeTitle} rows={dischargeRows} style={style} />
          <TwoCellResultTable headerTitle={balanceTitle} rows={balanceRows} style={style} />
        </>
        : <>
          <Alert severity="error">
            Diagram flow data contains errors. View diagram alerts to fix issues and ensure entered flow values are valid.
          </Alert>
        </>
      }
    </Box>
  );
}

export default DiagramResults;
