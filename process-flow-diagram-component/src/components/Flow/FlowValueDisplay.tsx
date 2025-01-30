import React, { useContext } from 'react'; 
import { formatNumberValue } from './FlowUtils';
import { FlowContext } from '../Flow';

const FlowValueDisplay = ({ flowValue }: { flowValue: number | string }): JSX.Element => {
    const flowContext: FlowContext = useContext<FlowContext>(FlowContext);
    flowValue = formatNumberValue(flowValue, flowContext.settings.flowDecimalPrecision)
    const formattedValue = flowValue.toLocaleString('en-US');
    return (<span>{formattedValue}</span>);
}

export default FlowValueDisplay;