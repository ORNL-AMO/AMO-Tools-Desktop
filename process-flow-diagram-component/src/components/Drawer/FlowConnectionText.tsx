import { CSSProperties } from "react";
import { ProcessFlowPart } from "../../../../src/process-flow-types/shared-process-flow-types";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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