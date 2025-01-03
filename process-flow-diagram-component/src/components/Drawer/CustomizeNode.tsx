import { Box } from '@mui/material';
import { Node, useReactFlow } from '@xyflow/react';
import { ProcessFlowPart } from '../../../../src/process-flow-types/shared-process-flow-types';
import { useContext, useEffect, useState } from 'react';
import useUserEventDebounce from '../../hooks/useUserEventDebounce';
import { Accordion, AccordionDetails, AccordionSummary } from '../MUIStyledComponents';
import PresetColorPicker from './PresetColorPicker';
import { FlowContext } from '../Flow';


export default function CustomizeNode({ node }: CustomizeNodeProps) {
  const flowContext: FlowContext = useContext(FlowContext);
  const { setNodes } = useReactFlow();
  const [backgroundColor, setBackgroundColor] = useState(node.style.backgroundColor);
  const [textColor, setTextColor] = useState(node.style.color);
  const debouncedBackgroundColor = useUserEventDebounce<string>(backgroundColor, 50);
  const debouncedTextColor = useUserEventDebounce<string>(textColor, 50);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleAccordianChange = (newExpanded: boolean) => {
    setIsExpanded(newExpanded);
  };

  // todo remove debouncing
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n: Node<ProcessFlowPart>) => {
        if (n.data.diagramNodeId === node.id) {
          return {
            ...n,
            style: {
              ...n.style,
              backgroundColor: backgroundColor,
              color: textColor
            }
          };
        }
        return n;
      }),
    );
  }, [debouncedBackgroundColor, debouncedTextColor]);


  return (
    <Accordion expanded={isExpanded} onChange={(event, newExpanded) => handleAccordianChange(newExpanded)}>
      <AccordionSummary>
        Customize Style
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ marginTop: 1 }}>
          <Box sx={{ fontSize: '.75rem' }}>
            <PresetColorPicker
              color={backgroundColor}
              setParentColor={setBackgroundColor}
              showRecent={true}
              recentColors={flowContext.recentNodeColors}
              setRecentColors={flowContext.setRecentNodeColors}
              label={'Component Color'} />
          </Box>
          <Box sx={{ fontSize: '.75rem' }}>
            <PresetColorPicker
              color={textColor}
              setParentColor={setTextColor}
              showRecent={false}
              label={'Text Color'} />
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

export interface CustomizeNodeProps {
  node: Node;
}