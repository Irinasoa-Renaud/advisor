import React from 'react';
import { Fab, FabProps } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { red } from '@material-ui/core/colors';

const ColorButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: red[700],
    },
  },
}))(Fab);

const DeleteButton: React.FC<Omit<FabProps, 'children'>> = (props) => (
  <div>
    <ColorButton {...props}>
      <DeleteIcon />
    </ColorButton>
  </div>
);

export default DeleteButton;
