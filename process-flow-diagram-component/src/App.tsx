import { useEffect, useRef, useState } from 'react';
import './App.css'
import Flow, { FlowProps } from './components/Flow';
import { WaterProcess } from '../lib/process-flow-types';

function App(props?: ProcessFlowDiagramWrapperProps) {
  const ref = useRef(null)
  const [flowContainerHeight, setFlowContainerHeight] = useState(null);

  useEffect(() => {
    let availableHeight = ref.current.clientHeight;
    console.log('App props', props)
    availableHeight = props.diagramData.parentContainer.height - props.diagramData.parentContainer.headerHeight - props.diagramData.parentContainer.footerHeight;
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
  diagramData: {
      context: string;
      parentContainer: {
        height: number,
        headerHeight: number;
        footerHeight: number;
      };
      waterProcess?: WaterProcess;
  }
};
