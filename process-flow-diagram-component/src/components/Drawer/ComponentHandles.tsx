import { Box, FormLabel } from '@mui/material';
import { Node, useUpdateNodeInternals } from '@xyflow/react';
import { useAppDispatch } from '../../hooks/state';
import { updateNodeHandles } from '../Diagram/diagramReducer';
import { ProcessFlowPart, Handles, getComponentTypeMaxHandles } from 'process-flow-lib';
import ContinuousSlider from './ContinuousSlider';


export default function ComponentHandles({ node }: ComponentHandlesProps) {
  const dispatch = useAppDispatch();
  const nodeData = node.data as ProcessFlowPart;
  const updateNodeInternals = useUpdateNodeInternals();
  const maxHandles = getComponentTypeMaxHandles(nodeData.processComponentType);

  const getHandleCount = (handleSet: Handles[keyof Handles]) => {
    if (!handleSet) {
      return 0;
    }
    const count = Object.values(handleSet).reduce((sum, handle) => handle ? sum + 1 : sum, 0);
    return count;
  }

  const onSliderChange = (selectedHandleCount: number, handleSetKey: keyof Handles) => {
    const updatedHandles = {
      inflowHandles: nodeData.handles.inflowHandles ? { ...nodeData.handles.inflowHandles } : undefined,
      outflowHandles: nodeData.handles.outflowHandles ? { ...nodeData.handles.outflowHandles } : undefined
    };

    if (updatedHandles[handleSetKey]) {
      Object.entries(updatedHandles[handleSetKey]).forEach(([handle, _], index) => {
        if (index + 1 <= selectedHandleCount) {
          updatedHandles[handleSetKey][handle] = true;
        } else {
          updatedHandles[handleSetKey][handle] = false;
        }
      });

      dispatch(updateNodeHandles(updatedHandles));
      updateNodeInternals(node.id);
    }
  };

  const handleItems = Array.from(Array(maxHandles).keys());
  const marks: { value: number; label: string }[] = handleItems.map(index => ({ value: index + 1, label: String(index + 1) }));
  const inflowHandleCount = getHandleCount(nodeData.handles.inflowHandles);
  const outflowHandleCount = getHandleCount(nodeData.handles.outflowHandles);

  return (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '2rem' }}>
            {!nodeData.disableInflowConnections &&
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                <FormLabel sx={{marginBottom: '1rem', fontSize: '.9rem'}}>Inflow Connections</FormLabel>
                <ContinuousSlider
                  step={1}
                  marks={marks}
                  setSliderValue={(e, newValue) => onSliderChange(newValue, 'inflowHandles')}
                  value={inflowHandleCount} 
                  style={{ width: '100%' }}
                  />
              </Box>
            }

            {!nodeData.disableOutflowConnections &&
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                <FormLabel sx={{marginBottom: '1rem', fontSize: '.9rem'}}>Outflow Connections</FormLabel>
                <ContinuousSlider
                  step={1}
                  marks={marks}
                  setSliderValue={(e, newValue) => onSliderChange(newValue, 'outflowHandles')}
                  value={outflowHandleCount} 
                  style={{ width: '100%' }}
                  />
              </Box>
            }
          </Box>
  );
}

export interface ComponentHandlesProps {
  node: Node;
}