import { ProcessFlowPart } from "../../../../src/process-flow-types/shared-process-flow-types";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export const FlowConnectionText = (props: FlowConnectionTextProps) => {
  return (
    <span>{props.source.name} <ChevronRightIcon sx={{paddingTop: '.25rem'}} fontSize="small"/> {props.target.name}</span>
  );
};

export default FlowConnectionText;
export interface FlowConnectionTextProps {
    source: ProcessFlowPart;
    target: ProcessFlowPart;
}