import * as React from 'react';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import MuiDrawer, { DrawerProps } from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuSidebar, { MenuSidebarProps } from './MenuSidebar';
import { Box } from '@mui/material';
import { ParentContainerDimensions } from '../../../../src/process-flow-types/shared-process-flow-types';

const drawerWidth = 375;

const openedMixin = (theme: Theme, parentContainer: ParentContainerDimensions): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  top: parentContainer.headerHeight,
  height: parentContainer.height - parentContainer.headerHeight - parentContainer.footerHeight,
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme, parentContainer: ParentContainerDimensions): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  top: parentContainer.headerHeight,
  height: parentContainer.height - parentContainer.headerHeight - parentContainer.footerHeight,
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

type CustomDrawerProps = DrawerProps & { theme?: Theme; parentContainer: ParentContainerDimensions }

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'parentContainer',
})<CustomDrawerProps>(({ theme, open, parentContainer }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    variants: [
      {
        props: ({ open }) => open,
        style: {
          ...openedMixin(theme, parentContainer),
          '& .MuiDrawer-paper': openedMixin(theme, parentContainer),
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          ...closedMixin(theme, parentContainer),
          '& .MuiDrawer-paper': closedMixin(theme, parentContainer),
        },
      },
    ],
  }),
);

export const MenuContextDrawer = (props: MenuContextDrawerProps) => {
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(!open);
  };

  return (
    <>
      <CssBaseline />
      <Drawer variant="permanent" open={open} parentContainer={props.parentContainer}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerOpen}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </DrawerHeader>
        <Box padding={'1rem .5rem'}>
          {open &&
            <MenuSidebar {...props.menuSidebarProps} />
          }
        </Box>
      </Drawer>
    </>
  );
}  

export interface MenuContextDrawerProps {
    // isMenuDrawerOpen: boolean;
    // setIsMenuDrawerOpen: (boolean) => void;
    parentContainer: ParentContainerDimensions,
    menuSidebarProps: MenuSidebarProps
}




