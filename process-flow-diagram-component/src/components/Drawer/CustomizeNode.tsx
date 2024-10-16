import { Box } from '@mui/material';
import { PresetColorPicker } from './PresetColorPicker';
import { Node, useReactFlow } from '@xyflow/react';
import { ProcessFlowPart } from '../../../../src/process-flow-types/shared-process-flow-types';
import { CSSProperties, useEffect, useState } from 'react';
import useUserEventDebounce from '../../hooks/useUserEventDebounce';
import { Accordion, AccordionDetails, AccordionSummary } from '../MUIStyledComponents';


export default function CustomizeNode({ node }: CustomizeNodeProps) {
  const { setNodes } = useReactFlow();
  const [nodeStyle, setNodeStyle] = useState(node.style);
  const debouncedNodeStyle = useUserEventDebounce<CSSProperties>(nodeStyle, 50);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);


  const handleAccordianChange = (newExpanded: boolean) => {
    setIsExpanded(newExpanded);
  };
  const handleBackgroundColorChange = (backgroundColor: string) => {
    const nodeStyle = {
      ...node.style,
      backgroundColor: backgroundColor
    }
    setNodeStyle(nodeStyle);
  }

  const handleTextColorChange = (color: string) => {
    const nodeStyle = {
      ...node.style,
      color: color
    }
    setNodeStyle(nodeStyle);
  }

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n: Node<ProcessFlowPart>) => {
        if (n.data.diagramNodeId === node.id) {
          return {
            ...n,
            style: {
              ...debouncedNodeStyle,
            }
          };
        }
        return n;
      }),
    );
  }, [debouncedNodeStyle]);

  const presetColors = [
    "#cd9323", "#1a53d8", "#9a2151", "#0d6416", "#8d2808",
  ];

  return (
    <Accordion expanded={isExpanded} onChange={(event, newExpanded) => handleAccordianChange(newExpanded)}>
      <AccordionSummary>
        Customize Style
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ marginTop: 1 }}>
          <Box sx={{ fontSize: '.75rem' }}>
            <PresetColorPicker
              color={node.style.backgroundColor}
              presetColors={presetColors}
              onChangeHandler={handleBackgroundColorChange}
              showPresets={true}
              label={'Component Color'} />
          </Box>
          <Box sx={{ fontSize: '.75rem' }}>
            <PresetColorPicker
              color={node.style.color}
              presetColors={presetColors}
              onChangeHandler={handleTextColorChange}
              showPresets={false}
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