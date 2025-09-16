import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useAppDispatch } from '../../hooks/state';
import { resetDiagram, setDialogOpen } from './diagramReducer';

const WarningDialog = (props: WarningDialogProps) => {
  const dispatch = useAppDispatch();
  
  const handleClose = () => {
    dispatch(setDialogOpen());
  };

  const handleReset = () => {
    dispatch(resetDiagram());
  };
  
  return (
    <React.Fragment>
      <Dialog
        open={props.isDialogOpen}
        onClose={handleClose}
        disablePortal={true}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Reset Diagram?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action will reset all diagram components, connecting lines, and customization.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleReset} autoFocus>
            Reset Diagram
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export interface WarningDialogProps {
 isDialogOpen: boolean;

}

export default WarningDialog;

export interface WarningActions {
  title: string;
  description: string;
  entityType: 'node' | 'edge';
  actionButtonLabel: string;
}