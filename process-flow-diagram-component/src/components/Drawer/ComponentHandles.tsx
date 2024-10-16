import { Box, FormControlLabel, FormGroup, FormLabel, Stack, Switch } from '@mui/material';
import { Node, useReactFlow, useUpdateNodeInternals } from '@xyflow/react';
import { HandleOption, ProcessFlowPart } from '../../../../src/process-flow-types/shared-process-flow-types';
import { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary } from '../MUIStyledComponents';


export default function ComponentHandles({ node }: ComponentHandlesProps) {
  const { setNodes } = useReactFlow();
  const nodeData = node.data as ProcessFlowPart;
  const updateNodeInternals = useUpdateNodeInternals();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [handleOptions, setHandleOptions] = useState<HandleOption[]>(nodeData.handles);


  const handleAccordianChange = (newExpanded: boolean) => {
    setIsExpanded(newExpanded);
  };

  const toggleHandle = (event: React.ChangeEvent<HTMLInputElement>, updatedHandle: HandleOption) => {
    const updatedHandles = handleOptions.map(handle => {
      if (handle.id === updatedHandle.id) {
        return {
          ...handle,
          visible: event.target.checked
        }
      }
      return handle;
    });

    setHandleOptions(updatedHandles)
    updateNodeInternals(node.id)

    // todo update edges - removed handles with edges are stale inside the edges array
    
    setNodes((nds) =>
      nds.map((n: Node<ProcessFlowPart>) => {
        if (node.id === n.id) {

          return {
            ...n,
            data: {
              ...n.data,
              handles: updatedHandles
            }
          };
        }
        return n;
      }),
    );
    
  };

  const getFlowHandleOption = (handle: HandleOption, index) => {
    return (
      <FormControlLabel key={index + handle.id}
        labelPlacement="start"
        control={
          <Switch size='small'
            disabled={['a', 'e'].includes(handle.id)}
            checked={handle.visible}
            onChange={event => ['a', 'e'].includes(handle.id) ? undefined : toggleHandle(event, handle)}
          />
        }
        label={handle.id.toUpperCase()}
      />
    );
  }

  const inFlowOptions = handleOptions.slice(0, 4);
  const outFlowOptions = handleOptions.slice(4);

  return (
    <Accordion expanded={isExpanded} onChange={(event, newExpanded) => handleAccordianChange(newExpanded)}>
      <AccordionSummary>
        Connection Handles
      </AccordionSummary>
      <AccordionDetails sx={{ paddingX: '8px' }}>
        <Box>
          <img
            src={'./assets/component-handles.png'}
            alt={'component-handles'}
            style={{
              width: '330px',
            }}
          />

          <FormGroup sx={{ display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'space-around' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FormLabel>Source In</FormLabel>
              <Stack
                spacing={{ xs: 2, sm: 2, md: 2 }}
                direction="column"
                useFlexGap
                sx={{ flexWrap: 'wrap' }}
              >
                {inFlowOptions.map((handle, index) => {
                  return getFlowHandleOption(handle, index);
                })
                }
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FormLabel>Discharge Out</FormLabel>
              <Stack
                spacing={{ xs: 2, sm: 2, md: 2 }}
                direction="column"
                useFlexGap
                sx={{ flexWrap: 'wrap' }}
              >
                {outFlowOptions.map((handle, index) => {
                  return getFlowHandleOption(handle, index);
                })
                }
              </Stack>
            </Box>
          </FormGroup>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

export interface ComponentHandlesProps {
  node: Node;
}