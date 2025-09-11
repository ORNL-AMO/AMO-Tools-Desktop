import React, { createContext, useContext, useMemo } from 'react';
import { useStore } from 'react-redux';
import { FlowCalculationService } from './FlowCalculationService';


const FlowServiceContext = createContext<FlowCalculationService | null>(null);


export const FlowServiceProvider = ({ children }: { children: React.ReactNode }) => {
  const store = useStore();
  const flowService = useMemo(() => new FlowCalculationService(store), [store]);
  
  return (
    <FlowServiceContext.Provider value={flowService}>
      {children}
    </FlowServiceContext.Provider>
  );
};

export const useFlowService = () => {
  const context = useContext(FlowServiceContext);
  if (!context) {
    throw new Error('useFlowService must be used within a FlowServiceProvider');
  }
  return context;
};