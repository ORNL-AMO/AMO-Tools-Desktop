import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import FlowDisplayUnit from '../Diagram/FlowDisplayUnit';
import { Box } from '@mui/material';
import { CustomEdgeData, getWaterBalanceResults, ProcessFlowPart, setWaterUsingSystemFlows, WaterBalanceResults, WaterUsingSystem } from 'process-flow-lib';
import { selectDischargeOutletNodes, selectEdges, selectIntakeSourceNodes, selectNodes, selectNodesAsWaterUsingSystems } from '../Diagram/store';
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
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 300 }} size="small" aria-label="customized table">
        <TableHead>
            <StyledHeadTableRow>
              <StyledTableCell colSpan={2}>
              {headerTitle}
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
                    <span>{row.unit}</span><span>{row.result}</span>
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
  const edges: Edge<CustomEdgeData>[] = useAppSelector(selectEdges);
  const plantWaterUsingSystems: WaterUsingSystem[] = useAppSelector(selectNodesAsWaterUsingSystems);
  // todo - done after each node 'water-using-system' change in reducer?
  setWaterUsingSystemFlows(plantWaterUsingSystems, edges);
  const diagramResults: WaterBalanceResults = getWaterBalanceResults(plantWaterUsingSystems); 
  console.log(diagramResults)
  
  const costTitle = "Water Costs";
  const costRows = [
    { label: 'Intake Costs', result: 0, unit: '$'},
    { label: 'Discharge Costs', result: 0, unit: '$' },
    { label: 'True Cost', result: 0, unit: '$' },
  ];
  

  // todo row name should be clickable link
  const intakes: Node<ProcessFlowPart>[] = useAppSelector(selectIntakeSourceNodes);
  const intakeTitle = "Water Intake";
  let intakeRows = intakes.map((intake: Node<ProcessFlowPart>) => {
      return { label: intake.data.name, result: intake.data.userEnteredData.totalDischargeFlow, unit: <FlowDisplayUnit/> };
    }
  );
  intakeRows.push(
    { label: 'Total Intake', result: diagramResults.incomingWater, unit: <FlowDisplayUnit/> },
  );

  const discharges: Node<ProcessFlowPart>[] = useAppSelector(selectDischargeOutletNodes);
  const dischargeTitle = "Water Discharge";
  let dischargeRows: DiagramResultsRow[] = discharges.map((discharge: Node<ProcessFlowPart>) => {
      return { label: discharge.data.name, result: discharge.data.userEnteredData.totalSourceFlow, unit: <FlowDisplayUnit/> };
    });
  dischargeRows.push(
    { label: 'Total Known Loss', result: diagramResults.totalKnownLosses, unit:   <FlowDisplayUnit/>},
    { label: 'Estimated Unknown Loss', result: diagramResults.estimatedUnknownLosses, unit:   <FlowDisplayUnit/>},
    { label: 'Total Discharge', result: diagramResults.outgoingWater, unit:   <FlowDisplayUnit/>},
  )

  
  const balanceTitle = "Water Imbalance";
  const balanceRows = [
    { label: 'Total Imbalance', result: diagramResults.waterBalance, unit: <FlowDisplayUnit/> },
  ]

  return (
    <Box sx={{marginX: '.5rem'}}>
      <ResultTable headerTitle={costTitle} rows={costRows} />
      <ResultTable headerTitle={intakeTitle} rows={intakeRows} />
      <ResultTable headerTitle={dischargeTitle} rows={dischargeRows} />
      <ResultTable headerTitle={balanceTitle} rows={balanceRows} />
    </Box>
  );
}

export default DiagramResults;

export interface DiagramResultsProps {
  headerTitle: string;
  rows: Array<DiagramResultsRow>;
  units?: string;
}

export interface DiagramResultsRow {
  label: string,
  result: number,
  unit: string | React.ReactNode,
}