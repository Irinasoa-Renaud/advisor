import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@material-ui/core';
import {
  Close as CloseIcon,
} from '@material-ui/icons';
import { SlideTransition } from './transition';

interface ClearCartProps {
  open: boolean;
  setOpen: Function;
  action: Function;
  setClearCartAndAddFood: React.Dispatch<React.SetStateAction<boolean>>;
  setClearCartOption: React.Dispatch<React.SetStateAction<number>>;
  clearCartOption?: number;
}

const ClearCartModal: React.FC<ClearCartProps> = ({
  open,
  setOpen,
  action,
  setClearCartAndAddFood,
  setClearCartOption,
  clearCartOption
}) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={SlideTransition}
      keepMounted
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle className="translate" disableTypography>
        <Typography
          variant="h5"
          component="h3"
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <span className="translate">Attention</span>
          <IconButton size="small" onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography className="translate" align="center" gutterBottom>
          Vous ne pouvez pas commander dans plusieurs restaurants différents à la fois
        </Typography>
        <Typography className="translate" align="center" gutterBottom>
          Voulez vous vider votre pannier et commander ce plat
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button className="translate" onClick={() => {
          setClearCartAndAddFood(false)
          setOpen(false)
        }}>
          Non
        </Button>
        <Button className="translate" color="primary" onClick={() => {
          action()
          setClearCartAndAddFood(true)
          if (clearCartOption) {
            setClearCartOption(clearCartOption)
          }
          setOpen(false)
        }}>
          Oui
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ClearCartModal;