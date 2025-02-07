import React, { useContext } from 'react'; 
import { formatNumberValue } from './FlowUtils';
import { RootDiagramContext } from './Diagram';
import { DiagramContext } from './FlowTypes';

const FlowValueDisplay = ({ flowValue }: { flowValue: number | string }): JSX.Element => {
    const diagramContext: DiagramContext = useContext<DiagramContext>(RootDiagramContext);
    flowValue = formatNumberValue(flowValue, diagramContext.settings.flowDecimalPrecision);
    const formattedValue = flowValue.toLocaleString('en-US');
    return (<span>{formattedValue}</span>);
}

export default FlowValueDisplay;