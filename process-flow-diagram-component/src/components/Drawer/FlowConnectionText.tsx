import { CSSProperties } from "react";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ProcessFlowPart } from "process-flow-lib";

export const FlowConnectionText = (props: FlowConnectionTextProps) => {

  return (
    // * source/target can be undefined for a dangling edge left pointing at a since-deleted node
    <span style={props.style}>{props.source?.name ?? 'Unknown'} <ChevronRightIcon sx={{paddingTop: '.25rem', width: `1.5em`, marginBottom: '-.15rem'}} fontSize="small"/> {props.target?.name ?? 'Unknown'}</span>
  );
};

export default FlowConnectionText;
export interface FlowConnectionTextProps {
    source: ProcessFlowPart | undefined;
    target: ProcessFlowPart | undefined;
    style?: CSSProperties
}