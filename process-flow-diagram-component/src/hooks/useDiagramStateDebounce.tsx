import { useEffect, useRef, useState } from "react";


const useDiagramStateDebounce = (nodes, edges, delay = 100) => {
    const [debouncedNodes, setDebouncedNodes] = useState([]);
    const [debouncedEdges, setDebouncedEdges] = useState([]);
  
    useEffect(() => {
      const stateUpdateDelay = setTimeout(() => {
        setDebouncedNodes(nodes);
        setDebouncedEdges(edges);
      }, delay);
  
      return () => {
        clearTimeout(stateUpdateDelay);
      };
    }, [nodes, edges, delay]);

    return {debouncedNodes, debouncedEdges};
  };

export default useDiagramStateDebounce;