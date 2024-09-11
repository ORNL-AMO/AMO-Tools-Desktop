import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import { Box, Button } from '@mui/material';
import { PresetColorPicker } from './PresetColorPicker';
import { Node, useReactFlow } from '@xyflow/react';
import EditIcon from '@mui/icons-material/Edit';
import { ProcessFlowPart } from '../../../../src/process-flow-types/shared-process-flow-types';
import { useCallback, useState } from 'react';
import AppTooltip from '../AppTooltip';

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.75rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  background: '#ececec',
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
    flexDirection: 'column'
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

export default function EditNode({ node }: EditNodeProps) {
  const { setNodes, setEdges } = useReactFlow();
  const [expanded, setExpanded] = useState<boolean>(true);

  const handleAccordianChange =
    (panel: boolean) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      // * disallow change until we have multiple instances implemented
      // setExpanded(!expanded);
    };

  const handleNodeColorChange = (nodeId: string, color: string) => {
    setNodes((nds) =>
      nds.map((n: Node) => {
        const processFlowPart = n.data;
        if (processFlowPart.diagramNodeId === nodeId) {
          return {
            ...n,
            style: {
              ...n.style,
              backgroundColor: color
            }
          };
        }
        return n;
      }),
    );
  }

  const onDeleteNode = () => {
    setNodes((nodes) => nodes.filter((nd) => nd.id !== node.id));
    setEdges((edges) => edges.filter((edge) => edge.source !== node.id));
  };

  const presetColors = [
    "#cd9323", "#1a53d8", "#9a2151", "#0d6416", "#8d2808",
  ];

  const nodeData = node.data as ProcessFlowPart;
  return (
    <Box sx={{ marginTop: 1 }}>
      <Accordion key={node.id} expanded={expanded} onChange={handleAccordianChange(expanded)}>
        <AccordionSummary aria-controls={`${node.id}-content`} id={`${node.id}-header`}>
        <Typography color="text.primary" fontSize={'.75rem'}>
            {nodeData.name}
          </Typography>
          <button className="edit-button editing">
            <EditIcon sx={{width: 'unset', height: 'unset'}} />
          </button>
          <Typography variant="subtitle1" color="text.secondary" fontSize={'.75rem'}>
            Plant Water Component
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <PresetColorPicker
              color={node.style.backgroundColor}
              updateId={node.id}
              presetColors={presetColors}
              onChangeHandler={handleNodeColorChange}
              label={'Pick Component Color'} />
          </Box>
          <Box display={'flex'} flexDirection={'row'}>
            <Button sx={{ width: '100%', marginTop: 1 }} variant="outlined" onClick={onDeleteNode}>Delete Component</Button>
            {/* // todo need to render from root or force styling */}
            {/* <AppTooltip 
              title="Deleting Components" 
              message="Components can also be removed by selecting and pressing backspace or delete." 
              /> */}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export interface EditNodeProps {
  node: Node;
}