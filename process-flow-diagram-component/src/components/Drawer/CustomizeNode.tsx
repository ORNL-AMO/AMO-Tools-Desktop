import { Box } from '@mui/material';
import { Node, useReactFlow } from '@xyflow/react';
import { ProcessFlowPart } from '../../../../src/process-flow-types/shared-process-flow-types';
import { CSSProperties, useContext, useEffect, useState } from 'react';
import useUserEventDebounce from '../../hooks/useUserEventDebounce';
import { Accordion, AccordionDetails, AccordionSummary } from '../MUIStyledComponents';
import { FlowContext } from '../Flow';
import ColorPicker from './ColorPicker';


export default function CustomizeNode({ node }: CustomizeNodeProps) {
  const flowContext: FlowContext = useContext(FlowContext);
  const { setNodes } = useReactFlow();
  const [backgroundColor, setBackgroundColor] = useState(node.style.backgroundColor);
  const [textColor, setTextColor] = useState(node.style.color);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleAccordianChange = (newExpanded: boolean) => {
    setIsExpanded(newExpanded);
  };

  const handleSetBackgroundColor = (selectedColor: string) => {
    setBackgroundColor(selectedColor);
    updateNodeStyle(
      {
        ...node.style,
        backgroundColor: selectedColor,
      }
    );
  }

  const handleSetTextColor = (selectedColor: string) => {
    setTextColor(selectedColor);
    updateNodeStyle(
      {
        ...node.style,
        color: selectedColor,
      }
    );
  }

  const updateNodeStyle = (nodeStyle: CSSProperties) => {
    setNodes((nds) =>
      nds.map((n: Node<ProcessFlowPart>) => {
        if (n.data.diagramNodeId === node.id) {
          return {
            ...n,
            style: {
              ...nodeStyle,
            }
          };
        }
        return n;
      }),
    );
  }


  return (
    <Accordion expanded={isExpanded} onChange={(event, newExpanded) => handleAccordianChange(newExpanded)}>
      <AccordionSummary>
        Customize Style
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ marginTop: 1 }}>
          <Box sx={{ fontSize: '.75rem' }}>
            <ColorPicker
              color={backgroundColor}
              setParentColor={handleSetBackgroundColor}
              showRecent={true}
              recentColors={flowContext.recentNodeColors}
              setRecentColors={flowContext.setRecentNodeColors}
              label={'Component Color'} />
          </Box>
          <Box sx={{ fontSize: '.75rem' }}>
            <ColorPicker
              color={textColor}
              setParentColor={handleSetTextColor}
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