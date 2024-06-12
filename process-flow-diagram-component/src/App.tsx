import { useEffect, useRef, useState } from 'react';
import './App.css'
import Flow, { FlowProps } from './components/Flow';
import { WaterDiagram } from '../../src/process-flow-types/process-flow-types';

function App(props?: ProcessFlowDiagramWrapperProps) {
  const ref = useRef(null)
  const [flowContainerHeight, setFlowContainerHeight] = useState(null);

  useEffect(() => {
    let availableHeight = ref.current.clientHeight;
    availableHeight = props.parentContainer.height - props.parentContainer.headerHeight - props.parentContainer.footerHeight;
    setFlowContainerHeight(availableHeight)
  })
  
  return (
    <div ref={ref} className={'wc-app-container'} style={{height: flowContainerHeight}}>
      <Flow {...props} height={flowContainerHeight}/>
    </div>
  );
}

export default App

export interface ProcessFlowDiagramWrapperProps extends FlowProps {
    context: string;
    parentContainer: {
      height: number,
      headerHeight: number;
      footerHeight: number;
    };
    waterProcess?: WaterDiagram;
};
