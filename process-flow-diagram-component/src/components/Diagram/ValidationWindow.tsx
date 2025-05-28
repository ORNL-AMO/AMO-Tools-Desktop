import { Paper, Typography, Stack, Alert, Button, Box, Collapse } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { Node } from '@xyflow/react';
import { selectNodes } from "./store";
import { toggleDrawer, validationWindowOpenChange } from "./diagramReducer";
import InvalidIcon from "../../validation/InvalidIcon";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from "react";
import EastIcon from '@mui/icons-material/East';
import WestIcon from '@mui/icons-material/West';
import { getHasErrorLevel, getHasFlowError, getHasTotalFlowError, NodeErrors, NodeFlowTypeErrors, ProcessFlowPart } from "process-flow-lib";

const ValidationWindow = () => {
  const dispatch = useAppDispatch();
  const nodes: Node[] = useAppSelector(selectNodes);
  const errors: NodeErrors = useAppSelector((state) => state.diagram.nodeErrors);
  const openLocation: ValidationWindowLocation = useAppSelector((state) => state.diagram.validationWindowLocation);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSetOpenLocation = (state: ValidationWindowLocation) => {
    dispatch(validationWindowOpenChange(state));
  }

  const handleFixIssue = (nodeId: string) => {
      dispatch(toggleDrawer(nodeId));
  }


  const hasErrorLevel = getHasErrorLevel(errors);
  const maxAlertlevel = hasErrorLevel ? 'error' : 'warning';
  const alertLevelColor = `${maxAlertlevel}.light`;

  let windowPositionProps = {
    position: "absolute",
    left: 550,
    top: 90,
    width: 400,
    zIndex: 999,
  }

  return (
        <Box
          sx={openLocation === 'diagram' ? windowPositionProps : undefined}
        >
          <Paper
            elevation={6}
            sx={{
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              borderRadius: 2,
              boxShadow: openLocation === 'diagram' ? 3 : 'none',
              border: "1px solid",
              borderColor: alertLevelColor,
              maxHeight: '500px',
            }}
          >

            <Box display={'flex'} justifyContent={'space-between'} sx={{ paddingLeft: '1rem', 
              backgroundColor: hasErrorLevel? '#ffebee' : '#fff3e0', 
              minHeight: '60px'
              }} >
              <Box display={'flex'} alignItems={'center'}>
                <InvalidIcon level={maxAlertlevel} useOutline={true}></InvalidIcon>
                <Typography variant="h2" sx={{
                  fontWeight: "bold",
                  p: '.5rem',
                  fontSize: '16px',
                  color: `${maxAlertlevel}.dark`
                }}>
                  Components Require Review
                </Typography>
              </Box>

              <Box display={'flex'} alignItems={'center'}>
                {openLocation === 'diagram' &&
                  <Button onClick={() => setIsCollapsed(!isCollapsed)} sx={{ color: `${maxAlertlevel}.dark`, minWidth: '64px' }}>
                    {isCollapsed? <ExpandLessIcon style={{ scale: '1.25' }}></ExpandLessIcon> : <ExpandMoreIcon style={{ scale: '1.25' }}></ExpandMoreIcon>}
                  </Button>
                }
              </Box>
            </Box>

            <Collapse
              in={!isCollapsed || openLocation === 'alerts-tab'}
              timeout={100}
              unmountOnExit
              sx={{ flexGrow: 1, maxHeight: "inherit" }}
            >
              <Stack spacing={1} sx={{ p: ".5rem .25rem", overflowY: "auto", maxHeight: "calc(440px - 60px)" }}>
                  {Object.entries(errors).map(([key, errors]: [string, NodeFlowTypeErrors]) => {
                    const node: Node<ProcessFlowPart> = nodes.find((n) => n.id === key) as Node<ProcessFlowPart>;
                    if (node) {
                      const name = node.data.name || "Unnamed Component";
                      const hasTotalFlowError = getHasTotalFlowError(errors);
                      const hasFlowError = getHasFlowError(errors);
                      const currentAlertLevel = hasTotalFlowError ? 'error' : 'warning';
                      
                      if (hasTotalFlowError || hasFlowError) {
                        return (
                          <Alert severity={currentAlertLevel}
                            key={key}
                            sx={{
                              borderLeft: "4px solid",
                              borderColor: `${currentAlertLevel}.dark`,
                              color: `${currentAlertLevel}.dark`,
                              p: '.25rem .5rem',
                              borderRadius: 1
                            }}
                            action={
                              <Button
                                size="small"
                                sx={{ fontSize: '.75rem', marginRight: '1rem', color: `${currentAlertLevel}.dark` }}
                                onClick={() => handleFixIssue(key)}>
                                Fix Issue
                              </Button>
                            }>
                            <Typography variant="body2" fontWeight="bold" sx={{ color: `${currentAlertLevel}.dark`, fontSize: '.75rem' }}>
                              {/* // todo truncate */}
                              <span>{name}</span>

                            </Typography>
                          </Alert>
                        )
                      } else {
                        return null;
                      }
                    }

                  })}
              </Stack>
            </Collapse>
            <Stack display={'flex'} flexDirection={'row'} alignItems={'center'} padding={'.5rem'}>
              {openLocation === 'diagram' ?
                <>
                  <Button onClick={(e) => handleSetOpenLocation('alerts-tab')} variant="outlined" color={maxAlertlevel} sx={{ color: `${maxAlertlevel}.dark`, minWidth: '1rem', width: '100%' }}>
                    <WestIcon style={{ scale: '.9' }}></WestIcon>
                    <Typography variant="body2" marginX={'.25rem'} sx={{ fontSize: '.75rem', color: `${maxAlertlevel}.dark` }}>
                      Dismiss to Alerts tab
                    </Typography>
                  </Button>
                </>
                :
                <>
                  <Button onClick={(e) => handleSetOpenLocation('diagram')} variant="outlined" color={maxAlertlevel} sx={{ color: `${maxAlertlevel}.dark`, minWidth: '1rem', width: '100%' }}>
                    <Typography variant="body2" marginX={'.25rem'} sx={{ fontSize: '.75rem', color: `${maxAlertlevel}.dark` }}>
                      View over Diagram
                    </Typography>
                    <EastIcon style={{ scale: '.9' }}></EastIcon>
                  </Button>
                </>
              }
            </Stack>
          </Paper>
        </Box>
  );
};

export default ValidationWindow;
export type ValidationWindowLocation = 'diagram' | 'alerts-tab' ;