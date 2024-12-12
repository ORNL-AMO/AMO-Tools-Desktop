import React, { memo } from 'react';
import { ProcessFlowPart, UserDiagramOptions, processFlowDiagramParts } from '../../../../src/process-flow-types/shared-process-flow-types';
import { edgeTypeOptions, SelectListOption } from '../Flow/FlowTypes';
import { Box, Button, Divider, Grid, Paper, styled, Typography } from '@mui/material';
import ContinuousSlider from '../Drawer/ContinuousSlider';
import DownloadButton from '../Sidebar/DownloadButton';

const WaterComponent = styled(Paper)(({ theme, ...props }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  '&:hover': {
    cursor: props.draggable? 'grab' : 'no-drop',
  },
  color: theme.palette.text.secondary,
}));

const MenuSidebar = memo((props: MenuSidebarProps) => {
  const processFlowParts: ProcessFlowPart[] = [...processFlowDiagramParts];
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingX: 1 }}>
        <Box>
          <Typography variant='body1' component={'i'} sx={{ fontWeight: '500', fontSize: '14px' }}>Drag plant water system components into the pane</Typography>
          <Box sx={{ flexGrow: 1, paddingY: '1rem' }}>
            <Grid container spacing={{ xs: 1, sm: 1, md: 2 }} columns={{ xs: 1, sm: 2, md: 4 }}>
              {processFlowParts.map((part: ProcessFlowPart) => (
                <Grid item xs={1} sm={2} md={2} key={part.processComponentType}>
                  <WaterComponent className={`dndnode ${part.processComponentType}`}
                    onDragStart={(event) => onDragStart(event, part.processComponentType)}
                    draggable={true}>
                    {part.name}
                  </WaterComponent>
                </Grid>
              ))}
              <Grid item xs={1} sm={2} md={2}>
                <WaterComponent className={`dndnode splitterNode`}
                  onDragStart={(event) => onDragStart(event, 'splitter-node-4')} draggable> 4-way Connection</WaterComponent>
              </Grid>
              <Grid item xs={1} sm={2} md={2}>
                <WaterComponent className={`dndnode splitterNode`}
                  onDragStart={(event) => onDragStart(event, 'splitter-node-8')} draggable> 8-way Connection</WaterComponent>
              </Grid>
            </Grid>

          </Box>


          <Divider></Divider>
          <Box sx={{ marginTop: 1, padding: '.5rem' }}>
            <div className="sidebar-actions">
              <Box display={'flex'} flexDirection={'column'} sx={{ fontSize: '.75rem' }}>
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

              <Box display={'flex'} flexDirection={'column'} sx={{ fontSize: '.75rem', marginTop: '1rem' }}>
                <label htmlFor={'edgeThickness'} >Set Line Thickness</label>
                <ContinuousSlider
                  setSliderValue={props.userDiagramOptionsHandlers.handleEdgeThicknessChange}
                  value={props.userDiagramOptions.edgeThickness} />
              </Box>


              <div style={{ margin: '.5rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                <Box display={'flex'} flexDirection={'column'} sx={{ fontSize: '.75rem', marginTop: '1rem' }}>
                  <label htmlFor="show-flow-values" className="diagram-checkbox-label">
                    <input
                      type="checkbox"
                      id={"show-flow-values"}
                      checked={props.userDiagramOptions.showFlowValues}
                      className={'diagram-checkbox'}
                      onChange={(e) => props.userDiagramOptionsHandlers.handleShowFlowValues(e.target.checked)}
                    />
                    <span>Show Connected Flow Values (Mgal)</span>
                  </label>
                </Box>

                <Box display={'flex'} flexDirection={'column'} sx={{ fontSize: '.75rem' }}>
                  <label htmlFor="edge-options" className="diagram-checkbox-label">
                    <input
                      type="checkbox"
                      id={"edge-options"}
                      checked={props.userDiagramOptions.edgeOptions.animated}
                      className={'diagram-checkbox'}
                      onChange={(e) => props.userDiagramOptionsHandlers.handleEdgeOptionsChange({animated: e.target.checked})}
                    />
                    <span>Animated Connecting Lines</span>
                  </label>
                </Box>
                
                <Box display={'flex'} flexDirection={'column'} sx={{ fontSize: '.75rem' }}>
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
                </Box>

                <Box display={'flex'} flexDirection={'column'} sx={{ fontSize: '.75rem' }}>
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
                </Box>

                <Box display={'flex'} flexDirection={'column'} sx={{ fontSize: '.75rem' }}>
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
                </Box>
              </div>

            </div>
          </Box>
        </Box>

        <Divider></Divider>
        <Box display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'}>
          <DownloadButton shadowRoot={props.shadowRoot} />
          {!props.hasAssessment &&
            <Button variant="outlined" sx={{ width: '100%' }} onClick={() => props.setIsDialogOpen(true)}>Reset Diagram</Button>
          }
        </Box>
      </Box>
  );
});
export default MenuSidebar;

export interface MenuSidebarProps {
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
  handleShowFlowValues: (enabled: boolean) => void;
  handleEdgeTypeChange: (edgeTypeOption: string) => void;
  handleEdgeOptionsChange: (edgeOptions: any) => void;
  handleEdgeThicknessChange: (event: Event, edgeThickness: number) => void;
}