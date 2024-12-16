import React, { useState } from 'react';

import { styled, Theme, CSSObject } from '@mui/material/styles';
import MuiDrawer, { DrawerProps } from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuSidebar, { MenuSidebarProps } from './MenuSidebar';
import { Box, Divider } from '@mui/material';
import { ParentContainerDimensions } from '../../../../src/process-flow-types/shared-process-flow-types';
import DrawerToggleButton from './DrawerToggleButton';

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


export const SideDrawer = (props: SideDrawerProps) => {
  const [open, setOpen] = React.useState(true);
  const toggleDrawerOpen = () => {
    setOpen(!open)
  };

  let justifyContent = 'flex-end';
  const closedButton = (<IconButton onClick={toggleDrawerOpen}>
    <MenuIcon/>
  </IconButton>);
  const drawerChevron = (<DrawerToggleButton toggleDrawer={toggleDrawerOpen} side={'left'}></DrawerToggleButton>);
  const toggleButton = open? drawerChevron : closedButton;

  
  return (
    <>
      <CssBaseline />
      <Drawer variant={'permanent'}
        parentContainer={props.parentContainer}
        animationProps={{ anchor: props.anchor }}
        open={open}
        anchor={props.anchor}
      >
        <DrawerHeader justifyContent={justifyContent}>
        {toggleButton}
        </DrawerHeader>
        <Box paddingBottom={'1rem'} paddingTop={0} paddingX={'.5rem'}>
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
    parentContainer: ParentContainerDimensions,
    menuSidebarProps?: MenuSidebarProps,
}




