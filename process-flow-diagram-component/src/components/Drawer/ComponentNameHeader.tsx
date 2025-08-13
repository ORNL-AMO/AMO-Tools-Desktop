import { Box, TextField, Button } from "@mui/material";
import { processFlowDiagramParts, ProcessFlowPart } from "process-flow-lib";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../../hooks/state";
import { setNodeName } from "../Diagram/diagramReducer";
import {
    type Node,
} from '@xyflow/react';
const ComponentNameHeader = (props: { selectedNode: Node<ProcessFlowPart> }) => {
    const dispatch = useAppDispatch();
    const { selectedNode } = props;
    const [name, setName] = useState<string>(selectedNode.data.name);

    const debounceRef = useRef(null);

    const updateNodeName = (name: string) => {
        dispatch(setNodeName(name));
    };

    useEffect(() => {
        debounceRef.current = setTimeout(() => {
            updateNodeName(name);
        }, 150);

        return () => {
            clearTimeout(debounceRef.current);
        };
    }, [name]);

    useEffect(() => {
        setName(selectedNode.data.name);
    }, [selectedNode.data.name]);

    const componentTypeLabel = processFlowDiagramParts.find(part => part.processComponentType === selectedNode.data.processComponentType)?.name;
    return (
        <Box display="flex" alignItems={'center'} sx={{ margin: '0 1rem' }}>
            <Box
                display="flex"
                alignItems="center"
                width="100%"
            >
                <Box
                    component="span"
                    sx={{
                        flexGrow: 1,
                        py: 1,
                        borderRadius: 4
                    }}
                >
                    <TextField
                        label={componentTypeLabel}
                        id={'component_name'}
                        value={name}
                        type={'text'}
                        size={'small'}
                        onChange={evt => setName(evt.target.value)}
                        sx={{
                            margin: 0,
                            marginBottom: '1rem',
                            width: '100%',
                        }}
                        autoFocus
                        InputProps={{
                            sx: {
                                '& input': {
                                    borderBottom: `8px solid ${selectedNode.style?.backgroundColor}`,
                                    borderRadius: 2
                                }
                            }
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );

}

export default ComponentNameHeader;