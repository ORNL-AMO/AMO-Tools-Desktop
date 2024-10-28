import { useState, useEffect } from 'react';

const useUserEventDebounce = <T,>(stateChange: T, delay: number = 100): T => {
    const [debouncedEventState, setDebouncedEventState] = useState<T>(stateChange);
    useEffect(() => {
      const stateChangeDelay = setTimeout(() => {
        setDebouncedEventState(stateChange);
      }, delay);
  
      return () => {
        clearTimeout(stateChangeDelay);
      };

    }, [stateChange, delay]);
  
    return debouncedEventState;
  }

export default useUserEventDebounce;