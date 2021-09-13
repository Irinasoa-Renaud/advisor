import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@material-ui/core';
import {
  Close as CloseIcon,
} from '@material-ui/icons';
import { SlideTransition } from '../transition';
import { useSnackbar } from 'notistack';

interface ItineraireDialogProps {
  open: boolean;
  itineraireExterne: string;
  setOpenItineraireDialog: React.Dispatch<React.SetStateAction<boolean>>;
  getDirection: Function;
}

const ItineraireDialog: React.FC<ItineraireDialogProps> = ({
  open,
  itineraireExterne,
  setOpenItineraireDialog,
  getDirection
}) => {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <Dialog
      open={open}
      TransitionComponent={SlideTransition}
      keepMounted
      fullWidth
      style={{zIndex: 999999999}}
      maxWidth="sm"
    >
      <DialogTitle className="translate" disableTypography>
        <Typography
          variant="h5"
          component="h3"
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <span className="translate">Itinéraire</span>
          <IconButton size="small" onClick={() => setOpenItineraireDialog(false)}>
            <CloseIcon />
          </IconButton>
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography className="translate" align="center" gutterBottom>
          Voir l'itineraire sur google map
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button className="translate" onClick={() => {
          getDirection()
          setOpenItineraireDialog(false);
        }}>
          Map interne
        </Button>
        <Button 
          color="primary"
          className="translate"
          onClick={() => {
            if (itineraireExterne !== '') {
              window.open(itineraireExterne, '_blank');
            } else {
              enqueueSnackbar('Erreur lors de la géolocalisation')
            }
            setOpenItineraireDialog(false);
          }}
        >
          Map externe
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ItineraireDialog;