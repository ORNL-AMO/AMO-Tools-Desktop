import { getHasErrorLevel, getHasFlowError, getHasTotalFlowError, getIsDiagramValid } from "../../validation/Validation";
import { Paper, Typography, Stack, Alert, Button, Box, Collapse } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { NodeErrors, NodeFlowTypeErrors, ProcessFlowPart } from "../../../../src/process-flow-types/shared-process-flow-types";
import { Node } from '@xyflow/react';
import { selectNodes } from "./store";
import { toggleDrawer, toggleValidationWindow } from "./diagramReducer";
import InvalidIcon from "../../validation/InvalidIcon";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SmallTooltip from "../StyledMUI/SmallTooltip";
import { useState } from "react";
import NotificationsPausedIcon from '@mui/icons-material/NotificationsPaused';

const ValidationWindow = () => {
  const dispatch = useAppDispatch();
  const nodes: Node[] = useAppSelector(selectNodes);
  const errors: NodeErrors = useAppSelector((state) => state.diagram.nodeErrors);
  const isWindowOpen = useAppSelector((state) => state.diagram.isValidationWindowOpen);
  
  const isDiagramValid = getIsDiagramValid(errors);
  const [isSilenced, setIsSilenced] = useState(false);

  const toggleWindow = () => {
    dispatch(toggleValidationWindow());
  }

  const handleFixIssue = (nodeId: string) => {
    toggleWindow();
    // * allow window close or new state causes rerender
    setTimeout(() => {
      dispatch(toggleDrawer(nodeId));
    }, 150);
  }

  const handleSilenceAlerts = () => {
    setIsSilenced(!isSilenced);
  }

  const hasErrorLevel = getHasErrorLevel(errors);
  const maxAlertlevel = hasErrorLevel ? 'error' : 'warning';
  const alertLevelColor = `${maxAlertlevel}.light`;
  return (
    <>
      {!isDiagramValid && !isSilenced &&
        <Box
          sx={{
            position: "absolute",
            left: 400,
            top: 90,
            width: 500,
            zIndex: 999,
          }}
        >
          <Paper
            elevation={6}
            sx={{
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              borderRadius: 2,
              boxShadow: 3,
              border: "1px solid",
              borderColor: alertLevelColor,
              maxHeight: '350px',
            }}
          >

            <Box display={'flex'} justifyContent={'space-between'} sx={{ paddingLeft: '1rem', 
              backgroundColor: hasErrorLevel? '#ffebee' : '#fff3e0', 
              minHeight: '50px'
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
                <SmallTooltip title="Hide alert window while building. Alerts can still be viewed in the Help tab." slotProps={{
                    popper: {
                        disablePortal: true,
                    }
                }}>
                  <Stack alignItems={'center'}>
                    <Button onClick={handleSilenceAlerts} sx={{ color: `${maxAlertlevel}.dark`, minWidth: '1rem' }}>
                      <NotificationsPausedIcon style={{ scale: '.9' }}></NotificationsPausedIcon>
                    </Button>
                    {/* <Typography variant="body2" sx={{ fontSize: '.75rem', color: `${maxAlertlevel}.dark` }}>
                      Hide Alerts
                    </Typography> */}
                  </Stack>
                </SmallTooltip>
                <Button onClick={toggleWindow} sx={{ color: `${maxAlertlevel}.dark`, minWidth: '64px' }}>
                  {isWindowOpen ? <ExpandLessIcon style={{ scale: '1.25' }}></ExpandLessIcon> : <ExpandMoreIcon style={{ scale: '1.25' }}></ExpandMoreIcon>}
                </Button>
              </Box>
            </Box>

            <Collapse
              in={isWindowOpen}
              timeout={100}
              unmountOnExit
              sx={{ flexGrow: 1, maxHeight: "inherit" }}
            >
              <Stack spacing={1} sx={{ p: ".5rem .25rem", overflowY: "auto", maxHeight: "calc(300px - 50px)" }}>
                {!isDiagramValid &&
                  Object.entries(errors).map(([key, errors]: [string, NodeFlowTypeErrors]) => {
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

          </Paper>
        </Box>
      }
    </>
  );
};

export default ValidationWindow;
