import * as React from 'react';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import MuiDrawer, { DrawerProps } from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuSidebar, { MenuSidebarProps } from './MenuSidebar';
import { Box } from '@mui/material';
import { ParentContainerDimensions } from '../../../../src/process-flow-types/shared-process-flow-types';
import { DataSidebarProps } from './DataSidebar';

const drawerWidth = 375;

const openedMixin = (theme: Theme, parentContainer: ParentContainerDimensions, animationProps): CSSObject => {
  console.log('theme transitions', theme.transitions);
  let duration = theme.transitions.duration.enteringScreen;
  if (animationProps.anchor === 'right') {
    duration = -theme.transitions.duration.enteringScreen;
  }
  return ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: duration,
  }),
  top: parentContainer.headerHeight,
  height: parentContainer.height - parentContainer.headerHeight - parentContainer.footerHeight,
  overflowX: 'hidden',
});
}


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


type CustomDrawerHeaderProps = React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement> & {justifyContent: string};
type CustomDrawerProps = DrawerProps & { theme?: Theme; parentContainer: ParentContainerDimensions, animationProps: {
  // easing: number,
  // duration: number,
  anchor: string
} }

const DrawerHeader = styled('div', {
    shouldForwardProp: (prop) => prop !== 'justifyContent',
  })<CustomDrawerHeaderProps>(({ theme, justifyContent }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: justifyContent,
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'parentContainer' && prop !== 'animationProps',
})<CustomDrawerProps>(({ theme, open, parentContainer, animationProps }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    variants: [
      {
        props: ({ open }) => open,
        style: {
          ...openedMixin(theme, parentContainer, animationProps),
          '& .MuiDrawer-paper': openedMixin(theme, parentContainer, animationProps),
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

// todo rightside:  float chevron to the left and reverse logic, 
// todo is offsetting the canvas, reverse other logic

export const SideDrawer = (props: SideDrawerProps) => {
  const [open, setOpen] = React.useState(props.dataSidebarProps?.isDrawerOpen);

  const handleDrawerOpen = () => {
    setOpen(!open);
  };

  let chevronIcon = <ChevronLeftIcon /> 
  let justifyContent = 'flex-end';
  let variant: 'permanent' | 'temporary' = 'permanent';

  if (props.anchor == 'right') {
    chevronIcon = <ChevronRightIcon />;
    justifyContent = 'flex-start';
    variant = 'temporary';
  }
  
  const openButton = open? chevronIcon : <MenuIcon />;
  console.log(chevronIcon);
  return (
    <>
      <CssBaseline />
      <Drawer variant={variant}
        // open={open} 
        // anchor={props.anchor} 
        // parentContainer={props.parentContainer} 
        // animationProps={{anchor: props.anchor}}

        parentContainer={props.parentContainer} 
        animationProps={{anchor: props.anchor}}
        open={open}
        anchor={props.anchor}
        onClose={props.dataSidebarProps?.setIsDataDrawerOpen}
        
        // sx={{
        //     width: 400,
        //     flexShrink: 0,
        //     [`& .MuiDrawer-root`]: { zIndex: 0 },
        //     [`& .MuiBackdrop-root.MuiModal-backdrop`]: { opacity: '0 !important' },
        //     [`& .MuiDrawer-paper`]: { width: 400, zIndex: 0, boxSizing: 'border-box' },
        //     // [`& .MuiPaper-root`]: { top: '75px' },
        // }}

        >
        <DrawerHeader justifyContent={justifyContent}>
          <IconButton onClick={handleDrawerOpen}>
            {openButton}
          </IconButton>
        </DrawerHeader>
        <Box padding={'1rem .5rem'}>
          {open && props.menuSidebarProps &&
            <MenuSidebar {...props.menuSidebarProps} />
          }
        </Box>
      </Drawer>
    </>
  );
}  

export interface SideDrawerProps {
    anchor: 'left' | 'right',
    // isMenuDrawerOpen: boolean;
    // setIsMenuDrawerOpen: (boolean) => void;
    parentContainer: ParentContainerDimensions,
    menuSidebarProps?: MenuSidebarProps,
    dataSidebarProps?: DataSidebarProps
}




