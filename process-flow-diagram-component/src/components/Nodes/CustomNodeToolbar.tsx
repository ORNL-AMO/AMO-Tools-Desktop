import { CSSProperties } from "react";
import EditIcon from '@mui/icons-material/Edit';
import { Button, ButtonGroup, useTheme } from "@mui/material";
import { useAppDispatch } from "../../hooks/state";
import { ProcessFlowPart } from "process-flow-lib";

const CustomNodeToolbar = ({ onEdit, nodeData, selected }: NodeToolbarProps) => {
    const NODE_UPPER_CORNER_LOCATION = `translate(0%, 0%) translate(166px, -45px)`;
    // const componentTypeColor = useAppSelector(selectedDataColor);
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const customStyle: CSSProperties = {
        position: 'absolute',
        transform: NODE_UPPER_CORNER_LOCATION,
        pointerEvents: 'all',
    }

    const backgroundColor = theme.palette.background.paper;
    return (
        <div
            className="nodrag nopan custom-node-toolbar"
            style={customStyle}
        >
            <div style={{
                display: 'flex',
                borderRadius: '4px',
            }} >
                <ButtonGroup variant="contained" aria-label="Node tool button group"
                    sx={{ fontSize: '10px', 
                    backgroundColor: backgroundColor,
                    border: selected ? '1px solid black' : 'none'}}>
                        <Button
                            sx={{
                                padding: '.25rem .5rem',
                                color: theme.palette.primary.main,
                                backgroundColor: backgroundColor,
                            }}
                            onClick={onEdit}
                        >
                            <EditIcon />
                        </Button>
                </ButtonGroup>
            </div>
        </div>

    );
}

export default CustomNodeToolbar;

export interface NodeToolbarProps {
    onEdit: () => void;
    selected?: boolean;
    nodeData: ProcessFlowPart;
}