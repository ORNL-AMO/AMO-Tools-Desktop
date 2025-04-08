import React, { useState } from 'react';

import { styled, Theme, CSSObject } from '@mui/material/styles';
import MuiDrawer, { DrawerProps } from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MenuSidebar from './MenuSidebar';
import { Box } from '@mui/material';
import DrawerToggleButton from './DrawerToggleButton';
import { useAppSelector } from '../../hooks/state';
import { selectHasAssessment } from '../Diagram/store';
import { ParentContainerDimensions } from 'process-flow-lib';

const drawerWidth = 500;

const openedMixin = (theme: Theme, parentContainer: ParentContainerDimensions, animationProps): CSSObject => {
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
  zIndex: 'auto',
  top: parentContainer.headerHeight,
  height: parentContainer.height - parentContainer.headerHeight - parentContainer.footerHeight,
  boxShadow: '0 0 5px 0 rgba(136, 136, 136, .6)',
  overflow: 'hidden'
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
  boxShadow: '0 0 5px 0 rgba(136, 136, 136, .6)',
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
  const diagramParentDimensions = useAppSelector((state) => state.diagram.diagramParentDimensions);
  const hasAssessment = useAppSelector(selectHasAssessment);
  const [open, setOpen] = React.useState(!hasAssessment);

  const toggleDrawerOpen = () => {
    setOpen(!open)
  };

  let justifyContent = 'flex-end';
  const closedButton = (<IconButton onClick={toggleDrawerOpen}>
    <MenuIcon/>
  </IconButton>);
  const drawerChevron = (<DrawerToggleButton toggleSidebarDrawer={toggleDrawerOpen} side={'left'}></DrawerToggleButton>);
  const toggleButton = open? drawerChevron : closedButton;

  
  return (
    <>
      <CssBaseline />
      <Drawer variant={'permanent'}
        parentContainer={diagramParentDimensions}
        animationProps={{ anchor: props.anchor }}
        open={open}
        anchor={props.anchor}
      >
        <DrawerHeader justifyContent={justifyContent}>
        {toggleButton}
        </DrawerHeader>
        <Box paddingBottom={'1rem'} paddingTop={0} paddingX={'.5rem'} height={'100%'}>
          {open &&
            <MenuSidebar shadowRootRef={props.shadowRootRef} />
          }
        </Box>
      </Drawer>
    </>
  );
}  

export interface SideDrawerProps {
    anchor: 'left' | 'right',
    shadowRootRef: any,
}




