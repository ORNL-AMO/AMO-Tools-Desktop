import { Button } from "@mui/material";
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';

const DrawerToggleButton = ({toggleDrawer, side}: { toggleDrawer: () => void; side: string }) => {
    return (<Button onClick={toggleDrawer}
        sx={{
            alignSelf: side === 'right'? 'flex-start': 'flex-center',
            transform: side === 'right'? 'rotate(-90deg)': 'rotate(90deg)'
        }}>
        <ExpandCircleDownIcon sx={{
            width: '32px',
            height: '32px',
        }} />
    </Button>);
}

export default DrawerToggleButton;