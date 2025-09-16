import * as React from 'react';
import Alert from '@mui/material/Alert';
import { Box, Slide } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/state';
import { diagramAlertChange } from './diagramReducer';

export default function DiagramAlert(props: DiagramAlertProps) {
    const {
        diagramAlertState
    } = props;
    const dispatch = useAppDispatch();
    const isDrawerOpen = useAppSelector(state => state.diagram.isDataDrawerOpen);

    React.useEffect(() => {
        if (diagramAlertState.dismissMS > 0) {
            const timer = setTimeout(() => dispatch(diagramAlertChange({ open: false })), diagramAlertState.dismissMS);
            return () => clearTimeout(timer);
        }
    }, [diagramAlertState.dismissMS]);

    const offsetRight: number = isDrawerOpen? 550 : 75;

    return (
        <Slide direction="up" in={diagramAlertState.open} mountOnEnter unmountOnExit>
            <Box
                boxShadow={1}
                sx={{
                    position: "absolute",
                    right: offsetRight,
                    bottom: 65,
                }}>
                <Alert severity={diagramAlertState.alertSeverity}>{diagramAlertState.alertMessage}</Alert>
            </Box>
        </Slide>
    );
}

export interface DiagramAlertProps {
    diagramAlertState: DiagramAlertState;
}
export interface DiagramAlertState {
    open: boolean;
    alertMessage?: string;
    alertSeverity?: 'error' | 'warning' | 'info' | 'success';
    dismissMS?: number;
}
