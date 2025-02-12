import { Box } from '@mui/material';
import { Node } from '@xyflow/react';
import { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary } from '../StyledMUI/AccordianComponents';
import ColorPicker from './ColorPicker';
import { useAppDispatch, useAppSelector } from '../../hooks/state';
import { setNodeColor, setNodeStyle, } from '../Diagram/diagramReducer';


export default function CustomizeNode({ node }: CustomizeNodeProps) {
  const dispatch = useAppDispatch();
  const recentNodeColors = useAppSelector((state) => state.diagram.recentNodeColors);

  const [backgroundColor, setBackgroundColor] = useState(node.style.backgroundColor);
  const [textColor, setTextColor] = useState(node.style.color);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleAccordianChange = (newExpanded: boolean) => {
    setIsExpanded(newExpanded);
  };

  const handleSetNodeColor = (color: string, recentColors?: string[]) => {
    dispatch(setNodeColor({color, recentColors}));
    setBackgroundColor(color);
  }

  const handleSetTextColor = (selectedColor: string) => {
    setTextColor(selectedColor);
    dispatch(setNodeStyle(
      {
        ...node.style,
        color: selectedColor,
      }
    ));
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
              setParentColor={handleSetNodeColor}
              showRecent={true}
              recentColors={recentNodeColors}
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