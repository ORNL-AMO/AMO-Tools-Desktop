import { Button } from "@mui/material";
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import { useAppDispatch } from "../../hooks/state";
import { toggleDrawer } from "../Diagram/diagramReducer";

const DrawerToggleButton = ({side, toggleSidebarDrawer}: { side: string, toggleSidebarDrawer?: () => void }) => {
    const dispatch = useAppDispatch();

    const toggleAppDrawer = () => { 
        if (toggleSidebarDrawer) {
            toggleSidebarDrawer();
        } else {
            dispatch(toggleDrawer());
        }

    }

    return (<Button onClick={toggleAppDrawer}
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