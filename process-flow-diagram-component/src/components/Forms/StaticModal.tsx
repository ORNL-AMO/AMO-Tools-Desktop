import { Backdrop, Box, Button, Fade, Modal, Typography, useTheme } from "@mui/material";
import React from "react";
import { selectIsModalOpen } from "../Diagram/store";
import { useAppDispatch, useAppSelector } from "../../hooks/state";
import { modalOpenChange } from "../Diagram/diagramReducer";
import EstimateWaterSystem from "./WaterSystemEstimation/EstimateWaterSystem";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  height: '90%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
};

export default function StaticModal(props: StaticModalProps) {
  const { shadowRootRef } = props;
  const theme = useTheme();
  const isModalOpen: boolean = useAppSelector(selectIsModalOpen);
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(modalOpenChange(false));
  };

  return (
    <div id="modal-container">
      <Modal
        open={isModalOpen}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 250,
          },
        }}
        container={() => {

          let container = shadowRootRef.getElementById('modal-container');
          console.log(container);
          console.log(shadowRootRef);
          return container;
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Fade in={isModalOpen}>
        <Box sx={style}>
          <Box display={'flex'} 
            justifyContent={'space-between'} 
            alignItems={'center'} 
            padding={'1rem'} 
            sx={{backgroundColor: theme.palette.primary.main}}>
            <Typography variant='h3' component={'h3'} sx={{ fontSize: '1.25rem', color: "#fff" }}>
               Estimate System Water Use
            </Typography>
            <Button onClick={handleClose} sx={{ fontSize: '.9rem', border: '1px solid #fff', padding: '.25rem', color: "#fff" }}>x</Button>
          </Box>
          <Box marginTop={'1rem'} height={'90%'} margin={'.5rem'} padding={'2rem'} paddingTop={0} sx={{overflowY: 'auto' }}>
            <EstimateWaterSystem shadowRootRef={shadowRootRef}/>
          </Box>
        </Box>
        </Fade>

      </Modal>
    </div>
  );
}

export interface StaticModalProps {
  shadowRootRef: any;
}

