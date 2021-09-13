import React from 'react';
import {
  Fab,
  makeStyles,
  Tooltip,
  useScrollTrigger,
  useTheme,
  Zoom,
} from '@material-ui/core';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    color: 'white',
    zIndex: 10000,
  },
}));

const FloatingCartButton: React.FC = () => {
  const classes = useStyles();

  const trigger = useScrollTrigger();

  const theme = useTheme();

  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  return (
    <Zoom
      in={trigger}
      timeout={transitionDuration}
      style={{
        transitionDelay: `${trigger ? transitionDuration.exit : 0}ms`,
      }}
      unmountOnExit
    >
      <Tooltip title={<span className="translate">Passer ma commande</span>}>
        <Fab
          component={Link}
          to="/checkout"
          aria-label={'Cart'}
          className={classes.fab}
          color="primary"
        >
          <ShoppingCartIcon />
        </Fab>
      </Tooltip>
    </Zoom>
  );
};

export default FloatingCartButton;
