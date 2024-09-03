import React, { useCallback, useState } from 'react';
import DownloadButton from '../DownloadButton';
import { ProcessFlowPart, processFlowDiagramParts } from '../../../../src/process-flow-types/shared-process-flow-types';
import { edgeTypeOptions, SelectListOption } from '../Flow/FlowTypes';
import { Box, Grid, Paper, styled, Tab, Tabs, Typography } from '@mui/material';
import { Edge, Node, useOnSelectionChange } from '@xyflow/react';
import CustomizeEdge from './CustomizeEdge';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`diagram-tabpanel-${index}`}
      aria-labelledby={`diagram-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

const WaterComponent = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const Sidebar = (props: SidebarProps) => {
  const processFlowParts: ProcessFlowPart[] = [...processFlowDiagramParts];
  const [selectedEdge, setSelectedEdge] = useState(null);
  
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    props.setSelectedTab(newValue);
  };

  const onSelectedNodeOrEdge = useCallback((selectedParts: {nodes: Node[], edges: Edge[]}) => {
    // todo 6905 set for multiple selected, or allow only one selected
    const lastSelectedEdge = selectedParts.edges[0];
    
    setSelectedEdge(lastSelectedEdge);
    const switchTab = lastSelectedEdge? 1 : props.selectedTab;
    props.setSelectedTab(switchTab);
  }, []);

  useOnSelectionChange({
    onChange: onSelectedNodeOrEdge
  });

  const tabStyles = {
    fontSize: '.75rem'
  };

  return (
    <aside>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={props.selectedTab} onChange={handleTabChange} aria-label="diagram context tabs">
            <Tab sx={tabStyles} label="System Parts" />
            <Tab sx={tabStyles} label="Customize" />
            <Tab sx={tabStyles} label="Options"  />
          </Tabs>
        </Box>

        {/* SYSTEM PARTS */}
        <CustomTabPanel value={props.selectedTab} index={0} >
        <Typography variant='body1' component={'i'} sx={{fontWeight: '500', fontSize: '14px'}}>Drag plant water system components into the pane</Typography>

          <Box sx={{ flexGrow: 1, paddingY: '1rem' }}>
            <Grid container spacing={{ xs: 1, md: 2 }} columns={{ xs: 3, sm: 8, md: 12 }}>
              {processFlowParts.map((part: ProcessFlowPart) => (
                <Grid item xs={2} sm={4} md={4} key={part.processComponentType}>
                  <WaterComponent className={`dndnode ${part.processComponentType}`} 
                  onDragStart={(event) => onDragStart(event, part.processComponentType)} 
                  draggable={part.processComponentType != 'water-treatment' && part.processComponentType != 'waste-water-treatment'}>{part.name}</WaterComponent>
                </Grid>
              ))}
            </Grid>
          </Box>

          <hr/>
          <Box sx={{ flexGrow: 1, paddingY: '1rem' }}>
            <Grid container spacing={{ xs: 1, md: 2 }} columns={{ xs: 3, sm: 8, md: 12 }}>
                <Grid item xs={2} sm={4} md={4}>
                  <WaterComponent className={`dndnode splitterNode`} 
                  onDragStart={(event) => onDragStart(event, 'splitter-node-4')} draggable> 4-way Splitter</WaterComponent>
                </Grid>
                <Grid item xs={2} sm={4} md={4}>
                  <WaterComponent className={`dndnode splitterNode`} 
                  onDragStart={(event) => onDragStart(event, 'splitter-node-8')} draggable> 8-way Splitter</WaterComponent>
                </Grid>
            </Grid>
          </Box>

        </CustomTabPanel>

        {/* CUSTOMIZE */}
        <CustomTabPanel value={props.selectedTab} index={1}>
          <Typography variant='body1' component={'i'} sx={{fontWeight: '500', fontSize: '14px'}}>Select components and connecting lines to customize</Typography>
          {selectedEdge &&
            <CustomizeEdge edge={selectedEdge}></CustomizeEdge>
          }
        </CustomTabPanel>


        {/* DIAGRAM OPTION */}
        <CustomTabPanel value={props.selectedTab} index={2}>
          <Typography variant='body1' component={'i'} sx={{fontWeight: '500', fontSize: '14px'}}>Set diagram view options</Typography>
          <div className="sidebar-actions">
            <label htmlFor="edgeType">Connecting Line Type</label>
            <select className="form-control" id="edgeType" name="edgeType" onChange={(e) => props.edgeTypeChangeCallback(e.target.value)}>
              {edgeTypeOptions.map((option: SelectListOption) => {
                return (
                  <option key={option.value} value={option.value}>{option.display}</option>
                )
              })}
            </select>
            <div style={{ margin: '1rem 0' }}>

              <label>
                <input
                  type="checkbox"
                  onChange={(e) => props.minimapVisibleCallback(e.target.checked)}
                />
                <span>Show Minimap</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={props.controlsVisible}
                  onChange={(e) => props.controlsVisibleCallback(e.target.checked)}
                />
                <span>Show Controls</span>
              </label>
            </div>

            <div className="sidebar-action-buttons">
              <DownloadButton shadowRoot={props.shadowRoot} />
            </div>
          </div>
        </CustomTabPanel>
      </Box>

    </aside>
  );
};

export default Sidebar;

export interface SidebarProps {
  edges: Edge[];
  minimapVisibleCallback: (enabled: boolean) => void;
  controlsVisible: boolean;
  controlsVisibleCallback: (enabled: boolean) => void;
  edgeTypeChangeCallback: (edgeTypeOption: string) => void;
  setSelectedTab: (tab: number) => void;
  selectedTab: number;
  shadowRoot;
}