import { Box, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { edgeTypeOptions, SelectListOption } from '../Flow/FlowTypes';
import { PresetColorPicker } from './PresetColorPicker';
import { Edge, useReactFlow } from '@xyflow/react';

export default function CustomizeEdge({ edge }: CustomizeEdgeProps) {
  const { setEdges } = useReactFlow();

  const handleEdgeTypeChange = (newEdgeType: string) => {
    edge.type = newEdgeType;
    setEdges((eds) => {
      let updatedEdges = eds.map((e: Edge) => {
        let updatedEdge = {
          ...e,
        }
        if (e.id === edge.id) {
          updatedEdge.type = newEdgeType;
        }
        return updatedEdge;
      });
      return updatedEdges;
    });
  }

  const handleEdgeColorChange = (color: string) => {
    setEdges((eds) => {
      return eds.map((e: Edge) => {
        if (e.id === edge.id) {
          e.style.stroke = color;
        }
        return e;
      });
    });
  }

  const presetColors = [
    "#cd9323", "#1a53d8", "#9a2151", "#0d6416", "#8d2808",
  ];

  const selectId = `edgeType_${edge.id}`;
  return (
    <Box sx={{ marginTop: 1 }}>
          <Box display={'flex'} sx={{fontSize: '.75rem', marginTop: 2}} justifyContent={'space-between'} width={'100%'}>
            <label htmlFor={selectId} style={{fontSize: '.75rem'}}>Line Type</label>
            <select className="form-control" id={selectId} name="edgeType" style={{ marginLeft: '16px' }}
              value={edge.type}
              onChange={(e) => handleEdgeTypeChange(e.target.value)}>
              {edgeTypeOptions.map((option: SelectListOption) => {
                return (
                  <option key={option.value} value={option.value}>{option.display}</option>
                )
              })}
            </select>
          </Box>

          <Box sx={{fontSize: '.75rem'}}>
            <PresetColorPicker
              color={edge.style.stroke}
              presetColors={presetColors}
              onChangeHandler={handleEdgeColorChange}
              showPresets={true}
              label={'Pick Line Color'} />
          </Box>
    </Box>
  );
}

export interface CustomizeEdgeProps {
  edge: Edge;
}