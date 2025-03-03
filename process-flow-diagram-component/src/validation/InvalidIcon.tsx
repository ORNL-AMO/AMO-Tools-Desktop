import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { useTheme } from "@mui/material";
import { CSSProperties } from 'react';
import { ValidationLevel } from '../../../src/process-flow-types/shared-process-flow-types';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const InvalidIcon = ({level, useOutline, sx}: {level: ValidationLevel, useOutline?: boolean, sx?: CSSProperties}): JSX.Element => {
    const theme = useTheme();
    const style = {
        ...sx
    }
    if (level === 'error') {
        style.color = theme.palette.error.main;
        return useOutline? (<ErrorOutlineIcon style={style}/>) : (<ErrorIcon style={style}/>)
    } else if (level === 'warning') {
        style.color = theme.palette.warning.main;
        return useOutline? <WarningAmberIcon style={style}/> : <WarningIcon style={style}/>
    }
}

export default InvalidIcon;