import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { useTheme } from "@mui/material";

const InvalidIcon = ({status}: {status: any}): JSX.Element => {
    const theme = useTheme();
    let style = {
        marginRight: '.5rem',
        height: '24px',
        color: theme.palette.error.main
    }

    if (status === 'ERROR') {
        return (<ErrorIcon style={style}/>)
    } else if (status === 'WARNING') {
        style.color = theme.palette.warning.main;
        return <WarningIcon style={style}/>
    }
}

export default InvalidIcon;