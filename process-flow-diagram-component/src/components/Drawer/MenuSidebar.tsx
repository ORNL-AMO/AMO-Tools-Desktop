import React, { memo, useState } from 'react';
import { ProcessFlowPart, UserDiagramOptions, processFlowDiagramParts } from '../../../../src/process-flow-types/shared-process-flow-types';
import { edgeTypeOptions, SelectListOption } from '../Flow/FlowTypes';
import { Box, Button, Divider, Grid, Paper, styled, Tab, Tabs, Typography } from '@mui/material';
import ContinuousSlider from './ContinuousSlider';
import DownloadButton from './DownloadButton';
import { UserDiagramOptionsHandlers } from '../Flow';
import TabPanel from './TabPanel';

const WaterComponent = styled(Paper)(({ theme, ...props }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  '&:hover': {
    cursor: props.draggable? 'grab' : 'no-drop',
  },
  color: theme.palette.text.secondary,
}));

const MenuSidebar = memo((props: MenuSidebarProps) => {
  const [selectedTab, setSelectedTab] = useState(0);
  

  const processFlowParts: ProcessFlowPart[] = [...processFlowDiagramParts];
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
};
  const splitterNode = processFlowParts.pop();
  return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingX: 1 }}>
        <Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
                    <Tabs value={selectedTab} onChange={handleTabChange} aria-label="diagram context tabs">
                        <Tab sx={{fontSize: '.75rem'}} label="Build" />
                        <Tab sx={{fontSize: '.75rem'}} label="Options" />
                    </Tabs>
                </Box>
          <TabPanel value={selectedTab} index={0}>    
          <Typography variant='body1' component={'i'} sx={{ fontWeight: '500', fontSize: '14px', paddingTop: '.5rem' }}>Drag plant water system components into the pane</Typography>
          
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
            </Grid>
          </Box>
          <Divider></Divider>
          <Box sx={{ flexGrow: 1, marginBottom: '2rem' }}>
            <Typography variant='body1' component={'i'} sx={{ fontWeight: '500', fontSize: '14px', paddingTop: '.5rem' }}>Utilities</Typography>
            <Grid container spacing={{ xs: 1, sm: 1, md: 2 }} columns={{ xs: 1, sm: 2, md: 4 }}>
              <Grid item xs={1} sm={2} md={2}>
                <WaterComponent className={`dndnode ${splitterNode.processComponentType}`}
                  onDragStart={(event) => onDragStart(event, splitterNode.processComponentType)}
                  draggable={true}>
                  {splitterNode.name}
                </WaterComponent>
              </Grid>
            </Grid>
          </Box>
          </TabPanel>

          <TabPanel value={selectedTab} index={1}>    
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
                <label htmlFor={'edgeThickness'} >Line Thickness</label>
                <ContinuousSlider
                  setSliderValue={props.userDiagramOptionsHandlers.handleEdgeThicknessChange}
                  value={props.userDiagramOptions.edgeThickness} />
              </Box>

              <Box display={'flex'} flexDirection={'column'} sx={{ fontSize: '.75rem', marginTop: '1rem' }}>
                <label htmlFor={'edgeThickness'} >Flow Label Size Scale</label>
                <ContinuousSlider
                  min={.5}
                  max={2}
                  step={.10}
                  unit={''}
                  setSliderValue={props.userDiagramOptionsHandlers.handleFlowLabelSizeChange}
                  value={props.userDiagramOptions.flowLabelSize} />
              </Box>


              <div style={{ margin: '.5rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                <Box display={'flex'} flexDirection={'column'} sx={{ fontSize: '.75rem', marginTop: '1rem' }}>
                  <label htmlFor="show-flow-values" className="diagram-checkbox-label">
                    <input
                      type="checkbox"
                      id={"show-flow-values"}
                      checked={props.userDiagramOptions.showFlowValues}
                      className={'diagram-checkbox'}
                      style={{ marginRight: '.5rem'}}
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
                      style={{ marginRight: '.5rem'}}
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
                      style={{ marginRight: '.5rem'}}
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
                      style={{ marginRight: '.5rem'}}
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
                      style={{ marginRight: '.5rem'}}
                      onChange={(e) => props.userDiagramOptionsHandlers.handleControlsVisible(e.target.checked)}
                    />
                    <span>Show Controls</span>
                  </label>
                </Box>
              </div>

            </div>
          </Box>
          </TabPanel>
        </Box>

        <Box display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'} paddingTop={'1rem'}>
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
  hasAssessment: boolean;
  shadowRoot;
  setIsDialogOpen: (boolean) => void;
  resetDiagramCallback: () => void;
}

