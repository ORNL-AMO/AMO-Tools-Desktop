import React, { CSSProperties, useContext } from 'react'; 
import { RootDiagramContext } from './Diagram';
import { DiagramContext } from './FlowTypes';

const FlowDisplayUnit = ({style}: {style?: CSSProperties}): JSX.Element => {
    const diagramContext: DiagramContext = useContext<DiagramContext>(RootDiagramContext);
    const unit = diagramContext.settings.unitsOfMeasure === 'Imperial'? 'Mgal' : 'm<sup>3</sup>';
    const html = {__html: unit};
    const spanStyle = {
        ...style,
        marginLeft: '.25rem'
    }
    return (<span style={spanStyle} dangerouslySetInnerHTML={html} />)
}

export default FlowDisplayUnit;