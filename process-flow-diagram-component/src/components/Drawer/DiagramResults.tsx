import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer, { TableContainerProps } from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import FlowDisplayUnit from '../Diagram/FlowDisplayUnit';
import { Box } from '@mui/material';
import { CustomEdgeData, DischargeOutlet, getComponentTypeTotalCost, getHeatEnergyCost, getIntakeSource, getMotorEnergyCost, getWaterBalanceResults, getWaterTrueCost, HeatEnergy, IntakeSource, MotorEnergy, ProcessFlowPart, setWaterUsingSystemFlows, WaterBalanceResults, WaterProcessComponent, WaterUsingSystem } from 'process-flow-lib';
import { selectDischargeOutletNodes, selectEdges, selectIntakeSourceNodes, selectNodes, selectNodesAsWaterUsingSystems, selectWasteTreatmentNodes, selectWaterTreatmentNodes } from '../Diagram/store';
import { useAppSelector } from '../../hooks/state';
import { Node, Edge } from '@xyflow/react';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#3055cf',
    // backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const StyledHeadTableRow = styled(TableRow)(({ theme }) => ({
    backgroundColor: '#3055cf',
    color: theme.palette.common.white,
}));


const ResultTable = (props: DiagramResultsProps) => {
  const { headerTitle, rows } = props as DiagramResultsProps;

  return (
    <TableContainer component={Paper} sx={{...props.style}}>
      <Table sx={{ minWidth: 300 }} size="small" aria-label="customized table">
        <TableHead>
            <StyledHeadTableRow>
              <StyledTableCell colSpan={2}>
              Annual {headerTitle}
              </StyledTableCell>
            </StyledHeadTableRow>
        </TableHead>
        <TableBody>
          {rows.map((row: DiagramResultsRow, index: number) => (
            <StyledTableRow key={index}>
              <StyledTableCell component="th" scope="row">
                {row.label}
              </StyledTableCell>
              <StyledTableCell align="right">
                {row.unit === '$' ?
                   <>
                    <span>{row.result}</span>
                  </>
                  :
                  <>
                    <span>{row.result}</span><span>{row.unit}</span>
                  </>}
                </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const DiagramResults = () => {
  // todo - move results to store thunk Or less expensive to keep here?
  const edges: Edge<CustomEdgeData>[] = useAppSelector(selectEdges);
  const intakes: Node<ProcessFlowPart>[] = useAppSelector(selectIntakeSourceNodes);
  const discharges: Node<ProcessFlowPart>[] = useAppSelector(selectDischargeOutletNodes);
  const waterTreatmentNodes: Node<ProcessFlowPart>[] = useAppSelector(selectWaterTreatmentNodes);
  const wasteTreatmentNodes: Node<ProcessFlowPart>[] = useAppSelector(selectWasteTreatmentNodes);
  const waterUsingSystems: WaterUsingSystem[] = useAppSelector(selectNodesAsWaterUsingSystems);
  setWaterUsingSystemFlows(waterUsingSystems, edges);
  const diagramResults: WaterBalanceResults = getWaterBalanceResults(waterUsingSystems); 
  console.log('Diagram WB', diagramResults)
  
  const costTitle = "Costs";
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
    return total + getMotorEnergyCost(motorEnergy, 1);
  }, 0);
  console.log('motorEnergyCosts', motorEnergyCosts);

  const systemHeatEnergyData: HeatEnergy[] = waterUsingSystems.map((system: WaterUsingSystem) => system.heatEnergy);
  const heatEnergyCosts = systemHeatEnergyData.reduce((total, heatEnergy) => {
    return total + getHeatEnergyCost(heatEnergy, 1);
  }, 0);
  console.log('heatEnergyCosts', heatEnergyCosts);
  
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
  
  const intakeTitle = "Intake";
  let intakeRows = intakes.map((intake: Node<ProcessFlowPart>) => {
      return { label: intake.data.name, result: intake.data.userEnteredData.totalDischargeFlow, unit: <FlowDisplayUnit/> };
    }
  );
  intakeRows.push(
    { label: 'Total Intake', result: diagramResults.incomingWater, unit: <FlowDisplayUnit/> },
  );

  const dischargeTitle = "Discharge";
  let dischargeRows: DiagramResultsRow[] = discharges.map((discharge: Node<ProcessFlowPart>) => {
      return { label: discharge.data.name, result: discharge.data.userEnteredData.totalSourceFlow, unit: <FlowDisplayUnit/> };
    });
  dischargeRows.push(
    { label: 'Total Known Loss', result: diagramResults.totalKnownLosses, unit:   <FlowDisplayUnit/>},
    { label: 'Estimated Unknown Loss', result: diagramResults.estimatedUnknownLosses, unit:   <FlowDisplayUnit/>},
    { label: 'Total Discharge', result: diagramResults.outgoingWater, unit:   <FlowDisplayUnit/>},
  )

  const balanceTitle = "Imbalance";
  const balanceRows = [
    { label: 'Total Imbalance', result: diagramResults.waterBalance, unit: <FlowDisplayUnit/> },
  ]

  return (
    <Box sx={{marginX: '.5rem'}}>
      <ResultTable headerTitle={costTitle} rows={costRows} style={{marginBottom: '1rem'}}/>
      <ResultTable headerTitle={intakeTitle} rows={intakeRows} />
      <ResultTable headerTitle={dischargeTitle} rows={dischargeRows} />
      <ResultTable headerTitle={balanceTitle} rows={balanceRows} />
    </Box>
  );
}

export default DiagramResults;

export interface DiagramResultsProps extends React.HTMLAttributes<TableContainerProps> {
  headerTitle: string;
  rows: Array<DiagramResultsRow>;
  units?: string;
}

export interface DiagramResultsRow {
  label: string,
  result: number | string,
  unit: string | React.ReactNode,
}