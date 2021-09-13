import React, { FC, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import WarningIcon from '@material-ui/icons/Warning';


interface IDialog {
  openDialog: boolean;
  setOpen: (data: boolean) => void;
  message: string;
}

const AlertDialog: FC<IDialog> = (props: any) => {

  const { openDialog, setOpen, message } = props as IDialog;

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog
        open={openDialog}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <h1>
              {message}
            </h1>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            variant="contained"
            color="primary"
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AlertDialog
