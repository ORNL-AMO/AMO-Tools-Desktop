import { Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
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
            <FormControl fullWidth size="small" variant="outlined" sx={{ marginBottom: '1rem', marginLeft: '16px', minWidth: 120 }}>
              <InputLabel id={`${selectId}-label`}>Line Type</InputLabel>
              <Select
                labelId={`${selectId}-label`}
                label={'Line Type'}
                id={selectId}
                name="edgeType"
                size="small"
                value={getCurrentEdgeType()}
                onChange={(e) => handleEdgeTypeChange(e.target.value)}
                MenuProps={{
                  disablePortal: true,
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  }
                }}
              >
                {edgeTypeOptions.map((option: SelectListOption) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.display}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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