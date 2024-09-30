import React from 'react';
import { ProcessFlowPart, processFlowDiagramParts } from '../../../../src/process-flow-types/shared-process-flow-types';
import { edgeTypeOptions, SelectListOption } from '../Flow/FlowTypes';
import { Box, Button, Divider, Grid, Paper, styled, Typography } from '@mui/material';
import DownloadButton from './DownloadButton';

const WaterComponent = styled(Paper)(({ theme, ...props }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  '&:hover': {
    cursor: props.draggable? 'grab' : 'no-drop',
  },
  color: theme.palette.text.secondary,
}));

const Sidebar = (props: SidebarProps) => {
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
                    draggable={part.processComponentType != 'water-treatment' && part.processComponentType != 'waste-water-treatment'}>
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
        <Box sx={{marginTop: 1}}>
          <div className="sidebar-actions">
            <label htmlFor="edgeType">Global Connecting Line Type</label>
            <select className="form-control" id="edgeType" name="edgeType" onChange={(e) => props.edgeTypeChangeCallback(e.target.value)}>
              {edgeTypeOptions.map((option: SelectListOption) => {
                return (
                  <option key={option.value} value={option.value}>{option.display}</option>
                )
              })}
            </select>
            <div style={{ margin: '1rem 0' }}>
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
};

export default Sidebar;

export interface SidebarProps {
  minimapVisibleCallback: (enabled: boolean) => void;
  controlsVisible: boolean;
  controlsVisibleCallback: (enabled: boolean) => void;
  edgeTypeChangeCallback: (edgeTypeOption: string) => void;
  resetDiagramCallback: () => void;
  setIsDialogOpen: (boolean) => void;
  hasAssessment: boolean;
  shadowRoot;
}