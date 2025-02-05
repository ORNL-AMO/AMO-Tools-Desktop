import React, { CSSProperties, useContext } from 'react'; 
import { FlowContext } from '../Flow';

const FlowDisplayUnit = ({style}: {style?: CSSProperties}): JSX.Element => {
    const flowContext: FlowContext = useContext<FlowContext>(FlowContext);
    const unit = flowContext.settings.unitsOfMeasure === 'Imperial'? 'Mgal' : 'm<sup>3</sup>';
    const html = {__html: unit};
    const spanStyle = {
        ...style,
        marginLeft: '.25rem'
    }
    return (<span style={spanStyle} dangerouslySetInnerHTML={html} />)
}

export default FlowDisplayUnit;