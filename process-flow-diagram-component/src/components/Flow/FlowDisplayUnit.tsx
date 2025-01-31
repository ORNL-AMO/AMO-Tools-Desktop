import React, { useContext } from 'react'; 
import { FlowContext } from '../Flow';

const FlowDisplayUnit = (): JSX.Element => {
    const flowContext: FlowContext = useContext<FlowContext>(FlowContext);
    const unit = flowContext.settings.unitsOfMeasure === 'Imperial'? 'Mgal' : 'm<sup>3</sup>';
    const html = {__html: unit};
    return (<span style={{marginLeft: '.25rem'}} dangerouslySetInnerHTML={html} />)
}

export default FlowDisplayUnit;