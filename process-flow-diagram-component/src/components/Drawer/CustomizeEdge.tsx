import { Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { edgeTypeOptions, SelectListOption } from '../Diagram/FlowTypes';
import { Edge } from '@xyflow/react';
import { useEffect, useRef, useState } from 'react';
import useUserEventDebounce from '../../hooks/useUserEventDebounce';
import ColorPicker from './ColorPicker';
import ResetColorButton from './ResetColorButton';
import { useAppDispatch, useAppSelector } from '../../hooks/state';
import { customEdgeTypeChange, setEdgeStrokeColor } from '../Diagram/diagramReducer';
import { CustomEdgeData, DEFAULT_EDGE_STROKE_COLOR } from 'process-flow-lib';
import { useFlowConfidenceColor, resolveEdgeStrokeColor } from '../Edges/FlowConfidenceIcon';
import { selectColorEdgesByConfidence } from '../Diagram/store';

export default function CustomizeEdge({ edge }: CustomizeEdgeProps) {
  const dispatch = useAppDispatch();
  const getFlowConfidenceColorValue = useFlowConfidenceColor();
  const recentEdgeColors = useAppSelector((state) => state.diagram.recentEdgeColors);
  const edgeType: string = useAppSelector((state) => state.diagram.diagramOptions.edgeType);
  const colorEdgesByConfidence = useAppSelector(selectColorEdgesByConfidence);

  // * shows the color actually on screen - the confidence auto-color unless the user has manually overridden it or turned off "Color Edges by Confidence"
  const displayedEdgeColor = resolveEdgeStrokeColor(edge.data, edge.style.stroke, colorEdgesByConfidence, getFlowConfidenceColorValue);
  const [edgeColor, setEdgeColor] = useState(displayedEdgeColor);
  const [recentColors, setRecentColors] = useState(recentEdgeColors);
  const debouncedEdgeColor = useUserEventDebounce<string>(edgeColor, 50);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // * already matches redux state (e.g. this fired from a reset dispatched synchronously below) - nothing to dispatch
    if (debouncedEdgeColor === displayedEdgeColor) {
      return;
    }
    dispatch(setEdgeStrokeColor({color: debouncedEdgeColor, recentColors}));
  }, [debouncedEdgeColor]);

  useEffect(() => {
    setEdgeColor(displayedEdgeColor);
  }, [displayedEdgeColor]);

  const handleEdgeStrokeChange = (color: string, recentColors?: string[]) => {
    setEdgeColor(color);
    setRecentColors(recentColors);
  }

  const handleResetEdgeStrokeColor = () => {
    const resetColor = colorEdgesByConfidence ? getFlowConfidenceColorValue(edge.data.confidence) : DEFAULT_EDGE_STROKE_COLOR;
    setEdgeColor(resetColor);
    dispatch(setEdgeStrokeColor({ color: resetColor, isReset: true }));
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
              actions={
                <ResetColorButton
                  label="line"
                  disabled={!edge.data.hasManualColorOverride}
                  onClick={handleResetEdgeStrokeColor}
                />
              }
              />
          </Box>
    </Box>
  );
}

export interface CustomizeEdgeProps {
  edge: Edge<CustomEdgeData>;
}