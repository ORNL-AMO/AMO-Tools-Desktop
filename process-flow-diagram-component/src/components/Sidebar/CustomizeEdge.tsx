import * as React from 'react';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import { Box, Breadcrumbs } from '@mui/material';
import { edgeTypeOptions, SelectListOption } from '../Flow/FlowTypes';
import { PresetColorPicker } from './PresetColorPicker';
import { Edge, Node, useReactFlow } from '@xyflow/react';
import SettingsIcon from '@mui/icons-material/Settings';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { ProcessFlowPart } from '../../../../src/process-flow-types/shared-process-flow-types';

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

export default function CustomizeEdge({ edge }: CustomizeEdgeProps) {
  const { setEdges, getNodes } = useReactFlow();
  const [expanded, setExpanded] = React.useState<boolean>(true);

  const handleAccordianChange =
    (panel: boolean) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(!expanded);
    };

  const handleEdgeTypeChange = (edgeId: string, newEdgeType: string) => {
    setEdges((eds) => {
      return eds.map((edge: Edge) => {
        if (edge.id === edgeId) {
          edge.type = newEdgeType;
        }
        return edge;
      });
    });
  }

  const handleEdgeColorChange = (edgeId: string, color: string) => {
    setEdges((eds) => {
      return eds.map((edge: Edge) => {
        if (edge.id === edgeId) {
          edge.style.stroke = color;
        }
        return edge;
      });
    });
  }

  const presetColors = [
    "#cd9323", "#1a53d8", "#9a2151", "#0d6416", "#8d2808",
  ];

  const nodes = getNodes()
  console.log('getnodes', nodes)
  const source: ProcessFlowPart = nodes.find((node: Node) => node.id === edge.source).data as ProcessFlowPart;
  const target: ProcessFlowPart = nodes.find(node => node.id === edge.target).data as ProcessFlowPart;
  const relationships = [
    <Typography key="1" color="text.secondary" fontSize={'.75rem'}>
      {source.name}
    </Typography>,
    <Typography key="2" color="text.secondary" fontSize={'.75rem'}>
      {target.name}
    </Typography>,
  ]

  return (
    <Box sx={{ marginTop: 1 }}>
      <Accordion key={edge.id} expanded={expanded} onChange={handleAccordianChange(expanded)}>
        <AccordionSummary aria-controls={`${edge.id}-content`} id={`${edge.id}-header`}>
          <Typography variant="h6" component="h6" sx={{ fontSize: '1rem' }}>Connecting Line</Typography>
          <button className="customize-button editing">
            <SettingsIcon sx={{width: 'unset', height: 'unset'}} />
          </button>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            {relationships}
          </Breadcrumbs>
        </AccordionSummary>
        <AccordionDetails>
          <Box display={'flex'} justifyContent={'space-between'} width={'100%'}>
            <label htmlFor="edgeType" >Line Type</label>
            <select className="form-control" id="edgeType" name="edgeType" style={{ marginLeft: '16px' }}
              onChange={(e) => handleEdgeTypeChange(edge.id, e.target.value)}>
              {edgeTypeOptions.map((option: SelectListOption) => {
                return (
                  <option key={option.value} value={option.value}>{option.display}</option>
                )
              })}
            </select>
          </Box>
          <Box>
            <PresetColorPicker
              color={edge.style.stroke}
              updateId={edge.id}
              presetColors={presetColors}
              onChangeHandler={handleEdgeColorChange}
              label={'Pick Line Color'} />
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export interface CustomizeEdgeProps {
  edge: Edge;
}