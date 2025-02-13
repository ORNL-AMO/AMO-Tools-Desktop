import { Box, List, ListItem, ListItemButton, ListItemIcon, Divider } from "@mui/material";
import { getEdgeSourceAndTarget } from "../Diagram/FlowUtils";
import ConnectionBreadcrumbs from "./ConnectionBreadcrumbs";
import EditNoteIcon from '@mui/icons-material/EditNote';
import { Edge, Node } from '@xyflow/react';
import { useAppSelector } from "../../hooks/state";

const ComponentConnectionsList = (props: ComponentConnectionsListProps) => {
    const nodes = useAppSelector(state => state.diagram.nodes) as Node[];

    return (
        <Box sx={{ paddingY: '.25rem', width: '100%' }} role="presentation" >
            <List>
                {props.connectedEdges.map((edge: Edge, index: number) => {
                    const key: string = `${edge.id}_${index}`;
                    const { source, target } = getEdgeSourceAndTarget(edge, nodes);
                    let isSelected: boolean = props.selectedEdge && props.selectedEdge.id === edge.id;

                    return (
                        <ListItem
                            className={isSelected ? 'selected-list-item' : undefined}
                            onClick={() => props.setSelectedEdge(edge)}
                            sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
                            key={key}
                            disablePadding>
                            <Box sx={{ width: '100%' }}>
                                <ListItemButton>
                                    <ListItemIcon sx={{visibility: isSelected? 'visible':'hidden'}}>
                                        <EditNoteIcon />
                                    </ListItemIcon>
                                    <ConnectionBreadcrumbs source={source} target={target} />
                                </ListItemButton>
                            </Box>
                        </ListItem>
                    );
                })}

            </List>
        </Box>
    );
}


export default ComponentConnectionsList;

export interface ComponentConnectionsListProps {
    connectedEdges: Edge[];
    setSelectedEdge: (selectedEdge) => void;
    selectedEdge: Edge;
}

