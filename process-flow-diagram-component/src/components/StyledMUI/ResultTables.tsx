import { Paper, styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableContainerProps, TableHead, TableRow } from "@mui/material";
import { JSX } from "react";

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
