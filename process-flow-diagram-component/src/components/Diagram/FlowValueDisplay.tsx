import { formatNumberValue } from './FlowUtils';
import { useAppSelector } from '../../hooks/state';
import { JSX } from 'react';

const FlowValueDisplay = ({ flowValue }: { flowValue: number | string }): JSX.Element => {
    const settings = useAppSelector((state) => state.diagram.settings);
    flowValue = formatNumberValue(flowValue, settings.flowDecimalPrecision);
    const formattedValue = flowValue.toLocaleString('en-US');
    return (<span>{formattedValue}</span>);
}

export default FlowValueDisplay;