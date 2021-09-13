import { Fab, withStyles } from '@material-ui/core';

const MiniFab = withStyles((theme) => ({
  root: {
    [theme.breakpoints.down('sm')]: {
      minHeight: 30,
      width: 30,
      height: 30,
    },
  },
  label: {
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.typography.pxToRem(16),
      '& svg': {
        fontSize: theme.typography.pxToRem(16),
      },
    },
  },
}))(Fab);

export default MiniFab;
