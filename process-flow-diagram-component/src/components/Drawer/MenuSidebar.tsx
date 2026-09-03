import React, { ChangeEvent, memo, useState } from 'react';
import { Badge, Box, Button, Divider, Grid, InputAdornment, List, ListItem, ListItemText, Paper, styled, Tab, Tabs, Typography, useTheme, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Switch } from '@mui/material';
import ContinuousSlider from './ContinuousSlider';
import DownloadButton from './DownloadButton';
import TabPanel from './TabPanel';
import { useAppDispatch, useAppSelector } from '../../hooks/state';
import { conductivityUnitChange, defaultEdgeTypeChange, diagramOptionsChange, electricityCostChange, flowDecimalPrecisionChange, OptionsDependentState, showMarkerEndArrows, unitsOfMeasureChange, setPaletteColors, getPaletteColorForType } from '../Diagram/diagramReducer';
import { setDialogOpen } from '../Diagram/uiSlice';
import { RootState, selectFlowConfidenceEnabled, selectHasAssessment, selectNodes } from '../Diagram/store';
import { edgeTypeOptions, SelectListOption } from '../Diagram/FlowTypes';
import ValidationWindow, { ValidationWindowLocation } from '../Diagram/ValidationWindow';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { DiagramFlowErrors, ProcessFlowPart, processFlowDiagramParts, UserDiagramOptions, flowDecimalPrecisionOptions, conductivityUnitOptions, getContrastTextColor, getIsDiagramValid, WaterProcessComponentType } from 'process-flow-lib';
import DiagramResults from './DiagramResults';
import InputField from '../StyledMUI/InputField';
import { Node } from '@xyflow/react';
import TextField from '@mui/material/TextField';
import { setDiagramNotes } from '../Diagram/diagramReducer';
import ColorPaletteDropdown, { allPalettes } from "./ColorPaletteDropdown"
import ColorPicker from "./ColorPicker"
import ResetColorButton from "./ResetColorButton"
const WaterComponent = styled(Paper)(({ theme, ...props }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  '&:hover': {
    cursor: props.draggable ? 'grab' : 'no-drop',
  },
  color: theme.palette.text.secondary,
}));

const sectionLabelSx = {
  display: 'block',
  fontSize: '.7rem',
  lineHeight: 1.4,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  marginBottom: '.5rem',
};

const MenuSidebar = memo((props: MenuSidebarProps) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const diagramNotes = useAppSelector((state) => state.diagram.diagramNotes);
  const paletteColors = useAppSelector((state: RootState) => state.diagram.diagramOptions.paletteColors);
  const selectedPaletteIdx = allPalettes.findIndex((palette) => palette.every((color, i) => color?.toLowerCase() === paletteColors?.[i]?.toLowerCase()));
  const hasAssessment = useAppSelector(selectHasAssessment);
  const edgeType = useAppSelector((state: RootState) => state.diagram.diagramOptions.edgeType);
  const strokeWidth = useAppSelector((state: RootState) => state.diagram.diagramOptions.strokeWidth);
  const flowLabelSize = useAppSelector((state: RootState) => state.diagram.diagramOptions.flowLabelSize);
  const showFlowLabels = useAppSelector((state: RootState) => state.diagram.diagramOptions.showFlowLabels);

  const animated = useAppSelector((state: RootState) => state.diagram.diagramOptions.animated);
  const minimapVisible = useAppSelector((state: RootState) => state.diagram.diagramOptions.minimapVisible);
  const controlsVisible = useAppSelector((state: RootState) => state.diagram.diagramOptions.controlsVisible);
  const directionalArrowsVisible = useAppSelector((state: RootState) => state.diagram.diagramOptions.directionalArrowsVisible);
  const colorEdgesByConfidence = useAppSelector((state: RootState) => state.diagram.diagramOptions.colorEdgesByConfidence);
  const showFlowConfidenceOnLabel = useAppSelector((state: RootState) => state.diagram.diagramOptions.showFlowConfidenceOnLabel);
  const flowConfidenceEnabled = useAppSelector(selectFlowConfidenceEnabled);
  const estimatedFlowColor = useAppSelector((state: RootState) => state.diagram.diagramOptions.estimatedFlowColor);
  const meteredFlowColor = useAppSelector((state: RootState) => state.diagram.diagramOptions.meteredFlowColor);
  const calculatedFlowColor = useAppSelector((state: RootState) => state.diagram.diagramOptions.calculatedFlowColor);

  const flowDecimalPrecision = useAppSelector((state: RootState) => state.diagram.settings.flowDecimalPrecision);
  const unitsOfMeasure = useAppSelector((state: RootState) => state.diagram.settings.unitsOfMeasure);
  const electricityUnitCost = useAppSelector((state: RootState) => state.diagram.settings.electricityCost);
  const conductivityUnit = useAppSelector((state: RootState) => state.diagram.settings.conductivityUnit);
  const validationWindowLocation: ValidationWindowLocation = useAppSelector((state) => state.ui.validationWindowLocation);
  const diagramFlowErrors: DiagramFlowErrors = useAppSelector((state: RootState) => state.diagram.diagramFlowErrors);
  const nodes: Node[] = useAppSelector(selectNodes);
  const isDiagramValid = getIsDiagramValid(diagramFlowErrors);

  const [selectedTab, setSelectedTab] = useState(0);
  const processFlowParts: ProcessFlowPart[] = [...processFlowDiagramParts];
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    // * see Diagram.tsx for onDrop event handler
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

  const handleEstimatedFlowColorChange = (color: string) => {
    dispatch(diagramOptionsChange({ optionsProp: 'estimatedFlowColor', updatedValue: color }));
  };

  const handleMeteredFlowColorChange = (color: string) => {
    dispatch(diagramOptionsChange({ optionsProp: 'meteredFlowColor', updatedValue: color }));
  };

  const handleResetEstimatedFlowColor = () => {
    dispatch(diagramOptionsChange({ optionsProp: 'estimatedFlowColor', updatedValue: undefined }));
  };

  const handleResetMeteredFlowColor = () => {
    dispatch(diagramOptionsChange({ optionsProp: 'meteredFlowColor', updatedValue: undefined }));
  };

  const handleCalculatedFlowColorChange = (color: string) => {
    dispatch(diagramOptionsChange({ optionsProp: 'calculatedFlowColor', updatedValue: color }));
  };

  const handleResetCalculatedFlowColor = () => {
    dispatch(diagramOptionsChange({ optionsProp: 'calculatedFlowColor', updatedValue: undefined }));
  };

  const summingNode = processFlowParts.pop();

  return (
    <>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%', overflowX: 'auto' }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            aria-label="diagram context tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab sx={{ fontSize: '.70rem' }} label="Build" />
            <Tab sx={{ fontSize: '.70rem' }} label="Results" />
            <Tab sx={{ fontSize: '.70rem' }} label="Options" />
            <Tab sx={{ fontSize: '.70rem' }} label="Notes" />
            {!isDiagramValid && validationWindowLocation === 'alerts-tab'? 
              <Tab sx={{ fontSize: '.70rem' }} label={
                <Box display={'block'}>
                  <Badge badgeContent={Boolean(diagramFlowErrors)? Object.keys(diagramFlowErrors).length : 0} color="error" sx={{ paddingRight: '.25rem' }}>
                        <NotificationsIcon sx={{ width: '.75em', color: selectedTab === 4 ? `${theme.palette.primary.main} !important` : 'inherit' }} />
                      </Badge>
                <Typography variant="subtitle1" component={'span'} sx={{fontSize: '.70rem', marginLeft: '.5rem', color: selectedTab === 4? `${theme.palette.primary.main} !important` : '#inherit'}}>Alerts</Typography>
                </Box>
              } />
              : 
              <Tab sx={{ fontSize: '.70rem' }} label="Alerts" disabled />
            }
            <Tab sx={{ fontSize: '.70rem' }} label="Help" />
          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          <Typography variant='h2' component={'div'} sx={{ fontSize: '16px', padding: '.5rem', marginTop: '.5rem', whiteSpace: "normal" }}>
            Drag site water system components into the pane
          </Typography>
          <Box sx={{ flexGrow: 1, paddingY: '1rem', paddingX: '.5rem' }}>
            <Grid container spacing={{ xs: 1, sm: 1, md: 2 }} columns={{ xs: 1, sm: 2, md: 4 }}>
              {processFlowParts.map((part: ProcessFlowPart) => {
                const bgColor = getPaletteColorForType(part.processComponentType as WaterProcessComponentType, paletteColors ?? []);
                const textColor = bgColor ? getContrastTextColor(bgColor) : undefined;
                return (
                  <Grid size={{ xs: 1, sm: 2, md: 2 }}  key={part.processComponentType}>
                    <WaterComponent className={`dndnode ${part.processComponentType}`}
                      onDragStart={(event) => onDragStart(event, part.processComponentType)}
                      draggable={true}
                      style={{ backgroundColor: bgColor, color: textColor }}>
                      {part.name}
                    </WaterComponent>
                  </Grid>
                );
              })}
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

          <Box display={'flex'} flexDirection={'column'} justifyContent={'space-evenly'} paddingY={'1rem'}>
            <DownloadButton shadowRoot={props.shadowRootRef} />
            {!hasAssessment &&
              <Button variant="outlined" color="error" sx={{ width: '100%' }} onClick={() => dispatch(setDialogOpen())}>Reset Diagram</Button>
            }
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <Box sx={{height: '100%', whiteSpace: "normal", padding: '.5rem' }}>
            <Box display={'flex'} >
              <DiagramResults />
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={2} style={{ paddingTop: 0 }}>
          <Box paddingX={'.5rem'} paddingTop={0}>
            <div className="sidebar-options">
            <Box className={'sidebar-option-container'} paddingX={'.5rem'} paddingY={0} sx={{ marginTop: '1.5rem' }}>
              <Typography variant="caption" sx={sectionLabelSx}>Units & Precision</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '.75rem', rowGap: '.5rem' }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="unitsOfMeasure-label">Units of Measure</InputLabel>
                  <Select
                    labelId="unitsOfMeasure-label"
                    id="unitsOfMeasure"
                    name="unitsOfMeasure"
                    size="small"
                    label="Units of Measure"
                    value={unitsOfMeasure}
                    onChange={(e) => dispatch(unitsOfMeasureChange(e.target.value))}
                    disabled={hasAssessment}
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
                    <MenuItem key={'imperial'} value={'Imperial'}>Imperial</MenuItem>
                    <MenuItem key={'metric'} value={'Metric'}>Metric</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel id="flowDecimalPrecision-label">Decimal Precision</InputLabel>
                  <Select
                    labelId="flowDecimalPrecision-label"
                    id="flowDecimalPrecision"
                    name="flowDecimalPrecision"
                    size="small"
                    label="Flow Decimal Precision"
                    value={flowDecimalPrecision}
                    onChange={(e) => dispatch(flowDecimalPrecisionChange(String(e.target.value)))}
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
                    {flowDecimalPrecisionOptions.map((option) => (
                      <MenuItem key={`flowDecimalPrecision_${option.value}`} value={option.value}>{option.display}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel id="conductivityUnit-label">Conductivity Unit</InputLabel>
                  <Select
                    labelId="conductivityUnit-label"
                    id="conductivityUnit"
                    name="conductivityUnit"
                    size="small"
                    label="Conductivity Unit"
                    value={conductivityUnit}
                    onChange={(e) => dispatch(conductivityUnitChange(e.target.value))}
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
                    {conductivityUnitOptions.map((option) => (
                      <MenuItem key={`conductivityUnit_${option.value}`} value={option.value}>{option.display}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ marginTop: '.5rem' }}>
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
            </Box>

            <Divider sx={{ marginY: '.75rem' }} />

            <Box className={'sidebar-option-container'} paddingX={'.5rem'} paddingY={0} sx={{ marginTop: '.25rem' }}>
              <Typography variant="caption" sx={sectionLabelSx}>Diagram Appearance</Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                <ColorPaletteDropdown
                  selected={selectedPaletteIdx}
                  onChange={(paletteIdx) => {
                    dispatch(setPaletteColors(allPalettes[paletteIdx]));
                  }}
                />

                <FormControl fullWidth size="small">
                  <InputLabel id="edgeType-label">Default Line Type</InputLabel>
                  <Select
                    labelId="edgeType-label"
                    id="edgeType"
                    name="edgeType"
                    size="small"
                    label="Edge Type"
                    value={edgeType}
                    onChange={(e) => dispatch(defaultEdgeTypeChange(e.target.value))}
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
                      <MenuItem key={option.value} value={option.value}>{option.display}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box className={'sidebar-option-container'} sx={{ marginTop: '.5rem' }}>
                <label htmlFor={'strokeWidth'} >Line Thickness</label>
                <ContinuousSlider
                  size='small'
                  unit='px'
                  min={1}
                  max={10}
                  setSliderValue={(e, newValue) => handleSliderChange(e, newValue, 'strokeWidth', ['updateEdgeProperties'])}
                  value={strokeWidth} />
              </Box>

              <Box className={'sidebar-option-container'}>
                <label htmlFor={'flowLabelSize'} >Flow Label Size Scale</label>
                <ContinuousSlider
                  size='small'
                  min={.5}
                  max={2}
                  step={.10}
                  unit={''}
                  setSliderValue={(e, newValue) => handleSliderChange(e, newValue, 'flowLabelSize', ['updateEdges'])}
                  value={flowLabelSize} />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '.5rem' }}>
                <Box className={'sidebar-option-container checkbox'} sx={{ fontSize: '.75rem' }}>
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
              </Box>
            </Box>

            <Divider sx={{ marginY: '.75rem' }} />

            <Box className={'sidebar-option-container'} paddingX={'.5rem'} paddingY={0} sx={{ marginTop: '.25rem' }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={flowConfidenceEnabled}
                    onChange={(e) => handleGenericCheckboxChange(e, 'flowConfidenceEnabled')}
                  />
                }
                label="Show Estimated/Metered Flow States"
                labelPlacement="start"
                slotProps={{ typography: { variant: 'caption', sx: sectionLabelSx } }}
                sx={{ width: '100%', justifyContent: 'space-between', marginLeft: 0, marginRight: '.5rem', marginBottom: '.35rem' }}
              />

              {flowConfidenceEnabled &&
                <>
                  <Box className={'sidebar-option-container checkbox'} sx={{ marginBottom: '.35rem' }}>
                    <label htmlFor="color-edges-by-confidence" className="diagram-checkbox-label">
                      <input
                        type="checkbox"
                        id={"color-edges-by-confidence"}
                        checked={colorEdgesByConfidence === true}
                        className={'diagram-checkbox'}
                        style={{ marginRight: '.5rem' }}
                        onChange={(e) => handleGenericCheckboxChange(e, 'colorEdgesByConfidence')}
                      />
                      <span>Color Lines by Estimated/Metered State</span>
                    </label>
                  </Box>

                  <Box className={'sidebar-option-container checkbox'} sx={{ marginBottom: '.35rem' }}>
                    <label htmlFor="show-flow-confidence-on-label" className="diagram-checkbox-label">
                      <input
                        type="checkbox"
                        id={"show-flow-confidence-on-label"}
                        checked={showFlowConfidenceOnLabel !== false}
                        className={'diagram-checkbox'}
                        style={{ marginRight: '.5rem' }}
                        onChange={(e) => handleGenericCheckboxChange(e, 'showFlowConfidenceOnLabel')}
                      />
                      <span>Show Confidence State on Flow Label</span>
                    </label>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '1rem', rowGap: '.5rem', alignItems: 'center' }}>
                    <Typography variant="caption">Estimated</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ColorPicker
                        compact
                        hideLabel
                        label={'Estimated'}
                        color={estimatedFlowColor || theme.palette.warning.main}
                        setParentColor={handleEstimatedFlowColorChange}
                        showRecent={false}
                      />
                      <ResetColorButton
                        label="estimated"
                        disabled={!estimatedFlowColor}
                        onClick={handleResetEstimatedFlowColor}
                      />
                    </Box>

                    <Typography variant="caption">Metered</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ColorPicker
                        compact
                        hideLabel
                        label={'Metered'}
                        color={meteredFlowColor || theme.palette.success.main}
                        setParentColor={handleMeteredFlowColorChange}
                        showRecent={false}
                      />
                      <ResetColorButton
                        label="metered"
                        disabled={!meteredFlowColor}
                        onClick={handleResetMeteredFlowColor}
                      />
                    </Box>

                    <Typography variant="caption">Calculated</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ColorPicker
                        compact
                        hideLabel
                        label={'Calculated'}
                        color={calculatedFlowColor || theme.palette.info.main}
                        setParentColor={handleCalculatedFlowColorChange}
                        showRecent={false}
                      />
                      <ResetColorButton
                        label="calculated"
                        disabled={!calculatedFlowColor}
                        onClick={handleResetCalculatedFlowColor}
                      />
                    </Box>
                  </Box>
                </>
              }
            </Box>

            </div>
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          <Box sx={{ flexGrow: 1, paddingY: '1rem', paddingX: '.5rem' }}>
            <div className="form-group pt-4">
              <TextField
                id="diagramNotes"
                name="diagramNotes"
                label="Diagram Notes"
                multiline
                minRows={8}
                value={diagramNotes ?? ""}
                onChange={e => {
                  dispatch(setDiagramNotes(e.target.value ?? ""));
                }}
                placeholder="Add additional information for your diagram"
                fullWidth
                variant="outlined"
              />
            </div>
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={4}>
          <Box sx={{height: '100%', whiteSpace: "normal", padding: '.5rem' }}>
                {!isDiagramValid && validationWindowLocation === 'alerts-tab' &&
                  <ValidationWindow nodes={nodes} errors={diagramFlowErrors} openLocation={validationWindowLocation} />
                }
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={5}>
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
      </>
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