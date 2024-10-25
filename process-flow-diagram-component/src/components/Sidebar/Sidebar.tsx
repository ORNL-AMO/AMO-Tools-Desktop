import React, { memo, useState } from 'react';
import { ProcessFlowPart, UserDiagramOptions, processFlowDiagramParts } from '../../../../src/process-flow-types/shared-process-flow-types';
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
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
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
            <label htmlFor="edgeType" className="diagram-label">Default Line Type</label>
            <select className="form-control diagram-select" id="edgeType" 
              name="edgeType" 
              value={props.userDiagramOptions.edgeType}
              onChange={(e) => props.userDiagramOptionsHandlers.handleEdgeTypeChange(e.target.value)}>
              {edgeTypeOptions.map((option: SelectListOption) => {
                return (
                  <option key={option.value} value={option.value}>{option.display}</option>
                )
              })}
            </select>
          </Box>

            <Box display={'flex'} flexDirection={'column'} sx={{fontSize: '.75rem', marginTop: '1rem'}}>
            <label htmlFor={'edgeThickness'} >Set Line Thickness</label>
            <ContinuousSlider 
              setSliderValue={props.userDiagramOptionsHandlers.handleEdgeThicknessChange} 
              value={props.userDiagramOptions.edgeThickness}/>
          </Box>
          
            <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
            <label htmlFor="directional-arrows" className="diagram-checkbox-label">
                <input
                  type="checkbox"
                  id={"directional-arrows"}
                  checked={props.userDiagramOptions.directionalArrowsVisible}
                  className={'diagram-checkbox'}
                  onChange={(e) => props.userDiagramOptionsHandlers.handleShowMarkerEndArrows(e.target.checked)}
                />
                <span>Show Directional Arrows</span>
              </label>
              <label htmlFor="minimap-visible" className="diagram-checkbox-label">
                <input
                  type="checkbox"
                  id={"minimap-visible"}
                  checked={props.userDiagramOptions.minimapVisible}
                  className={'diagram-checkbox'}
                  onChange={(e) => props.userDiagramOptionsHandlers.handleMinimapVisible(e.target.checked)}
                />
                <span>Show Minimap</span>
              </label>
              <label htmlFor='controls-visible' className="diagram-checkbox-label">
                <input
                  type="checkbox"
                  id='controls-visible'
                  checked={props.userDiagramOptions.controlsVisible}
                  className={'diagram-checkbox'}
                  onChange={(e) => props.userDiagramOptionsHandlers.handleControlsVisible(e.target.checked)}
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
  userDiagramOptions: UserDiagramOptions;
  userDiagramOptionsHandlers: UserDiagramOptionsHandlers;
  resetDiagramCallback: () => void;
  setIsDialogOpen: (boolean) => void;
  hasAssessment: boolean;
  shadowRoot;
}

export interface UserDiagramOptionsHandlers {
  handleMinimapVisible: (enabled: boolean) => void;
  handleShowMarkerEndArrows: (enabled: boolean) => void;
  handleControlsVisible: (enabled: boolean) => void;
  handleEdgeTypeChange: (edgeTypeOption: string) => void;
  handleEdgeThicknessChange: (event: Event, edgeThickness: number) => void;
}