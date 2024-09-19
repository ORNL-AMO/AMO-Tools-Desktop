import { Box } from '@mui/material';
import { PresetColorPicker } from './PresetColorPicker';
import { Node, useReactFlow } from '@xyflow/react';
import { ProcessFlowPart } from '../../../../src/process-flow-types/shared-process-flow-types';


export default function CustomizeNode({ node }: CustomizeNodeProps) {
  const { setNodes } = useReactFlow();

  const handleBackgroundColorChange = (backgroundColor: string) => {
    const nodeStyle = {
      ...node.style,
      backgroundColor: backgroundColor
    }
    updateNodes(nodeStyle);
  }

  const handleTextColorChange = (color: string) => {
    const nodeStyle = {
      ...node.style,
      color: color
    }
    updateNodes(nodeStyle);
  }

  const updateNodes = (style) => {
    setNodes((nds) =>
      nds.map((n: Node<ProcessFlowPart>) => {
        if (n.data.diagramNodeId === node.id) {
          return {
            ...n,
            style: {
              ...style,
            }
          };
        }
        return n;
      }),
    );
  }

  const presetColors = [
    "#cd9323", "#1a53d8", "#9a2151", "#0d6416", "#8d2808",
  ];

  return (
    <Box sx={{ marginTop: 1 }}>
          <Box sx={{fontSize: '.75rem'}}>
            <PresetColorPicker
              color={node.style.backgroundColor}
              presetColors={presetColors}
              onChangeHandler={handleBackgroundColorChange}
              showPresets={true}
              label={'Component Color'} />
          </Box>
          <Box sx={{fontSize: '.75rem'}}>
            <PresetColorPicker
              color={node.style.color}
              presetColors={presetColors}
              onChangeHandler={handleTextColorChange}
              showPresets={false}
              label={'Text Color'} />
          </Box>
    </Box>
  );
}

export interface CustomizeNodeProps {
  node: Node;
}