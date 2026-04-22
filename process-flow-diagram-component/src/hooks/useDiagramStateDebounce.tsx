import { useEffect, useState } from "react";



const useDiagramStateDebounce = (nodes, edges, diagramNotes?, delay = 100) => {
  const [debouncedNodes, setDebouncedNodes] = useState([]);
  const [debouncedEdges, setDebouncedEdges] = useState([]);
  const [debouncedDiagramNotes, setDebouncedDiagramNotes] = useState(diagramNotes);

  useEffect(() => {
    const stateUpdateDelay = setTimeout(() => {
      setDebouncedNodes(nodes);
      setDebouncedEdges(edges);
      if (typeof diagramNotes !== 'undefined') {
        setDebouncedDiagramNotes(diagramNotes);
      }
    }, delay);

    return () => {
      clearTimeout(stateUpdateDelay);
    };
  }, [nodes, edges, diagramNotes, delay]);

  if (typeof diagramNotes !== 'undefined') {
    return { debouncedNodes, debouncedEdges, debouncedDiagramNotes };
  }
  return { debouncedNodes, debouncedEdges };
};

export default useDiagramStateDebounce;