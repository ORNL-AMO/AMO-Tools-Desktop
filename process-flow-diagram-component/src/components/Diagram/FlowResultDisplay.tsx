import { JSX } from "react";
import { formatNumberValue } from "./FlowUtils";

const FlowResultDisplay = ({ flowValue }: { flowValue: number | string }): JSX.Element => {
    flowValue = formatNumberValue(flowValue, 3);
    const formattedValue = flowValue.toLocaleString('en-US');
    return (<span>{formattedValue}</span>);
}

export default FlowResultDisplay;