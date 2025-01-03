import { Box, FormControlLabel, FormGroup, FormLabel, Stack, Switch } from '@mui/material';
import { Node, useReactFlow, useUpdateNodeInternals } from '@xyflow/react';
import { Handles, ProcessFlowPart } from '../../../../src/process-flow-types/shared-process-flow-types';
import { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary } from '../MUIStyledComponents';


export default function ComponentHandles({ node }: ComponentHandlesProps) {
  const { setNodes } = useReactFlow();
  const nodeData = node.data as ProcessFlowPart;
  const updateNodeInternals = useUpdateNodeInternals();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [handles, setHandles] = useState<Handles>(nodeData.handles);

  const handleAccordianChange = (newExpanded: boolean) => {
    setIsExpanded(newExpanded);
  };

  const toggleHandle = (event: React.ChangeEvent<HTMLInputElement>, handleId: string, isInflowHandle: boolean) => {
    const updatedHandles = {inflowHandles: {...handles.inflowHandles}, outflowHandles: {...handles.outflowHandles}}
    if (isInflowHandle) {
      updatedHandles.inflowHandles[handleId] = event.target.checked;
    } else {
      updatedHandles.outflowHandles[handleId] = event.target.checked;
    }
    setHandles(updatedHandles)
    updateNodeInternals(node.id);

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

  const getFlowHandleOption = (handleId: string, isVisible: boolean, isInflowHandle: boolean) => {
    return (
      <FormControlLabel key={handleId}
        labelPlacement="start"
        control={
          <Switch size='small'
            disabled={['a', 'e'].includes(handleId)}
            checked={isVisible}
            onChange={event => ['a', 'e'].includes(handleId) ? undefined : toggleHandle(event, handleId, isInflowHandle)}
          />
        }
        label={handleId.toUpperCase()}
      />
    );
  }

  let handleImgSrc = './assets/component-handles.png';
  let componentHandles = handles;
  let inflowOptions: JSX.Element[] = [];
  let outflowOptions: JSX.Element[] = [];

  const getHandleToggleElements = (flowHandleOptions: Object, isInflow: boolean) => {
    return Object.entries(flowHandleOptions).map(([handle, isVisible]) => {
      return getFlowHandleOption(handle, isVisible, isInflow);
    });
  }

  const setAvailableHandleContext = () => {
    if (nodeData.disableInflowConnections) {
      handleImgSrc = './assets/intake-handles.png';
      delete componentHandles.inflowHandles;
      outflowOptions = getHandleToggleElements(componentHandles.outflowHandles, false);
    } else if (nodeData.disableOutflowConnections) {
      handleImgSrc = './assets/discharge-handles.png';
      delete componentHandles.outflowHandles;
      inflowOptions = getHandleToggleElements(componentHandles.inflowHandles, true);
    } else {
      inflowOptions = getHandleToggleElements(componentHandles.inflowHandles, true);
      outflowOptions = getHandleToggleElements(componentHandles.outflowHandles, false);
    }
  }

  setAvailableHandleContext();
  return (
    <Accordion expanded={isExpanded} onChange={(event, newExpanded) => handleAccordianChange(newExpanded)}>
      <AccordionSummary>
        Connection Handles
      </AccordionSummary>
      <AccordionDetails sx={{ paddingX: '8px' }}>
        <Box>
          <img
            src={handleImgSrc}
            alt={'component-handles'}
            style={{
              width: '330px',
            }}
          />

          <FormGroup sx={{ display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'space-around' }}>
            {inflowOptions.length > 0 &&
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FormLabel>Source In</FormLabel>
                <Stack
                  spacing={{ xs: 2, sm: 2, md: 2 }}
                  direction="column"
                  useFlexGap
                  sx={{ flexWrap: 'wrap' }}
                >
                  {inflowOptions}
                </Stack>
              </Box>
            }

            {outflowOptions.length > 0 &&
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FormLabel>Discharge Out</FormLabel>
                <Stack
                  spacing={{ xs: 2, sm: 2, md: 2 }}
                  direction="column"
                  useFlexGap
                  sx={{ flexWrap: 'wrap' }}
                >
                  {outflowOptions}
                </Stack>
              </Box>
            }
          </FormGroup>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

export interface ComponentHandlesProps {
  node: Node;
}