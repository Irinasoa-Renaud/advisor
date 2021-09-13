import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  loaderContainer: {
    height: 400,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const Loader: React.FC<{}> = () => {
  const classes = useStyles();

  return (
    <div className={classes.loaderContainer}>
      <CircularProgress />
    </div>
  );
};

export default Loader;
