import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '../../components/layouts/Navbar';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import Grid from '@material-ui/core/Grid';
import LandingPage from '../../components/LandingPage';
import Container from '@material-ui/core/Container';
import Footer from '../../components/layouts/Footer';
import Typography from '@material-ui/core/Typography';
import { getRestaurants } from './../../services/restaurant';
import { getRestoRecommander } from '../../services/restoRecommander'
import { getPlatRecommander } from '../../services/platRecommander'
import Restaurant from '../../models/Restaurant.model';
import RestoRecommander from '../../models/RestoRecommander.model';
import PlatPopulaire from '../../components/PlatPopulaire';
import {
  Box,
  Button,
  Fab,
  makeStyles,
  Theme,
  useMediaQuery,
} from '@material-ui/core';
import FoodCategories from '../../components/foods/FoodCategories';
import Food from '../../models/Food.model';
import { getFoods } from '../../services/food';
import { SliderContainer, SliderSection } from '../../components/Slider';
import { getChunks } from '../../utils/array';
import { useSnackbar } from 'notistack';
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Refresh,
} from '@material-ui/icons';
import clsx from 'clsx';
import Loader from '../../components/Loader';
import NoResult from '../../components/NoResult';
import { Link, useHistory } from 'react-router-dom';
import { getGeoLocation } from '../../services/location';
import RestoRecommnader from '../../components/restoRecommnader';

const useStyles = makeStyles((theme) => ({
  heading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing(3.5),
  },
  title: {
    fontWeight: 700,
    marginLeft: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      maxWidth: 120,
    },
  },
  sliderControls: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(3),
    '&>a': {
      color: 'black',
      marginRight: theme.spacing(2),
    },
    '&>button+button': {
      marginLeft: theme.spacing(1),
    },
  },
}));

const HomePage: React.FC = () => {
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const [loadingNearestRestaurants, setLoadingNearestRestaurants] = useState(
    false
  );
  const [nearestRestaurants, setNearestRestaurants] = useState<Restaurant[]>(
    []
  );
  const [nearestRestaurantSection, setNearestRestaurantSection] = useState(0);

  const [loadingNewRestaurants, setLoadingNewRestaurants] = useState(false);
  const [newRestaurants, setNewRestaurants] = useState<Restaurant[]>([]);
  const [newRestaurantSection, setNewRestaurantSection] = useState(0);

  //Resto recommander
  const [loadingRestoRecommander, setLoadingRestoRecommander] = useState(false);
  const [newRestoRecoSection, setRestoRecoSection] = useState(0);
  const [restoReco, setRestoReco] = useState<RestoRecommander[]>([]);

  //Plat recommander

  const [loadingPopularFoods, setLoadingPopularFoods] = useState(false);
  const [popularFoods, setPopularFoods] = useState<Food[]>([]);
  const [foodsId, setFoodsId] = useState<any[]>([]);
  const [popularFoodSection, setPopularFoodSection] = useState(0);

  const [geoLocationError, setGeoLocationError] = useState(false);

  const abovelg = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  const betweenMdAndLg = useMediaQuery((theme: Theme) =>
    theme.breakpoints.between('md', 'lg')
  );

  const betweenSmAndMd = useMediaQuery((theme: Theme) =>
    theme.breakpoints.between('sm', 'md')
  );

  const [chunkSize, setChunkSize] = useState(() =>
    abovelg ? 4 : betweenMdAndLg ? 3 : betweenSmAndMd ? 2 : 1
  );

  const history = useHistory();

  useEffect(() => {
    setChunkSize(abovelg ? 4 : betweenMdAndLg ? 3 : betweenSmAndMd ? 2 : 1);
  }, [abovelg, betweenMdAndLg, betweenSmAndMd]);

  useEffect(() => {
    setLoadingNewRestaurants(true);
    setNewRestaurants([]);
    setNewRestaurantSection(0);

    getRestaurants({
      limit: 4,
      searchCategory: 'new',
    })
      .then((data) => {
        setNewRestaurants(data);
        setLoadingNewRestaurants(false);
      })
      .catch(() => {
        enqueueSnackbar('Erreur lors du chargement des nouveaux restaurants');
      });
  }, [enqueueSnackbar]);

  useEffect(() => {
    getFoods({
      limit: 6,
      lang: 'fr',
      searchCategory: 'popular',
    })
      .then((data) => {
        setPopularFoods(data);
      })
      .catch(() => {
        enqueueSnackbar('Erreur lors du chargement des plat populaires');
      });
  }, [enqueueSnackbar]);

  //restoReco
  useEffect(() => {
    setLoadingRestoRecommander(true)
    setRestoReco([])
    setRestoRecoSection(0)

    getRestoRecommander()
      .then((data) => {
        setRestoReco(data)
        setLoadingRestoRecommander(false)

      })
      .catch(() => {
        enqueueSnackbar('Erreur lors du chargement des restaurants recommander');
      });
  }, [enqueueSnackbar]);

  // PlatReco
  useEffect(() => {
    setLoadingPopularFoods(true);
    setPopularFoods([]);
    getPlatRecommander()
      .then((data) => {
        const array = data
          .sort((a: any, b: any) => a.priority - b.priority)
          .map((item: any) => item.food._id)
        const recommande = [].concat(...array);
        setFoodsId(recommande);
        setLoadingPopularFoods(false);
      })
      .catch(() => {
        enqueueSnackbar('Erreur lors du chargement des plats recommander');
      });
  }, [enqueueSnackbar]);

  const filter = (array: any[], id: any[]) => {

    const arrayNew = [];

    for (let i = 0; i < id.length; i++) {
      arrayNew.push(array.filter((items: any) => items._id === id[i])[0])
    }

    return arrayNew;

  }

  const getNearestRestaurants = useCallback(() => {
    (async function () {
      setLoadingNearestRestaurants(true);
      setNearestRestaurantSection(0);

      try {
        const {
          coords: { latitude: lat, longitude: lng },
        } = await getGeoLocation();

        const coords = await getGeoLocation();

        const datas = await getRestaurants({
          limit: 3,
          searchCategory: 'nearest',
          coordinates: [lng, lat],
        });

        setNearestRestaurants(datas);
      } catch (e) {
        setGeoLocationError(true);
        enqueueSnackbar(
          `Erreur lors de la géolocalisation`,
          {
            variant: 'error',
          }
        );
      } finally {
        setLoadingNearestRestaurants(false);
      }
    })();
  }, [enqueueSnackbar]);

  useEffect(getNearestRestaurants, []);

  return (
    <>
      <Navbar
        onSearchSubmitted={(query) => history.push(`/search?q=${query}`)}
      />
      <LandingPage />
      <FoodCategories />
      <Container maxWidth="xl">
        <div className={classes.heading}>
          <Typography
            component="h2"
            variant="h4"
            align="left"
            className={clsx(classes.title, 'translate')}
          >
            Nouveaux restaurants
          </Typography>
          <div className={classes.sliderControls}>
            <Typography
              variant="h6"
              component={Link}
              to="/restaurants"
              className="translate"
            >
              Voir tout
            </Typography>
            {newRestaurants.length > chunkSize && (
              <>
                <div>
                  <Fab
                    size="small"
                    disabled={!newRestaurantSection}
                    onClick={() => setNewRestaurantSection((v) => v - 1)}
                  >
                    <KeyboardArrowLeft />
                  </Fab>
                </div>
                <Box width={10} />
                <div>
                  <Fab
                    size="small"
                    disabled={
                      newRestaurantSection ===
                      Math.ceil(newRestaurants.length / chunkSize) - 1
                    }
                    onClick={() => setNewRestaurantSection((v) => v + 1)}
                  >
                    <KeyboardArrowRight />
                  </Fab>
                </div>
              </>
            )}
          </div>
        </div>
        {loadingNewRestaurants ? (
          <Loader />
        ) : !newRestaurants.length ? (
          <NoResult />
        ) : (
          <SliderContainer
            direction="horizontal"
            position={newRestaurantSection}
          >
            {getChunks<Restaurant>(newRestaurants, chunkSize).map(
              (restaurants, i) => (
                <SliderSection index={i} key={i}>
                  <Grid container spacing={4} style={{ padding: '24px' }}>
                    {restaurants.map((restaurant) => (
                      <Grid
                        key={restaurant._id}
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                      >
                        <RestaurantCard item={restaurant} />
                      </Grid>
                    ))}
                  </Grid>
                </SliderSection>
              )
            )}
          </SliderContainer>
        )}

        <PlatPopulaire
          clsx={clsx}
          Link={Link}
          title="Plats populaires"
        />

        {/* Resto recommander here */}
        <div className={classes.heading}>
          <Typography
            component="h2"
            variant="h4"
            align="left"
            className={clsx(classes.title, 'translate')}
          >
            Restaurants Recommander
          </Typography>
          <div className={classes.sliderControls}>
            <Typography
              variant="h6"
              component={Link}
              to="/restaurant recommander"
              className="translate"
            >
              Voir tout
            </Typography>
            {restoReco.length > chunkSize && (
              <>
                <div>
                  <Fab
                    size="small"
                    disabled={!newRestoRecoSection}
                    onClick={() => setRestoRecoSection((v) => v - 1)}
                  >
                    <KeyboardArrowLeft />
                  </Fab>
                </div>
                <Box width={10} />
                <div>
                  <Fab
                    size="small"
                    disabled={
                      newRestoRecoSection ===
                      Math.ceil(nearestRestaurants.length / chunkSize) - 1
                    }
                    onClick={() => setRestoRecoSection((v) => v + 1)}
                  >
                    <KeyboardArrowRight />
                  </Fab>
                </div>
              </>
            )}
          </div>
        </div>

        <RestoRecommnader />

        <div className={classes.heading}>
          <Typography
            component="h2"
            variant="h4"
            align="left"
            className={clsx(classes.title, 'translate')}
          >
            Restaurants d'à côté
          </Typography>
          <div className={classes.sliderControls}>
            <Typography
              variant="h6"
              component={Link}
              to="/search?type=restaurant&searchCategory=nearest"
              className="translate"
            >
              Voir tout
            </Typography>
            {nearestRestaurants.length > chunkSize && (
              <>
                <div>
                  <Fab
                    size="small"
                    disabled={!nearestRestaurantSection}
                    onClick={() => setNearestRestaurantSection((v) => v - 1)}
                  >
                    <KeyboardArrowLeft />
                  </Fab>
                </div>
                <Box width={10} />
                <div>
                  <Fab
                    size="small"
                    disabled={
                      nearestRestaurantSection ===
                      Math.ceil(nearestRestaurants.length / chunkSize) - 1
                    }
                    onClick={() => setNearestRestaurantSection((v) => v + 1)}
                  >
                    <KeyboardArrowRight />
                  </Fab>
                </div>
              </>
            )}
          </div>
        </div>

        {loadingNearestRestaurants ? (
          <Loader />
        ) : geoLocationError ? (
          <Grid
            container
            justify="center"
            alignItems="center"
            style={{ height: 400 }}
          >
            <Typography variant="h5" color="textSecondary" align="center">
              <span className="translate">
                Impossible d'obtenir vos données de localisation.
              </span>
              <br />
              <span className="translate">
                Veuillez vérifier que vous avez approuvé la géolocalisation
              </span>
              <br />
              <Button
                startIcon={<Refresh />}
                onClick={getNearestRestaurants}
                className="translate"
              >
                Réessayer
              </Button>
            </Typography>
          </Grid>
        ) : !nearestRestaurants.length ? (
          <NoResult />
        ) : (
          <SliderContainer
            direction="horizontal"
            position={nearestRestaurantSection}
          >
            {getChunks<Restaurant>(nearestRestaurants, chunkSize).map(
              (restaurants, i) => (
                <SliderSection key={i} index={i}>
                  <Grid container spacing={4} style={{ padding: '24px' }}>
                    {restaurants
                      .sort((a: any, b: any) => a.priority - b.priority)
                      .map((restaurant) => (
                        <Grid
                          key={restaurant._id}
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          lg={3}
                        >
                          <RestaurantCard item={restaurant} />
                        </Grid>
                      ))}
                  </Grid>
                </SliderSection>
              )
            )}
          </SliderContainer>
        )}

        <Box height={40} />
      </Container>
      <Footer />
    </>
  );
};

export default HomePage;
