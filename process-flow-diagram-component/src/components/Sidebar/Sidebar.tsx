import React, { memo, useState } from 'react';
import { ProcessFlowPart, processFlowDiagramParts } from '../../../../src/process-flow-types/shared-process-flow-types';
import { edgeTypeOptions, SelectListOption } from '../Flow/FlowTypes';
import { Box, Button, Divider, Grid, Paper, styled, Typography } from '@mui/material';
import DownloadButton from './DownloadButton';
import ContinuousSlider from '../Drawer/ContinuousSlider';
import { Edge, useReactFlow } from '@xyflow/react';

const WaterComponent = styled(Paper)(({ theme, ...props }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  '&:hover': {
    cursor: props.draggable? 'grab' : 'no-drop',
  },
  color: theme.palette.text.secondary,
}));

const Sidebar = memo((props: SidebarProps) => {
  const processFlowParts: ProcessFlowPart[] = [...processFlowDiagramParts];
  const { getEdges, setEdges } = useReactFlow();
  const edges = getEdges();
  const currentEdgeThickness: number = Number(edges.length > 0 && edges[0].style.strokeWidth);
  const [edgeLineThickness, setEdgeLineThickness] = useState<number | number[]>(currentEdgeThickness);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleEdgeThicknessChange = (event: Event, newValue: number) => {
    setEdgeLineThickness(newValue);
    setEdges((eds) => {
      let updatedEdges = eds.map((e: Edge) => {
        let updatedEdge = {
          ...e,
          style: {
            ...e.style,
            strokeWidth: newValue
          }
        }
        return updatedEdge;
      });
      return updatedEdges;
    });
  };

  return (
    <aside>
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingX: 1 }}>
        <Box>
          <Typography variant='body1' component={'i'} sx={{ fontWeight: '500', fontSize: '14px' }}>Drag plant water system components into the pane</Typography>
          <Box sx={{ flexGrow: 1, paddingY: '1rem' }}>
            <Grid container spacing={{ xs: 1, md: 2 }} columns={{ xs: 3, sm: 8, md: 12 }}>
              {processFlowParts.map((part: ProcessFlowPart) => (
                <Grid item xs={2} sm={4} md={4} key={part.processComponentType}>
                  <WaterComponent className={`dndnode ${part.processComponentType}`}
                    onDragStart={(event) => onDragStart(event, part.processComponentType)}
                    draggable={true}
                    >
                    {part.name}
                  </WaterComponent>
                </Grid>
              ))}
              <Grid item xs={2} sm={4} md={4}>
                <WaterComponent className={`dndnode splitterNode`}
                  onDragStart={(event) => onDragStart(event, 'splitter-node-4')} draggable> 4-way Connection</WaterComponent>
              </Grid>
              <Grid item xs={2} sm={4} md={4}>
                <WaterComponent className={`dndnode splitterNode`}
                  onDragStart={(event) => onDragStart(event, 'splitter-node-8')} draggable> 8-way Connection</WaterComponent>
              </Grid>
            </Grid>

          </Box>


        <Divider></Divider>
        <Box sx={{marginTop: 1, padding: '.5rem'}}>
          <div className="sidebar-actions">
            <Box display={'flex'} flexDirection={'column'}  sx={{fontSize: '.75rem'}}>
            <label htmlFor="edgeType" className="diagram-label">Set Line Type</label>
            <select className="form-control diagram-select" id="edgeType" name="edgeType" onChange={(e) => props.edgeTypeChangeCallback(e.target.value)}>
              {edgeTypeOptions.map((option: SelectListOption) => {
                return (
                  <option key={option.value} value={option.value}>{option.display}</option>
                )
              })}
            </select>
          </Box>

            <Box display={'flex'} flexDirection={'column'} sx={{fontSize: '.75rem', marginTop: '1rem'}}>
            <label htmlFor={'edgeThickness'} >Set Line Thickness</label>
            <ContinuousSlider setSliderValue={handleEdgeThicknessChange} value={edgeLineThickness}/>
          </Box>
          
            <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
            <label htmlFor="directional-arrows" className="diagram-checkbox-label">
                <input
                  type="checkbox"
                  id={"directional-arrows"}
                  checked={props.directionalArrowsVisible}
                  className={'diagram-checkbox'}
                  onChange={(e) => props.handleShowMarkerEndArrows(e.target.checked)}
                />
                <span>Show Directional Arrows</span>
              </label>
              <label htmlFor="minimap-visible" className="diagram-checkbox-label">
                <input
                  type="checkbox"
                  id={"minimap-visible"}
                  className={'diagram-checkbox'}
                  onChange={(e) => props.minimapVisibleCallback(e.target.checked)}
                />
                <span>Show Minimap</span>
              </label>
              <label htmlFor='controls-visible' className="diagram-checkbox-label">
                <input
                  type="checkbox"
                  id='controls-visible'
                  checked={props.controlsVisible}
                  className={'diagram-checkbox'}
                  onChange={(e) => props.controlsVisibleCallback(e.target.checked)}
                />
                <span>Show Controls</span>
              </label>
            </div>

            <div className="sidebar-action-buttons">
              <DownloadButton shadowRoot={props.shadowRoot} />
            </div>
          </div>
        </Box>
        </Box>

        {!props.hasAssessment &&
          <Box>
            <Button variant="outlined" sx={{width: '100%'}} onClick={() => props.setIsDialogOpen(true)}>Reset Diagram</Button>
          </Box>
        }
      </Box>
    </aside>
  );
});
export default Sidebar;

export interface SidebarProps {
  minimapVisibleCallback: (enabled: boolean) => void;
  handleShowMarkerEndArrows: (enabled: boolean) => void;
  controlsVisible: boolean;
  directionalArrowsVisible: boolean;
  controlsVisibleCallback: (enabled: boolean) => void;
  edgeTypeChangeCallback: (edgeTypeOption: string) => void;
  resetDiagramCallback: () => void;
  setIsDialogOpen: (boolean) => void;
  hasAssessment: boolean;
  shadowRoot;
}