import { Box } from '@mui/material';
import { edgeTypeOptions, SelectListOption } from '../Diagram/FlowTypes';
import { Edge } from '@xyflow/react';
import { useEffect, useState } from 'react';
import useUserEventDebounce from '../../hooks/useUserEventDebounce';
import ColorPicker from './ColorPicker';
import { useAppDispatch, useAppSelector } from '../../hooks/state';
import { customEdgeTypeChange, setEdgeStrokeColor } from '../Diagram/diagramReducer';
import { CustomEdgeData } from 'process-flow-lib';

export default function CustomizeEdge({ edge }: CustomizeEdgeProps) {
  const dispatch = useAppDispatch();
  const recentEdgeColors = useAppSelector((state) => state.diagram.recentEdgeColors);
  const edgeType: string = useAppSelector((state) => state.diagram.diagramOptions.edgeType); 
  
  const [edgeColor, setEdgeColor] = useState(edge.style.stroke);
  const [recentColors, setRecentColors] = useState(recentEdgeColors);
  const debouncedEdgeColor = useUserEventDebounce<string>(edgeColor, 50);  

  useEffect(() => {
    dispatch(setEdgeStrokeColor({color: debouncedEdgeColor, recentColors}));
  }, [debouncedEdgeColor]);

  const handleEdgeStrokeChange = (color: string, recentColors?: string[]) => {
    setEdgeColor(color);
    setRecentColors(recentColors);
  }

  const getCurrentEdgeType = (): string => {
    return edge.data.hasOwnEdgeType !== undefined? edge.data.hasOwnEdgeType : edgeType;
  }

  const handleEdgeTypeChange = (newEdgeType: string) => {
    dispatch(customEdgeTypeChange(newEdgeType));
  }

  const selectId = `edgeType_${edge.id}`;

  return (
    <Box sx={{ marginTop: 1 }}>
          <Box display={'flex'} sx={{fontSize: '.75rem', marginTop: 2}} justifyContent={'space-between'} width={'100%'}>
            <label htmlFor={selectId} className="diagram-label" style={{fontSize: '.75rem'}}>Line Type</label>
            <select className="form-control diagram-select" id={selectId} name="edgeType" style={{ marginLeft: '16px' }}
              value={getCurrentEdgeType()}
              onChange={(e) => handleEdgeTypeChange(e.target.value)}>
              {edgeTypeOptions.map((option: SelectListOption) => {
                return (
                  <option key={option.value} value={option.value}>{option.display}</option>
                )
              })}
            </select>
          </Box>

          <Box sx={{fontSize: '.75rem'}}>
            <ColorPicker
              label={'Pick Line Color'} 
              color={edgeColor}
              recentColors={recentEdgeColors}
              setParentColor={handleEdgeStrokeChange}
              showRecent={true}
              />
          </Box>
    </Box>
  );
}

export interface CustomizeEdgeProps {
  edge: Edge<CustomEdgeData>;
}