import './App.css'

import Diagram from './components/Diagram/Diagram';
import { DiagramProps } from './components/Diagram/Diagram';
import { useState, useEffect } from 'react';


function App(props?: ProcessFlowDiagramWrapperProps) {
  let availableHeight = props.parentContainer.height - props.parentContainer.headerHeight - props.parentContainer.footerHeight;

  // Lift diagramNotes state here
  const [diagramNotes, setDiagramNotes] = useState(props.processDiagram?.flowDiagramData?.diagramNotes || '');

  // Only update local state when processDiagram changes
  useEffect(() => {
    setDiagramNotes(props.processDiagram?.flowDiagramData?.diagramNotes || '');
  }, [props.processDiagram]);

  // Custom save handler to always include latest notes
  const handleSaveFlowDiagramData = (data) => {
    props.saveFlowDiagramData({
      ...data,
      diagramNotes,
    });
  };

  return (
    availableHeight &&
      <div className={'wc-app-container'} style={{height: availableHeight}}>
        <Diagram
          {...props}
          height={availableHeight}
          diagramNotes={diagramNotes}
          setDiagramNotes={setDiagramNotes}
          saveFlowDiagramData={handleSaveFlowDiagramData}
        />
      </div>
  );
}

export default App;

export interface ProcessFlowDiagramWrapperProps extends Omit<DiagramProps, 'diagramNotes' | 'setDiagramNotes'> {
  context: string;
  parentContainer: {
    height: number,
    headerHeight: number;
    footerHeight: number;
  };
}
