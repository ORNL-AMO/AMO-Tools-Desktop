import * as React from 'react';
import { useAppSelector } from '../../hooks/state';

const FlowDisplayUnit = ({style}: {style?: React.CSSProperties}) => {
    const settings = useAppSelector((state) => state.diagram.settings);
    const unit = settings.unitsOfMeasure === 'Imperial'? 'Mgal' : 'm<sup>3</sup>';
    const html = {__html: unit};
    const spanStyle = {
        ...style,
        marginLeft: '.25rem'
    }
    return (<span style={spanStyle} dangerouslySetInnerHTML={html} />)
}

export default FlowDisplayUnit;