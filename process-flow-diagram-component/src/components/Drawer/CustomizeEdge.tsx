import { Box } from '@mui/material';
import { edgeTypeOptions, SelectListOption } from '../Flow/FlowTypes';
import { PresetColorPicker } from './PresetColorPicker';
import { Edge, useReactFlow } from '@xyflow/react';
import { useEffect, useState } from 'react';
import useUserEventDebounce from '../../hooks/useUserEventDebounce';
import { CustomEdgeData, UserDiagramOptions } from '../../../../src/process-flow-types/shared-process-flow-types';

export default function CustomizeEdge({ edge, userDiagramOptions }: CustomizeEdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgeColor, setEdgeColor] = useState(edge.style.stroke);
  const debouncedEdgeColor = useUserEventDebounce<string>(edgeColor, 50);

  useEffect(() => {
    setEdges((eds) => {
          return eds.map((e: Edge) => {
            if (e.id === edge.id) {
              e.style.stroke = debouncedEdgeColor;
            }
            return e;
          });
        });
  }, [debouncedEdgeColor]);

  const handlePresetColorChange = (edgeColor) => {
    setEdgeColor(edgeColor)
    setEdges((eds) => {
          return eds.map((e: Edge) => {
            if (e.id === edge.id) {
              e.style.stroke = edgeColor;
            }
            return e;
          });
        });
  };

  const getCurrentEdgeType = (): string => {
    return edge.data.hasOwnEdgeType !== undefined? edge.data.hasOwnEdgeType : userDiagramOptions.edgeType;
  }

  const handleEdgeTypeChange = (newEdgeType: string) => {
    edge.type = newEdgeType;
    setEdges((eds) => {
      let updatedEdges = eds.map((e: Edge<CustomEdgeData>) => {
        let updatedEdge = {
          ...e,
        }
        if (e.id === edge.id) {
          updatedEdge.data = {
            ...e.data,
            hasOwnEdgeType: newEdgeType
          }
          updatedEdge.type = newEdgeType;
        }
        return updatedEdge;
      });
      return updatedEdges;
    });
  }

  const presetColors = [
    "#cd9323", "#1a53d8", "#9a2151", "#0d6416", "#8d2808",
  ];

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
            <PresetColorPicker
              color={edge.style.stroke}
              presetColors={presetColors}
              pickerChangeHandler={setEdgeColor}
              presetChangeHandler={handlePresetColorChange}
              showPresets={true}
              label={'Pick Line Color'} />
          </Box>
    </Box>
  );
}

export interface CustomizeEdgeProps {
  edge: Edge<CustomEdgeData>;
  userDiagramOptions: UserDiagramOptions;
}