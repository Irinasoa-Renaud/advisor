import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LocationOn } from '@material-ui/icons';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    '&>.info': {
      display: 'none',
    },
    '&:hover>.info': {
      display: 'block',
      position: 'absolute',
      bottom: `calc(100% + ${theme.spacing(1)}px)`,
      minWidth: 100,
      minHeight: 20,
      borderRadius: 4,
    },
  },
  label: {
    color: 'white',
    maxWidth: 1000,
    padding: theme.spacing(0.5, 1),
    whiteSpace: 'nowrap',
  },
}));

interface MarkerProps {
  lng: number;
  lat: number;
  label?: React.ReactNode;
}

const Marker: React.FC<MarkerProps> = ({ label }) => {
  const classes = useStyles();

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      className={classes.root}
    >
      <Grid item>
        <LocationOn color="primary" fontSize="large" />
      </Grid>
      <Grid item>
        <Typography variant="h6" component="span" className={classes.label}>
          {label}
        </Typography>
      </Grid>
      <div className="info"></div>
    </Grid>
  );
};

export default Marker;
