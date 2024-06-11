import { useEffect, useRef, useState } from "react";


const useDiagramStateDebounce = (nodes, edges, delay = 100) => {
    const timerRef = useRef<any>(null);
    const [debouncedNodes, setDebouncedNodes] = useState([]);
    const [debouncedEdges, setDebouncedEdges] = useState([]);
  
    useEffect(() => {
      timerRef.current = setTimeout(() => {
        setDebouncedNodes(nodes);
        setDebouncedEdges(edges);
      }, delay);
  
      return () => {
        clearTimeout(timerRef.current);
      };
    }, [nodes, edges, delay]);

    return {debouncedNodes, debouncedEdges};
  };

export default useDiagramStateDebounce;