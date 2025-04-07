import { CSSProperties } from "react";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ProcessFlowPart } from "process-flow-lib";

export const FlowConnectionText = (props: FlowConnectionTextProps) => {

  return (
    <span style={props.style}>{props.source.name} <ChevronRightIcon sx={{paddingTop: '.25rem', width: `1.5em`, marginBottom: '-.15rem'}} fontSize="small"/> {props.target.name}</span>
  );
};

export default FlowConnectionText;
export interface FlowConnectionTextProps {
    source: ProcessFlowPart;
    target: ProcessFlowPart;
    style?: CSSProperties
}