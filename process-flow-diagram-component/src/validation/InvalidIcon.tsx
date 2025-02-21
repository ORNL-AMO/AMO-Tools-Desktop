import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { useTheme } from "@mui/material";

const InvalidIcon = ({level}: {level: any}): JSX.Element => {
    const theme = useTheme();
    let style = {
        marginRight: '.5rem',
        height: '24px',
        color: theme.palette.error.main
    }

    if (level === 'ERROR') {
        return (<ErrorIcon style={style}/>)
    } else if (level === 'WARNING') {
        style.color = theme.palette.warning.main;
        return <WarningIcon style={style}/>
    }
}

export default InvalidIcon;