import React from 'react';
import logo from './../assets/images/logo.png';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Android from '@material-ui/icons/Android';
import Apple from '@material-ui/icons/Apple';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(0.4),
  },
  button: {
    margin: theme.spacing(0.5),
    fontSize: 12,
    textTransform: 'none',
    borderRadius: 1000,
  },
  iphone: {
    backgroundColor: 'white',
  },
  android: {
    backgroundColor: '#346134',
    color: 'white',
    '&:hover': {
      backgroundColor: '#5c9e5c',
    },
  },
  logo: {
    width: 60,
  },
  quote: {
    marginLeft: theme.spacing(1),
    lineHeight: 1,
  },
}));

interface BannerProps {
  className?: string;
}

const Banner: React.FC<BannerProps> = ({ className }) => {
  const classes = useStyles();

  return (
    <div className={clsx(classes.root, className)}>
      <div className={classes.top}>
        <img src={logo} alt="logo" className={classes.logo} />
        <Typography className={classes.quote}>
          There's more to love
          <br /> in the app.
        </Typography>
      </div>
      <div>
        <Button
          variant="contained"
          className={clsx(classes.button, classes.iphone)}
          startIcon={<Apple />}
        >
          Iphone
        </Button>
        <Button
          variant="contained"
          color="primary"
          className={clsx(classes.button, classes.android)}
          startIcon={<Android />}
        >
          Android
        </Button>
      </div>
    </div>
  );
};

export default Banner;
