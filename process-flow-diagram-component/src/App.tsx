import { useEffect, useRef, useState } from 'react';
import './App.css'
import { ProcessFlowDiagramWrapperProps } from './AppWebComponent';
import Flow from './components/Flow';

function App(props?: ProcessFlowDiagramWrapperProps) {
  const ref = useRef(null)
  const [height, setHeight] = useState(null);

  useEffect(() => {
    setHeight(ref.current.clientHeight)
  })
  
  return (
    <div ref={ref} className={'wc-app-container'}>
      <Flow {...props} height={height}/>
    </div>
  );
}

export default App
