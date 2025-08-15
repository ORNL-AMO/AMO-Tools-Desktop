import React, { memo, useState } from 'react';

import { styled, Theme, CSSObject } from '@mui/material/styles';
import MuiDrawer, { DrawerProps } from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Box } from '@mui/material';
import DrawerToggleButton from './DrawerToggleButton';
import { ParentContainerDimensions } from 'process-flow-lib';
import { toggleDrawer } from '../Diagram/diagramReducer';
import { useAppDispatch, useAppSelector } from '../../hooks/state';
import { selectedDataColor } from '../Diagram/store';
const drawerWidth = 525;

const openedMixin = (theme: Theme, parentContainer: ParentContainerDimensions, anchorProps): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    boxShadow: '0 0 5px 0 rgba(136, 136, 136, .6)',
    overflow: 'hidden',
    top: parentContainer.headerHeight,
    height: parentContainer.height - parentContainer.headerHeight - parentContainer.footerHeight,
    position: 'fixed',
    left: anchorProps.anchor === 'left' ? 0 : 'auto',
    right: anchorProps.anchor === 'right' ? 0 : 'auto',
});

const closedMixin = (theme: Theme, parentContainer: ParentContainerDimensions, anchorProps): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    boxShadow: '0 0 5px 0 rgba(136, 136, 136, .6)',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
    top: parentContainer.headerHeight,
    height: parentContainer.height - parentContainer.headerHeight - parentContainer.footerHeight,
    position: 'fixed',
    left: anchorProps.anchor === 'left' ? 0 : 'auto',
    right: anchorProps.anchor === 'right' ? 0 : 'auto',
});


type CustomDrawerHeaderProps = React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement> & { justifyContent: string };
type CustomDrawerProps = DrawerProps & {
    theme?: Theme; parentContainer: ParentContainerDimensions, anchorProps: {
        // easing: number,
        // duration: number,
        anchor: string
    }
}

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
    shouldForwardProp: (prop) => prop !== 'open' && prop !== 'parentContainer' && prop !== 'anchorProps',
})<CustomDrawerProps>(({ theme, open, parentContainer, anchorProps }) => ({
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiDrawer-paper': {
        ...(open
            ? openedMixin(theme, parentContainer, anchorProps)
            : closedMixin(theme, parentContainer, anchorProps)
        )
    },
}),
);


const SharedDrawer = (props: SharedDrawerProps) => {
    const { diagramParentDimensions, anchor, shadowRootRef } = props;
    const dispatch = useAppDispatch();
    const selectedDataTypeColor = useAppSelector(selectedDataColor);
    let [open, setOpen] = React.useState(true);
    let toggleDrawerOpen: () => void;

    if (anchor === 'right') {
        open = useAppSelector((state) => state.diagram.isDrawerOpen);
        toggleDrawerOpen = () => {
            dispatch(toggleDrawer());
        };
    } else {
        toggleDrawerOpen = () => {
            setOpen(!open);
        };
    }

    let justifyContent = anchor === 'left' ? 'flex-end' : 'flex-start';
    const closedButton = (<IconButton onClick={toggleDrawerOpen}>
        <MenuIcon />
    </IconButton>);
    const drawerChevron = (<DrawerToggleButton toggleSidebarDrawer={toggleDrawerOpen} side={anchor}></DrawerToggleButton>);
    const toggleButton = open ? drawerChevron : closedButton;

    let borderLeft: string;
    if (anchor === 'right' && open) {
        borderLeft = `8px solid ${selectedDataTypeColor}`;
    }

    return (
        <>
            <CssBaseline />
            <Drawer variant={'permanent'}
                parentContainer={diagramParentDimensions}
                anchorProps={{ anchor: anchor }}
                open={open}
                anchor={anchor}
                sx={{
                    zIndex: 0,
                    '& .MuiPaper-root.MuiDrawer-paperAnchorRight': {
                        borderLeft: borderLeft,
                        paddingX: open ? '1rem' : '0'
                    },
                }}
            >
                <DrawerHeader justifyContent={justifyContent}>
                    {toggleButton}
                </DrawerHeader>
                {open &&
                    props.children
                }
            </Drawer>
        </>
    );
}

export default memo(SharedDrawer);

export interface SharedDrawerProps {
    anchor: 'left' | 'right',
    shadowRootRef: any,
    diagramParentDimensions: ParentContainerDimensions,
    children?: React.ReactNode
}




