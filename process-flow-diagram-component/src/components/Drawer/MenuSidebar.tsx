import React, { memo, useState } from 'react';
import { DiagramSettings, ParentContainerDimensions, ProcessFlowPart, UserDiagramOptions, processFlowDiagramParts } from '../../../../src/process-flow-types/shared-process-flow-types';
import { edgeTypeOptions, SelectListOption } from '../Flow/FlowTypes';
import { Box, Button, Divider, Grid, List, ListItem, ListItemText, Paper, styled, Tab, Tabs, Typography } from '@mui/material';
import ContinuousSlider from './ContinuousSlider';
import DownloadButton from './DownloadButton';
import { UserDiagramOptionsHandlers } from '../Flow';
import TabPanel from './TabPanel';
import { flowDecimalPrecisionOptions } from '../../../../src/process-flow-types/shared-process-flow-constants';

const WaterComponent = styled(Paper)(({ theme, ...props }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  '&:hover': {
    cursor: props.draggable ? 'grab' : 'no-drop',
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

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      paddingX: 0
    }}>
      <Box sx={{ marginBottom: '1rem' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs value={selectedTab} onChange={handleTabChange} aria-label="diagram context tabs">
            <Tab sx={{ fontSize: '.75rem' }} label="Build" />
            <Tab sx={{ fontSize: '.75rem' }} label="Options" />
            <Tab sx={{ fontSize: '.75rem' }} label="Help" />
          </Tabs>
        </Box>
        <TabPanel value={selectedTab} index={0} >
          <Typography variant='h2' component={'div'} sx={{ fontSize: '16px', padding: '.5rem', marginTop: '.5rem', whiteSpace: "normal" }}>
            Drag plant water system components into the pane
          </Typography>
          <Box sx={{ flexGrow: 1, paddingY: '1rem', paddingX: '.5rem' }}>
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
        </TabPanel>

        <TabPanel value={selectedTab} index={1} diagramParentDimensions={props.diagramParentDimensions}>
          <Box paddingX={'.5rem'}>
            <div className="sidebar-options">
            <Box className={'sidebar-option-container'}>
                  <label htmlFor={'unitsOfMeasure'}>Units of Measure</label>
                  <select className="form-control diagram-select" id={'unitsOfMeasure'} name="unitsOfMeasure"
                    value={props.settings.unitsOfMeasure}
                    disabled={props.hasAssessment}
                    onChange={props.userDiagramOptionsHandlers.handleUnitsOfMeasureChange}>
                    <option key={'imperial'} value={'Imperial'}>Imperial</option>
                    <option key={'metric'} value={'Metric'}>Metric</option>
                  </select>
                </Box>
                
            <Box className={'sidebar-option-container'}>
                  <label htmlFor={'flowDecimalPrecision'}>Decimal Precision</label>
                  <select className="form-control diagram-select" id={'flowDecimalPrecision'} name="flowDecimalPrecision"
                    value={props.settings.flowDecimalPrecision}
                    onChange={props.userDiagramOptionsHandlers.handleFlowDecimalPrecisionChange}>
                    {flowDecimalPrecisionOptions.map((option) => {
                    return (
                      <option key={`flowDecimalPrecision_${option.value}`} value={option.value}>{option.display}</option>
                    )
                  })}
                  </select>
                </Box>

              <Box className={'sidebar-option-container'}>
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

              <Box className={'sidebar-option-container'}>
                <label htmlFor={'edgeThickness'} >Line Thickness</label>
                <ContinuousSlider
                  setSliderValue={props.userDiagramOptionsHandlers.handleEdgeThicknessChange}
                  value={props.userDiagramOptions.edgeThickness} />
              </Box>

              <Box className={'sidebar-option-container'}>
                <label htmlFor={'edgeThickness'} >Flow Label Size Scale</label>
                <ContinuousSlider
                  min={.5}
                  max={2}
                  step={.10}
                  unit={''}
                  setSliderValue={props.userDiagramOptionsHandlers.handleFlowLabelSizeChange}
                  value={props.userDiagramOptions.flowLabelSize} />
              </Box>

              <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                <Box className={'sidebar-option-container checkbox'} display={'flex'} flexDirection={'column'} sx={{ fontSize: '.75rem', marginTop: '1rem' }}>
                  <label htmlFor="show-flow-values" className="diagram-checkbox-label">
                    <input
                      type="checkbox"
                      id={"show-flow-values"}
                      checked={props.userDiagramOptions.showFlowValues}
                      className={'diagram-checkbox'}
                      style={{ marginRight: '.5rem' }}
                      onChange={(e) => props.userDiagramOptionsHandlers.handleShowFlowValues(e.target.checked)}
                    />
                    <span>Show Connected Flow Values (Mgal)</span>
                  </label>
                </Box>

                <Box className={'sidebar-option-container checkbox'} >
                  <label htmlFor="edge-options" className="diagram-checkbox-label">
                    <input
                      type="checkbox"
                      id={"edge-options"}
                      checked={props.userDiagramOptions.edgeOptions.animated}
                      className={'diagram-checkbox'}
                      style={{ marginRight: '.5rem' }}
                      onChange={(e) => props.userDiagramOptionsHandlers.handleEdgeOptionsChange({ animated: e.target.checked })}
                    />
                    <span>Animated Connecting Lines</span>
                  </label>
                </Box>

                <Box className={'sidebar-option-container checkbox'} >
                  <label htmlFor="directional-arrows" className="diagram-checkbox-label">
                    <input
                      type="checkbox"
                      id={"directional-arrows"}
                      checked={props.userDiagramOptions.directionalArrowsVisible}
                      className={'diagram-checkbox'}
                      style={{ marginRight: '.5rem' }}
                      onChange={(e) => props.userDiagramOptionsHandlers.handleShowMarkerEndArrows(e.target.checked)}
                    />
                    <span>Show Directional Arrows</span>
                  </label>
                </Box>

                <Box className={'sidebar-option-container checkbox'}>
                  <label htmlFor="minimap-visible" className="diagram-checkbox-label">
                    <input
                      type="checkbox"
                      id={"minimap-visible"}
                      checked={props.userDiagramOptions.minimapVisible}
                      className={'diagram-checkbox'}
                      style={{ marginRight: '.5rem' }}
                      onChange={(e) => props.userDiagramOptionsHandlers.handleMinimapVisible(e.target.checked)}
                    />
                    <span>Show Minimap</span>
                  </label>
                </Box>

                <Box className={'sidebar-option-container checkbox'}>
                  <label htmlFor='controls-visible' className="diagram-checkbox-label">
                    <input
                      type="checkbox"
                      id='controls-visible'
                      checked={props.userDiagramOptions.controlsVisible}
                      className={'diagram-checkbox'}
                      style={{ marginRight: '.5rem' }}
                      onChange={(e) => props.userDiagramOptionsHandlers.handleControlsVisible(e.target.checked)}
                    />
                    <span>Show Controls</span>
                  </label>
                </Box>
              </div>

            </div>
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Box sx={{height: '100%', whiteSpace: "normal", padding: '.5rem' }}>
            <Typography variant='h2' component={'div'} sx={{ fontSize: '16px', paddingTop: '.5rem' }}>
              Many diagram actions support keyboard input and key combinations:
            </Typography>
            <Box display={'flex'} flexDirection={'column'} maxWidth={350} sx={{ fontSize: '.75rem' }}>
              <List dense>
                {keyInputDirections.map((direction, index: number) => {
                  const key: string = `${direction.primary}_${index}`;
                  return (
                    <ListItem sx={{ padding: 0 }} key={key}>
                      <ListItemText
                        primary={
                          direction.primary
                        }
                        primaryTypographyProps={{ fontSize: '.85rem' }}
                        secondary={
                          direction.secondary
                        }
                        secondaryTypographyProps={{ fontSize: '.75rem' }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          </Box>
        </TabPanel>

      </Box>

      <Box display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'} paddingTop={'1rem'}>
        <DownloadButton shadowRoot={props.shadowRoot} />
        {!props.hasAssessment &&
          <Button variant="outlined" color="secondary" sx={{ width: '100%' }} onClick={() => props.setIsDialogOpen(true)}>Reset Diagram</Button>
        }
      </Box>
    </Box>
  );
});
export default MenuSidebar;

export interface MenuSidebarProps {
  diagramParentDimensions: ParentContainerDimensions,
  userDiagramOptions: UserDiagramOptions;
  settings: DiagramSettings;
  userDiagramOptionsHandlers: UserDiagramOptionsHandlers;
  hasAssessment: boolean;
  shadowRoot;
  setIsDialogOpen: (boolean) => void;
  resetDiagramCallback: () => void;
}

const keyInputDirections = [
  { primary: 'Move a component', secondary: 'Press arrow keys to move the component. Use Shift + Arrow for quicker movement' },
  { primary: 'Select multiple components or lines', secondary: 'Hold down CTRL while clicking components or lines' },
  { primary: 'Delete a component or line', secondary: 'Select the component or line and hit Backspace or Delete' },
  { primary: 'Zoom In/Out', secondary: 'Use the mouse wheel to zoom in and out' },
]