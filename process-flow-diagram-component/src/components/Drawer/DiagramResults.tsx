import * as React from 'react';
import FlowDisplayUnit from '../Diagram/FlowDisplayUnit';
import { Box } from '@mui/material';
import { checkDiagramNodeErrors, CustomEdgeData, DiagramCalculatedData, DiagramSettings, DischargeOutlet, getComponentTypeTotalCost, getHeatEnergyCost, getInSystemTreatmentCost, getIsDiagramValid, getMotorEnergyCost, getTotalInflow, getTotalOutflow, getWaterBalanceResults, getWaterTrueCost, HeatEnergy, IntakeSource, MotorEnergy, NodeErrors, ProcessFlowPart, setWaterUsingSystemFlows, WaterBalanceResults, WaterUsingSystem } from 'process-flow-lib';
import { selectDischargeOutletNodes, selectEdges, selectIntakeSourceNodes, selectNodes, selectNodesAsWaterUsingSystems, selectWasteTreatmentNodes, selectWaterTreatmentNodes } from '../Diagram/store';
import { useAppSelector } from '../../hooks/state';
import { Node, Edge } from '@xyflow/react';
import { TwoCellResultRow, TwoCellResultTable } from '../StyledMUI/ResultTables';
import { Alert } from '@mui/material';
import { formatDecimalPlaces } from '../Diagram/FlowUtils';


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
  const intakeCost = getComponentTypeTotalCost(intakes, 'totalDischargeFlow', calculatedData, settings.unitsOfMeasure);
  const dischargeCost = getComponentTypeTotalCost(discharges, 'totalSourceFlow', calculatedData, settings.unitsOfMeasure);
  // indirect costs
  let treatmentCost = getComponentTypeTotalCost(waterTreatmentNodes, 'totalSourceFlow', calculatedData, settings.unitsOfMeasure);
  const inSystemTreatmentCosts = nodes.reduce((total: number, node: Node<ProcessFlowPart>) => {
    if (node.data.processComponentType === 'water-using-system') {
      let inSystemTreatmentCost = 0;
      const system = node.data as WaterUsingSystem;
      if (system.inSystemTreatment && system.inSystemTreatment.length > 0) {
        const totalSystemInflow = getTotalInflow(node, calculatedData);
        inSystemTreatmentCost = getInSystemTreatmentCost(system.inSystemTreatment, totalSystemInflow, settings.unitsOfMeasure);
        return total + inSystemTreatmentCost;
      } 
    }
    return total;
  }, 0);
  treatmentCost += inSystemTreatmentCosts;
  const wasteTreatmentCost = getComponentTypeTotalCost(wasteTreatmentNodes, 'totalSourceFlow', calculatedData, settings.unitsOfMeasure);
  const systemMotorEnergyData: MotorEnergy[] = waterUsingSystems.map((system: WaterUsingSystem) => system.addedMotorEnergy || []).flat();

  let intakeUnaccounted = 0;
  const intakeMotorEnergy = intakes
    .map((intake: Node<ProcessFlowPart>) => {
      const intakeSource = intake.data as IntakeSource;
      intakeUnaccounted += intakeSource.userEnteredData.intakeUnaccounted || 0;
      return intakeSource.addedMotorEnergy || [];
    })
    .flat();

  let dischargeUnaccounted = 0;
  const dischargeMotorEnergy = discharges.map((discharge: Node<ProcessFlowPart>) => {
    const dischargeSource = discharge.data as DischargeOutlet;
    dischargeUnaccounted += dischargeSource.userEnteredData.dischargeUnaccounted || 0;
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

  const intakeCostFormatted = currency.format(formatDecimalPlaces(intakeCost, settings.flowDecimalPrecision));
  const dischargeCostFormatted = currency.format(formatDecimalPlaces(dischargeCost, settings.flowDecimalPrecision));
  const indirectCostsFormatted = currency.format(formatDecimalPlaces(indirectCosts, settings.flowDecimalPrecision));
  const trueCostFormatted = currency.format(formatDecimalPlaces(trueCost, settings.flowDecimalPrecision));

  const costRows = [
    { label: 'Intake Costs', result: intakeCostFormatted, unit: '$' },
    { label: 'Discharge Costs', result: dischargeCostFormatted, unit: '$' },
    { label: 'Indirect Costs', result: indirectCostsFormatted, unit: '$' },
    { label: 'True Cost', result: trueCostFormatted, unit: '$' },
  ];

  const intakeTitle = "Annual Intake";
  let totalIntake = 0;
  let intakeRows = intakes.map((intake: Node<ProcessFlowPart>) => {
    let totalOutflow = getTotalOutflow(intake, calculatedData);
    totalIntake += totalOutflow;
    const totalOutflowFormatted = formatDecimalPlaces(totalOutflow, settings.flowDecimalPrecision);
    return { label: intake.data.name, result: totalOutflowFormatted, unit: <FlowDisplayUnit /> };
  });

  const totalIntakeFormatted = formatDecimalPlaces(totalIntake, settings.flowDecimalPrecision);
  intakeRows.push(
    { label: 'Total Intake', result: totalIntakeFormatted, unit: <FlowDisplayUnit /> },
  );

  const dischargeTitle = "Annual Discharge";
  let totalDischarge = 0;
  let dischargeRows: TwoCellResultRow[] = discharges.map((discharge: Node<ProcessFlowPart>) => {
    let totalInflow = getTotalInflow(discharge, calculatedData);
    totalDischarge += totalInflow;
    const totalInflowFormatted = formatDecimalPlaces(totalInflow, settings.flowDecimalPrecision);
    return { label: discharge.data.name, result: totalInflowFormatted, unit: <FlowDisplayUnit /> };
  });

  let estimatedUnknownLosses = diagramResults.estimatedUnknownLosses || 0;
  const totalFacilityDischarge = totalDischarge + diagramResults.totalKnownLosses + estimatedUnknownLosses;

  estimatedUnknownLosses = estimatedUnknownLosses + dischargeUnaccounted;

  const estimatedUnknownLossesFormatted = formatDecimalPlaces(estimatedUnknownLosses, settings.flowDecimalPrecision);
  const estimatedUnknownWaterUses = formatDecimalPlaces(intakeUnaccounted, settings.flowDecimalPrecision);
  const totalKnownLossesFormatted = formatDecimalPlaces(diagramResults.totalKnownLosses, settings.flowDecimalPrecision);
  const totalFacilityDischargeFormatted = formatDecimalPlaces(totalFacilityDischarge, settings.flowDecimalPrecision);
  dischargeRows.push(
    { label: 'Total Known Loss (water users)', result: totalKnownLossesFormatted, unit: <FlowDisplayUnit /> },
    { label: 'Estimated Unknown Loss (water users)', result: estimatedUnknownLossesFormatted, unit: <FlowDisplayUnit /> },
    { label: 'Total Discharge', result: totalFacilityDischargeFormatted, unit: <FlowDisplayUnit /> },
  )
  
  const facilityImbalance = totalIntake - totalFacilityDischarge;
  // const intakeDeliveredToSystems = totalIntake - diagramResults.intakeDeliveredToSystems;

  const facilityImbalanceFormatted = formatDecimalPlaces(facilityImbalance, settings.flowDecimalPrecision);
  const balanceTitle = "Facility Level Imbalance";
  const balanceRows = [
    { label: 'Net Intake Minus Discharge', result: facilityImbalanceFormatted, unit: <FlowDisplayUnit /> },
    { label: 'Estimated Unknown Water Uses', result: estimatedUnknownWaterUses, unit: <FlowDisplayUnit /> },
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
