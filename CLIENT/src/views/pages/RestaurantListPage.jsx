import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layouts/Navbar';

import RestaurantCard from '../../components/restaurant/RestaurantCard';
import Grid from '@material-ui/core/Grid';

import Divider from '@material-ui/core/Divider';
import LandingPage from '../../components/LandingPage';
import Container from '@material-ui/core/Container';
import Footer from '../../components/layouts/Footer';
import { getRestaurants } from './../../services/restaurant';

import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import clsx from 'clsx';
import Loader from '../../components/Loader';

const useStyles = makeStyles((theme) => ({
  mini: {
    height: '50vh !important',
  },
  title: {
    fontWeight: 700,
    marginLeft: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      maxWidth: 120,
    },
    marginTop: theme.spacing(2)
  },
}));

const RestaurantListPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true)
    getRestaurants().then((data) => {
      setRestaurants(data.filter(x => {
        if (!x.referencement) return false
        if (!x.status) return false
        return true
      }).sort((a, b) => a.priority - b.priority));
      setLoading(false)
    });
  }, []);
  const classes = useStyles();

  return (
    <>
      <Navbar />
      <LandingPage className={classes.mini} />
      <Container maxWidth="xl">
          <Typography
            component="h2"
            variant="h4"
            align="left"
            className={clsx(classes.title, 'translate')}
          >
            Restaurants
          </Typography>
        <Divider style={{ margin: '40px 0' }} />
        {loading ? (
          <Loader />
        ) : (
          <Grid container spacing={10} style={{ padding: '24px' }}>
            {restaurants.map((restaurant) => (
              <Grid key={restaurant._id} item xs={12} sm={4} md={3} lg={3} xl={3}>
                <RestaurantCard
                  item={restaurant}
                />
              </Grid>
            ))}
          </Grid>
        )}

        <Divider style={{ margin: '40px 0' }} />
      </Container>
      <Footer />
    </>
  );
};

export default RestaurantListPage;
