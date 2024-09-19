// import React, { CSSProperties, useCallback, useState } from 'react';
// import { ProcessFlowPart, processFlowDiagramParts } from '../../../../src/process-flow-types/shared-process-flow-types';
// import { edgeTypeOptions, SelectListOption } from '../Flow/FlowTypes';
// import { Box, Button, Divider, Grid, Paper, styled, Tab, Tabs, Typography } from '@mui/material';
// import { Edge, Node, useOnSelectionChange } from '@xyflow/react';
// import DownloadButton from './DownloadButton';

// interface TabPanelProps {
//   children?: React.ReactNode;
//   index: number;
//   value: number;
// }

// function CustomTabPanel(props: TabPanelProps) {
//   const { children, value, index, ...other } = props;

//   let styleProps: CSSProperties = { height: '100%' };
//   let sxProps: any = {
//     p: 1,
//   };

//   if (value === index && value === 0) {
//     styleProps.display = 'flex'
//     styleProps.justifyContent = 'space-between';
//     sxProps = {
//       p: 1,
//       display: 'flex',
//       flexDirection: 'column',
//       justifyContent: 'space-between',
//     }
//   }

//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`diagram-tabpanel-${index}`}
//       aria-labelledby={`diagram-tab-${index}`}
//       style={styleProps}
//       {...other}
//     >
//       {value === index && <Box sx={sxProps}>{children}</Box>}
//     </div>
//   );
// }

// const WaterComponent = styled(Paper)(({ theme }) => ({
//   ...theme.typography.body2,
//   padding: theme.spacing(1),
//   textAlign: 'center',
//   color: theme.palette.text.secondary,
// }));

// const ContextSidebar = (props: SidebarProps) => {
//   const processFlowParts: ProcessFlowPart[] = [...processFlowDiagramParts];
//   const [selectedEdge, setSelectedEdge] = useState(null);
//   const [selectedNode, setSelectedNode] = useState(null);
//   const onDragStart = (event: React.DragEvent, nodeType: string) => {
//     event.dataTransfer.setData('application/reactflow', nodeType);
//     event.dataTransfer.effectAllowed = 'move';
//   };
//   const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
//     props.setSelectedTab(newValue);
//   };

//   // todo can this all be turned to a hook or shared method?
//   const onSelectedNodeOrEdge = useCallback((selectedParts: { nodes: Node[], edges: Edge[] }) => {
//     // todo 6905 needs to be changed to allow multiple selected, or enforce only one selected

//     const lastSelectedEdge = selectedParts.edges[0];
//     const lastSelectedNode = selectedParts.nodes[0];
//     setSelectedEdge(lastSelectedEdge);
//     setSelectedNode(lastSelectedNode);
//     const switchTab = lastSelectedEdge || lastSelectedNode ? 1 : props.selectedTab;

//     props.setSelectedTab(switchTab);
//   }, []);

//   useOnSelectionChange({
//     onChange: onSelectedNodeOrEdge
//   });

//   const tabStyles = {
//     fontSize: '.75rem'
//   };

//   return (
//     <aside>
//       <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
//         <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//           <Tabs value={props.selectedTab} onChange={handleTabChange} aria-label="diagram context tabs">
//             <Tab sx={tabStyles} label="Create" />
//             <Tab sx={tabStyles} label="Style" />
//             <Tab sx={tabStyles} label="Options" />
//           </Tabs>
//         </Box>

//         {/* SYSTEM PARTS */}
//         <CustomTabPanel value={props.selectedTab} index={0}>
//           <div>
//             <Typography variant='body1' component={'i'} sx={{ fontWeight: '500', fontSize: '14px' }}>Drag plant water system components into the pane</Typography>
//             <Box sx={{ flexGrow: 1, paddingY: '1rem' }}>
//               <Grid container spacing={{ xs: 1, md: 2 }} columns={{ xs: 3, sm: 8, md: 12 }}>
//                 {processFlowParts.map((part: ProcessFlowPart) => (
//                   <Grid item xs={2} sm={4} md={4} key={part.processComponentType}>
//                     <WaterComponent className={`dndnode ${part.processComponentType}`}
//                       onDragStart={(event) => onDragStart(event, part.processComponentType)}
//                       draggable={part.processComponentType != 'waste-water-treatment'}>
//                       {part.name}
//                     </WaterComponent>
//                   </Grid>
//                 ))}
//                 <Grid item xs={2} sm={4} md={4}>
//                   <WaterComponent className={`dndnode splitterNode`}
//                     onDragStart={(event) => onDragStart(event, 'splitter-node-4')} draggable> 4-way Connection</WaterComponent>
//                 </Grid>
//                 <Grid item xs={2} sm={4} md={4}>
//                   <WaterComponent className={`dndnode splitterNode`}
//                     onDragStart={(event) => onDragStart(event, 'splitter-node-8')} draggable> 8-way Connection</WaterComponent>
//                 </Grid>
//               </Grid>

//             </Box>
//           </div>

//           {!props.hasAssessment &&
//             <Button variant="outlined" onClick={() => props.setIsDialogOpen(true)}>Reset Diagram</Button>
//           }
//         </CustomTabPanel>

//         {/* CUSTOMIZE */}
//         <CustomTabPanel value={props.selectedTab} index={1}>
//           <Typography variant='body1' component={'i'} sx={{ fontWeight: '500', fontSize: '14px' }}>Select components and connecting lines to customize</Typography>
//           {/* {selectedEdge &&
//             <CustomizeEdge edge={selectedEdge}></CustomizeEdge>
//           }
//           {selectedNode &&
//             <CustomizeNode node={selectedNode}></CustomizeNode>
//           } */}
//         </CustomTabPanel>


//         {/* DIAGRAM OPTION */}
//         <CustomTabPanel value={props.selectedTab} index={2}>
//           <Typography variant='body1' component={'i'} sx={{ fontWeight: '500', fontSize: '14px' }}>Set diagram view options</Typography>
//           <div className="sidebar-actions">
//             <label htmlFor="edgeType">Connecting Line Type</label>
//             <select className="form-control" id="edgeType" name="edgeType" onChange={(e) => props.edgeTypeChangeCallback(e.target.value)}>
//               {edgeTypeOptions.map((option: SelectListOption) => {
//                 return (
//                   <option key={option.value} value={option.value}>{option.display}</option>
//                 )
//               })}
//             </select>
//             <div style={{ margin: '1rem 0' }}>

//               <label>
//                 <input
//                   type="checkbox"
//                   onChange={(e) => props.minimapVisibleCallback(e.target.checked)}
//                 />
//                 <span>Show Minimap</span>
//               </label>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={props.controlsVisible}
//                   onChange={(e) => props.controlsVisibleCallback(e.target.checked)}
//                 />
//                 <span>Show Controls</span>
//               </label>
//             </div>

//             <div className="sidebar-action-buttons">
//               <DownloadButton shadowRoot={props.shadowRoot} />
//             </div>
//           </div>
//         </CustomTabPanel>
//       </Box>

//     </aside>
//   );
// };

// export default ContextSidebar;

// export interface SidebarProps {
//   edges: Edge[];
//   minimapVisibleCallback: (enabled: boolean) => void;
//   controlsVisible: boolean;
//   controlsVisibleCallback: (enabled: boolean) => void;
//   edgeTypeChangeCallback: (edgeTypeOption: string) => void;
//   resetDiagramCallback: () => void;
//   setSelectedTab: (tab: number) => void;
//   setIsDialogOpen: (boolean) => void;
//   selectedTab: number;
//   // selectedEdge: Edge;
//   // selectedNode: Node;
//   hasAssessment: boolean;
//   shadowRoot;
// }