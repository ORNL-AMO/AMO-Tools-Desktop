import { useEffect, useRef, useState } from 'react';
import './App.css'
import Flow, { FlowProps } from './components/Flow';
import { WaterDiagram } from '../../src/process-flow-types/shared-process-flow-types';

function App(props?: ProcessFlowDiagramWrapperProps) {
  const ref = useRef(null)
  let availableHeight = props.parentContainer.height - props.parentContainer.headerHeight - props.parentContainer.footerHeight;
  return (
    availableHeight &&
    <div ref={ref} className={'wc-app-container'} style={{height: availableHeight}}>
      <Flow {...props} height={availableHeight}/>
    </div>
  );
}

export default App;

export interface ProcessFlowDiagramWrapperProps extends FlowProps {
    context: string;
    parentContainer: {
      height: number,
      headerHeight: number;
      footerHeight: number;
    };
    waterProcess?: WaterDiagram;
};
