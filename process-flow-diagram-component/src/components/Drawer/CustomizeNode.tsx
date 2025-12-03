import { Box } from '@mui/material';
import { Node } from '@xyflow/react';
import { useState } from 'react';
import ColorPicker from './ColorPicker';
import { useAppDispatch, useAppSelector } from '../../hooks/state';
import { setNodeColor, setNodeStyle, } from '../Diagram/diagramReducer';


export default function CustomizeNode({ node }: CustomizeNodeProps) {
  const dispatch = useAppDispatch();
  const recentNodeColors = useAppSelector((state) => state.diagram.recentNodeColors);
  const [backgroundColor, setBackgroundColor] = useState(node.style.backgroundColor);
  const [textColor, setTextColor] = useState(node.style.color);

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
        <Box sx={{ marginTop: 1, width: '100%' }}>
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
  );
}

export interface CustomizeNodeProps {
  node: Node;
}