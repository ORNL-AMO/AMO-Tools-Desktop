import { Paper, styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableContainerProps, TableHead, TableRow } from "@mui/material";
import { DiagramCalculatedData, ProcessFlowPart, SystemTrueCostContributions, TrueCostOfSystems } from "process-flow-lib";
import { JSX } from "react";
import { Node } from "@xyflow/react";


export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#3055cf',
    // backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export const StyledHeadTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: '#3055cf',
  color: theme.palette.common.white,
}));


export interface TwoCellResultRow {
  label: string,
  result: number | string | JSX.Element,
  unit: string | JSX.Element,
}


export interface TwoCellTablResultProps extends React.HTMLAttributes<TableContainerProps> {
  headerTitle: string;
  rows: Array<TwoCellResultRow>;
  units?: string;
}


export const TwoCellResultTable = (props: TwoCellTablResultProps) => {
  const { headerTitle, rows } = props as TwoCellTablResultProps;

  return (
    <TableContainer component={Paper} sx={{ ...props.style }}>
      <Table sx={{ minWidth: 300 }} size="small" aria-label="customized table">
        <TableHead>
          <StyledHeadTableRow>
            <StyledTableCell colSpan={2}>
              {headerTitle}
            </StyledTableCell>
          </StyledHeadTableRow>
        </TableHead>
        <TableBody>
          {rows.map((row: TwoCellResultRow, index: number) => (
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


export interface SystemTrueCostResultRow {
  label: string,
  results: Array<string>,
}

export interface TrueCostOfSystemTableProps extends React.HTMLAttributes<TableContainerProps> {
  trueCostOfSystems: TrueCostOfSystems;
  nodes: Array<Node>;
}


// const headerCells = [
//   'Water Intake',
//   'Wastewater Disposal',
//   'Third Party Disposal',
//   'Water Treatment',
//   'Wastewater Treatment ',
//   'Pump and Motor Energy',
//   'Heat Energy in Wastewater',
//   'Total',
// ];

const headerCells = [
  'Intake',
  'Disposal',
  '3rd Disposal',
  'Treatment',
  'Waste Treatment',
  'Motor Energy',
  'Heat Energy ',
  'Total',
];



export const TrueCostOfSystemResultTable = (props: TrueCostOfSystemTableProps) => {
  const { trueCostOfSystems, nodes } = props;
  const systemCosts = [];

  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  Object.entries(trueCostOfSystems).forEach(([key, systemCostContributions]:
    [key: string, systemCostContributions: SystemTrueCostContributions]) => {
    const systemKey = key as keyof TrueCostOfSystems;
    // todo filter out non-systems earlier
    const component = nodes.find((node: Node<ProcessFlowPart>) => node.id === systemKey)?.data as ProcessFlowPart;
    if (component.processComponentType === 'water-using-system') {
      const results = Object.values(systemCostContributions).map((value: number) => {
          if (value === 0) {
            return '-';
          }
          return currency.format(value);
      });
      systemCosts.push({
        label: component.name || systemKey,
        results: results,
        unit: '$',
      });
    }
  });

  return (
    <TableContainer component={Paper} sx={{ ...props.style }}>
      <h2 style={{color: 'red', fontWeight: 'bold'}}>This table is for development cost checking only</h2>
      <Table sx={{ minWidth: 300 }} size="small" aria-label="customized table">
        <TableHead>
          <StyledHeadTableRow>
            <StyledTableCell colSpan={1}>
              Water Using System
            </StyledTableCell>
            {headerCells.map((headerCell, index) => (
              <StyledTableCell key={index} align="right">
                {headerCell}
              </StyledTableCell>
            ))}
          </StyledHeadTableRow>
        </TableHead>
        <TableBody>
          {systemCosts.map((row: SystemTrueCostResultRow, index: number) => (
            <StyledTableRow key={index}>
              <StyledTableCell component="th" scope="row">
                {row.label}
              </StyledTableCell>
              {row.results.map((result, index) => (
                <StyledTableCell key={index} align="right">
                  {result}
                </StyledTableCell>
              ))}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
