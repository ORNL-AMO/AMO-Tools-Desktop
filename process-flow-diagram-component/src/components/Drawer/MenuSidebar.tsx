import React, { ChangeEvent, memo, useState } from 'react';
import { Box, Button, Chip, Divider, Grid, InputAdornment, List, ListItem, ListItemText, Paper, styled, Tab, Tabs, Typography, useTheme } from '@mui/material';
import ContinuousSlider from './ContinuousSlider';
import DownloadButton from './DownloadButton';
import TabPanel from './TabPanel';
import { useAppDispatch, useAppSelector } from '../../hooks/state';
import { conductivityUnitChange, defaultEdgeTypeChange, diagramOptionsChange, electricityCostChange, flowDecimalPrecisionChange, OptionsDependentState, setDialogOpen, showMarkerEndArrows, unitsOfMeasureChange } from '../Diagram/diagramReducer';
import { RootState, selectHasAssessment } from '../Diagram/store';
import { edgeTypeOptions, SelectListOption } from '../Diagram/FlowTypes';
import ValidationWindow, { ValidationWindowLocation } from '../Diagram/ValidationWindow';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { getIsDiagramValid } from '../../validation/Validation';
import { blue } from '@mui/material/colors';
import { ParentContainerDimensions, NodeErrors, ProcessFlowPart, processFlowDiagramParts, UserDiagramOptions, flowDecimalPrecisionOptions, conductivityUnitOptions } from 'process-flow-lib';
import DiagramResults from './DiagramResults';
import InputField from '../StyledMUI/InputField';

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
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const diagramParentDimensions: ParentContainerDimensions = useAppSelector((state: RootState) => state.diagram.diagramParentDimensions);
  const hasAssessment = useAppSelector(selectHasAssessment);
  
  const edgeType = useAppSelector((state: RootState) => state.diagram.diagramOptions.edgeType);
  const strokeWidth = useAppSelector((state: RootState) => state.diagram.diagramOptions.strokeWidth);
  const flowLabelSize = useAppSelector((state: RootState) => state.diagram.diagramOptions.flowLabelSize);
  const showFlowLabels = useAppSelector((state: RootState) => state.diagram.diagramOptions.showFlowLabels);

  const animated = useAppSelector((state: RootState) => state.diagram.diagramOptions.animated);
  const minimapVisible = useAppSelector((state: RootState) => state.diagram.diagramOptions.minimapVisible);
  const controlsVisible = useAppSelector((state: RootState) => state.diagram.diagramOptions.controlsVisible);
  const directionalArrowsVisible = useAppSelector((state: RootState) => state.diagram.diagramOptions.directionalArrowsVisible);
  
  const flowDecimalPrecision = useAppSelector((state: RootState) => state.diagram.settings.flowDecimalPrecision);
  const unitsOfMeasure = useAppSelector((state: RootState) => state.diagram.settings.unitsOfMeasure);
  const electricityUnitCost = useAppSelector((state: RootState) => state.diagram.settings.electricityCost);
  const conductivityUnit = useAppSelector((state: RootState) => state.diagram.settings.conductivityUnit);
  const validationWindowLocation: ValidationWindowLocation = useAppSelector((state) => state.diagram.validationWindowLocation);
  const nodeErrors: NodeErrors = useAppSelector((state: RootState) => state.diagram.nodeErrors);
  const isDiagramValid = getIsDiagramValid(nodeErrors);

  const [selectedTab, setSelectedTab] = useState(0);
  const processFlowParts: ProcessFlowPart[] = [...processFlowDiagramParts];
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleSliderChange = (event, newValue: number, optionsProp: keyof UserDiagramOptions, updateDependencies?: OptionsDependentState[]) => {
    dispatch(diagramOptionsChange({
      optionsProp: optionsProp,
      updatedValue: newValue,
      updateDependencies: updateDependencies
    }))
  };

  const handleGenericCheckboxChange = (event: ChangeEvent<HTMLInputElement>, optionsProp: keyof UserDiagramOptions, updateDependencies?: OptionsDependentState[]) => {
    dispatch(diagramOptionsChange({
      optionsProp: optionsProp,
      updatedValue: event.target.checked,
      updateDependencies: updateDependencies
    }))
  };

  const handleElectricityCostChange = (event: any) => {
          const updatedValue = event.target.value === "" ? null : Number(event.target.value);
          dispatch(electricityCostChange(updatedValue));
  };

  const summingNode = processFlowParts.pop();
  const alertsCount = Object.entries(nodeErrors).length > 0 ? Object.entries(nodeErrors).length : '';

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      paddingX: 0
    }}>
      <Box sx={{ 
        padding: '0rem .5rem 2rem 0rem',
        height: '40%',
        }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs value={selectedTab} onChange={handleTabChange} aria-label="diagram context tabs">
            <Tab sx={{ fontSize: '.75rem' }} label="Build" />
            <Tab sx={{ fontSize: '.75rem' }} label="Options" />
            <Tab sx={{ fontSize: '.75rem' }} label="Help" />
            {!isDiagramValid && validationWindowLocation === 'alerts-tab'? 
              <Tab sx={{ fontSize: '.75rem' }} label={
                <Box display={'block'}>
                  <Chip
                    icon={
                      <NotificationsIcon sx={{ width: '.75em', color: selectedTab === 3? `${theme.palette.primary.main} !important` : 'inherit' }} />}
                    sx={{ backgroundColor: selectedTab === 3 ? blue[50] : '#ececec'}
                    }
                    label={<Typography variant="subtitle1" component={'span'} sx={{fontSize: '.75rem',  color: selectedTab === 3? `${theme.palette.primary.main} !important` : '#616161' }}>{alertsCount}</Typography>}
                  />
                <Typography variant="subtitle1" component={'span'} sx={{fontSize: '.75rem', marginLeft: '.25rem', color: selectedTab === 3? `${theme.palette.primary.main} !important` : '#inherit'}}>Alerts</Typography>
                </Box>
              } />
              : 
              <Tab sx={{ fontSize: '.75rem' }} label="Alerts" disabled />
            }

          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0} >
          <Typography variant='h2' component={'div'} sx={{ fontSize: '16px', padding: '.5rem', marginTop: '.5rem', whiteSpace: "normal" }}>
            Drag site water system components into the pane
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
              {/* <Grid item xs={1} sm={2} md={2}>
                <WaterComponent className={`dndnode splitterNode`}
                  onDragStart={(event) => onDragStart(event, 'splitter-node-4')} draggable> 4-way Connection</WaterComponent>
              </Grid>
              <Grid item xs={1} sm={2} md={2}>
                <WaterComponent className={`dndnode splitterNode`}
                  onDragStart={(event) => onDragStart(event, 'splitter-node-8')} draggable> 8-way Connection</WaterComponent>
              </Grid> */}
            </Grid>
            </Box>

          {/* <Box sx={{ flexGrow: 1 }}>
            <Typography variant='body1' component={'i'} sx={{ fontWeight: '500', fontSize: '14px' }}>Utilities</Typography>
            <Grid container spacing={{ xs: 1, sm: 1, md: 2 }} columns={{ xs: 1, sm: 2, md: 4 }} paddingTop={'.25rem'}>
              <Grid item xs={1} sm={2} md={2}>
                <WaterComponent className={`dndnode ${summingNode.processComponentType}`}
                  onDragStart={(event) => onDragStart(event, summingNode.processComponentType)}
                  draggable={true}>
                  {summingNode.name}
                </WaterComponent>
              </Grid>
            </Grid>
          </Box> */}

          <Box display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'} paddingTop={'1rem'}>
            <DownloadButton shadowRoot={props.shadowRootRef} />
            {!hasAssessment &&
              <Button variant="outlined" color="error" sx={{ width: '100%' }} onClick={() => dispatch(setDialogOpen())}>Reset Diagram</Button>
            }
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={1} diagramParentDimensions={diagramParentDimensions}>
          <Box paddingX={'.5rem'}>
            <div className="sidebar-options">
            <Box className={'sidebar-option-container'}>
                  <label htmlFor={'unitsOfMeasure'}>Units of Measure</label>
                  <select className="form-control diagram-select" id={'unitsOfMeasure'} name="unitsOfMeasure"
                    value={unitsOfMeasure}
                    disabled={hasAssessment}
                    onChange={(e) => dispatch(unitsOfMeasureChange(e.target.value))}>
                    <option key={'imperial'} value={'Imperial'}>Imperial</option>
                    <option key={'metric'} value={'Metric'}>Metric</option>
                  </select>
                </Box>

              <Box className={'sidebar-option-container'} padding={'.5rem'}>
                <InputField
                  name={'electricityCost'}
                  id={'electricityCost'}
                  label={'Electricity Cost ($/kWh)'}
                  type={'number'}
                  size="small"
                  value={electricityUnitCost ?? 0}
                  onChange={(event) => handleElectricityCostChange(event)}
                  sx={{ width: '100%' }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end" sx={{ zIndex: 1 }}>
                      <span style={{ zIndex: 1, background: 'white' }}>$/kWh</span>
                    </InputAdornment>,
                  }}
                />
              </Box>
                
            <Box className={'sidebar-option-container'}>
                  <label htmlFor={'flowDecimalPrecision'}>Decimal Precision</label>
                  <select className="form-control diagram-select" id={'flowDecimalPrecision'} name="flowDecimalPrecision"
                    value={flowDecimalPrecision}
                    onChange={(e) => dispatch(flowDecimalPrecisionChange(e.target.value))}>
                    {flowDecimalPrecisionOptions.map((option) => {
                    return (
                      <option key={`flowDecimalPrecision_${option.value}`} value={option.value}>{option.display}</option>
                    )
                  })}
                  </select>
                </Box>

                <Box className={'sidebar-option-container'}>
                  <label htmlFor={'conductivityUnit'}>Conductivity Unit</label>
                  <select className="form-control diagram-select" id={'conductivityUnit'} name="conductivityUnit"
                    value={conductivityUnit}
                    onChange={(e) => dispatch(conductivityUnitChange(e.target.value))}>
                    {conductivityUnitOptions.map((option) => {
                    return (
                      <option key={`conductivityUnit_${option.value}`} value={option.value}>{option.display}</option>
                    )
                  })}
                  </select>
                </Box>

              <Box className={'sidebar-option-container'}>
                <label htmlFor="edgeType" className="diagram-label">Default Line Type</label>
                <select className="form-control diagram-select" id="edgeType"
                  name="edgeType"
                  value={edgeType}
                  onChange={(e) => dispatch(defaultEdgeTypeChange(e.target.value))}>
                  {edgeTypeOptions.map((option: SelectListOption) => {
                    return (
                      <option key={option.value} value={option.value}>{option.display}</option>
                    )
                  })}
                </select>
              </Box>

              <Box className={'sidebar-option-container'}>
                <label htmlFor={'strokeWidth'} >Line Thickness</label>
                <ContinuousSlider
                  setSliderValue={(e, newValue) => handleSliderChange(e, newValue, 'strokeWidth', ['updateEdgeProperties'])}
                  value={strokeWidth} />
              </Box>

              <Box className={'sidebar-option-container'}>
                <label htmlFor={'flowLabelSize'} >Flow Label Size Scale</label>
                <ContinuousSlider
                  min={.5}
                  max={2}
                  step={.10}
                  unit={''}
                  setSliderValue={(e, newValue) => handleSliderChange(e, newValue, 'flowLabelSize', ['updateEdges'])}
                  value={flowLabelSize} />
              </Box>

              <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                <Box className={'sidebar-option-container checkbox'} display={'flex'} flexDirection={'column'} sx={{ fontSize: '.75rem', marginTop: '1rem' }}>
                  <label htmlFor="show-flow-values" className="diagram-checkbox-label">
                    <input
                      type="checkbox"
                      id={"show-flow-values"}
                      checked={showFlowLabels}
                      className={'diagram-checkbox'}
                      style={{ marginRight: '.5rem' }}
                      onChange={(e) => handleGenericCheckboxChange(e, 'showFlowLabels', ['updateEdges'])}
                    />
                    <span>Show Connected Flow Values (Mgal)</span>
                  </label>
                </Box>

                <Box className={'sidebar-option-container checkbox'} >
                  <label htmlFor="edge-options" className="diagram-checkbox-label">
                    <input
                      type="checkbox"
                      id={"edge-options"}
                      checked={animated}
                      className={'diagram-checkbox'}
                      style={{ marginRight: '.5rem' }}
                      onChange={(e) => handleGenericCheckboxChange(e, 'animated', ['updateEdgeProperties'])}
                    />
                    <span>Animated Connecting Lines</span>
                  </label>
                </Box>

                <Box className={'sidebar-option-container checkbox'} >
                  <label htmlFor="directional-arrows" className="diagram-checkbox-label">
                    <input
                      type="checkbox"
                      id={"directional-arrows"}
                      checked={directionalArrowsVisible}
                      className={'diagram-checkbox'}
                      style={{ marginRight: '.5rem' }}
                      onChange={(e) => dispatch(showMarkerEndArrows(e.target.checked))}
                    />
                    <span>Show Directional Arrows</span>
                  </label>
                </Box>

                <Box className={'sidebar-option-container checkbox'}>
                  <label htmlFor="minimap-visible" className="diagram-checkbox-label">
                    <input
                      type="checkbox"
                      id={"minimap-visible"}
                      checked={minimapVisible}
                      className={'diagram-checkbox'}
                      style={{ marginRight: '.5rem' }}
                      onChange={(e) => handleGenericCheckboxChange(e, 'minimapVisible')}
                    />
                    <span>Show Minimap</span>
                  </label>
                </Box>

                <Box className={'sidebar-option-container checkbox'}>
                  <label htmlFor='controls-visible' className="diagram-checkbox-label">
                    <input
                      type="checkbox"
                      id='controls-visible'
                      checked={controlsVisible}
                      className={'diagram-checkbox'}
                      style={{ marginRight: '.5rem' }}
                      onChange={(e) => handleGenericCheckboxChange(e, 'controlsVisible')}
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

        <TabPanel value={selectedTab} index={3}>
          <Box sx={{height: '100%', whiteSpace: "normal", padding: '.5rem' }}>
                {!isDiagramValid && validationWindowLocation === 'alerts-tab' &&
                  <ValidationWindow></ValidationWindow>
                }
          </Box>
        </TabPanel>

        <Box>
          <Divider sx={{ margin: '1rem' }} />
          {/* <DiagramResults /> */}
        </Box>
      </Box>
    </Box>
  );
});
export default MenuSidebar;

export interface MenuSidebarProps {
  shadowRootRef: any;
}

const keyInputDirections = [
  { primary: 'Move a component', secondary: 'Press arrow keys to move the component. Use Shift + Arrow for quicker movement' },
  { primary: 'Select multiple components or lines', secondary: 'Hold down CTRL while clicking components or lines' },
  { primary: 'Delete a component or line', secondary: 'Select the component or line and hit Backspace or Delete' },
  { primary: 'Zoom In/Out', secondary: 'Use the mouse wheel to zoom in and out' },
]