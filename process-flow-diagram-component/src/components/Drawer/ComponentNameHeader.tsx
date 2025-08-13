import { Box, TextField, Button } from "@mui/material";
import { processFlowDiagramParts, ProcessFlowPart } from "process-flow-lib";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../../hooks/state";
import { setNodeName } from "../Diagram/diagramReducer";
import {
    type Node,
} from '@xyflow/react';
// import EditIcon from '@mui/icons-material/Edit';
// import DoneIcon from '@mui/icons-material/Done';


const ComponentNameHeader = (props: { selectedNode: Node<ProcessFlowPart> }) => {
    const dispatch = useAppDispatch();
    const { selectedNode } = props;
    // const [isEditing, setIsEditing] = useState(false);
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

    const componentTypeLabel = processFlowDiagramParts.find(part => part.processComponentType === selectedNode.data.processComponentType)?.name;

    // return (
    // <Box display="flex" alignItems={'center'} sx={{ margin: '0 1rem' }}>
    //     {isEditing ? (
    //         <Box
    //             display="flex"
    //             alignItems="center"
    //             width="100%"
    //             marginBottom='1rem'
                
    //         >
    //             <TextField
    //                 label={'Component Name'}
    //                 id={'component_name'}
    //                 value={name}
    //                 type={'text'}
    //                 size={'small'}
    //                 onChange={evt => setName(evt.target.value)}
    //                 sx={{ paddingRight: '1rem', margin: 0, width: '100%' }}
    //                 autoFocus
    //             />
    //             <Button
    //                 variant="outlined"
    //                 onClick={() => setIsEditing(false)}
    //                 sx={{ minWidth: 0, ml: 1, p: 0.5 }}
    //                 aria-label="save component name"
    //             >
    //                 <DoneIcon fontSize="small" />
    //             </Button>
    //         </Box>

    //     ) : (
    //         <Box
    //             display="flex"
    //             alignItems="center"
    //             width="100%"
    //             marginBottom='1rem'
    //         >
    //             <Box
    //                 component="span"
    //                 sx={{
    //                     flexGrow: 1,
    //                     py: 1,
    //                     // backgroundColor: selectedNode.style?.backgroundColor,
    //                     borderBottom: `4px solid ${selectedNode.style?.backgroundColor}`,
    //                     borderRadius: 2
    //                 }}
    //             >
    //                 <Box
    //                     component="span"
    //                     sx={{
    //                         flexGrow: 1,
    //                         fontWeight: 600,
    //                         fontSize: '1.25rem',
    //                         marginLeft: '1rem',
    //                         // color: (theme) => theme.palette.getContrastText(selectedNode.style?.backgroundColor || theme.palette.background.default),
    //                         overflow: 'hidden',
    //                         textOverflow: 'ellipsis',
    //                         whiteSpace: 'nowrap',
    //                     }}
    //                 >
    //                     {name}
    //                 </Box>
    //             </Box>
    //             <Button
    //                 variant="outlined"
    //                 onClick={() => setIsEditing(true)}
    //                 sx={{ minWidth: 0, ml: 1, p: 0.5 }}
    //                 aria-label="Edit component name"
    //             >
    //                 <EditIcon fontSize="small" />
    //             </Button>
    //         </Box>
    //     )}
    // </Box>
    // );

    
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