import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layouts/Navbar';
import Footer from '../../components/layouts/Footer';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const PageNotFound: React.FC = () => {
  const classes = useStyles();

  return (
    <>
      <Navbar hidePlaceholder hideSearchField hideCart />
      <div className={classes.root}>
        <Typography variant="h1" component="p" className="translate">
          Erreur
        </Typography>
        <Typography
          variant="h3"
          component="p"
          className="translate"
          gutterBottom
        >
          Page non trouvée
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          color="primary"
          size="large"
          className="translate"
        >
          Retourner à l'accueil
        </Button>
      </div>
      <Footer mini />
    </>
  );
};

export default PageNotFound;
