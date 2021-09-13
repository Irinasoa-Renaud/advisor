import {
  AppBar,
  Container,
  Grid,
  makeStyles,
  Tab,
  Tabs,
  useTheme,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import SwipeableViews from 'react-swipeable-views';
import FoodCard from '../../components/foods/FoodCard';
import Navbar from '../../components/layouts/Navbar';
import Loader from '../../components/Loader';
import NoResult from '../../components/NoResult';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import Food from '../../models/Food.model';
import Restaurant from '../../models/Restaurant.model';
import User from '../../models/User.model';
import RootState from '../../redux/types';
import { Lang } from '../../redux/types/setting';
import { getFoodWithId } from '../../services/food';
import { getRestaurantWithId } from '../../services/restaurant';
import querystring from 'querystring';

const useStyles = makeStyles((theme) => ({
  container: {
    height: `calc(100vh - ${theme.mixins.toolbar.height}px)`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: 0,
    },
  },
  swipeableView: {
    flexGrow: 1,
  },
}));

interface FavoritesPageStateProps {
  user: User | null;
  lang: Lang;
}

interface FavoritesPageDispatchProps {}

interface FavoritesPageOwnProps {}

type FavoritesPageProps = FavoritesPageStateProps &
  FavoritesPageDispatchProps &
  FavoritesPageOwnProps;

const FavoritesPage: React.FC<FavoritesPageProps> = ({ user, lang }) => {
  const classes = useStyles();

  const { search } = useLocation();
  const history = useHistory();

  const { section } = querystring.parse(search.substr(1));

  const [loadingFavoriteFoods, setLoadingFavoriteFoods] = useState(false);
  const [favoriteFoods, setFavoriteFoods] = useState<Food[]>([]);

  const [loadingFavoriteRestaurants, setLoadingFavoriteRestaurants] = useState(
    false
  );
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>(
    []
  );

  const [tabIndex, setTabIndex] = useState(section === 'restaurants' ? 1 : 0);

  const handleTabChange: (
    event: React.ChangeEvent<{}>,
    value: number
  ) => void = (_, value) => {
    onTabChange(value);
  };

  const onTabChange = (value: number) => {
    setTabIndex(value);
    history.replace(`/favorites?section=${value ? 'restaurants' : 'foods'}`);;
  };

  const theme = useTheme();

  useEffect(() => {
    if (user) {
      setLoadingFavoriteFoods(true);

      (async function () {
        const favoriteFoodsPromises = user.favoriteFoods.map((id) =>
          getFoodWithId(id, lang)
        );
        const results: Food[] = [];
        for (const p of favoriteFoodsPromises) {
          try {
            const f = await p;
            results.push(f);
          } catch (error) {}
        }
        setFavoriteFoods(results);
        setLoadingFavoriteFoods(false);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      setLoadingFavoriteRestaurants(true);

      (async function () {
        const favoriteRestaurantsPromises = user.favoriteRestaurants.map((id) =>
          getRestaurantWithId(id, lang)
        );
        const results: Restaurant[] = [];
        for (const p of favoriteRestaurantsPromises) {
          try {
            const r = await p;
            results.push(r);
          } catch (error) {}
        }
        setFavoriteRestaurants(results);
        setLoadingFavoriteRestaurants(false);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      <Navbar hideCart hideSearchField />
      <Container maxWidth="xl" className={classes.container}>
        <AppBar position="static" color="default">
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
            aria-label="full width tabs example"
          >
            <Tab
              label={<span className="translate">Plats</span>}
              {...a11yProps(0)}
            />
            <Tab
              label={<span className="translate">Restaurants</span>}
              {...a11yProps(1)}
            />
          </Tabs>
        </AppBar>

        <SwipeableViews
          className={classes.swipeableView}
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={tabIndex}
          onChangeIndex={onTabChange}
          disableLazyLoading
        >
          <Container maxWidth="xl">
            {loadingFavoriteFoods ? (
              <Loader />
            ) : favoriteFoods.length ? (
              <Grid container spacing={4} style={{ padding: '24px' }}>
                {favoriteFoods.map((food) => (
                  <Grid item key={food._id} xs={12} sm={6} md={4} lg={3}>
                    <FoodCard popular item={food} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <NoResult text="Aucun plat favoris" />
            )}
          </Container>
          <Container maxWidth="xl">
            {loadingFavoriteRestaurants ? (
              <Loader />
            ) : favoriteRestaurants.length ? (
              <Grid container spacing={4} style={{ padding: '24px' }}>
                {favoriteRestaurants.map((restaurant) => (
                  <Grid item key={restaurant._id} xs={12} sm={6} md={4} lg={3}>
                    <RestaurantCard item={restaurant} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <NoResult text="Aucun restaurant favoris" />
            )}
          </Container>
        </SwipeableViews>
      </Container>
    </>
  );
};

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

const mapStateToProps: MapStateToProps<
  FavoritesPageStateProps,
  FavoritesPageOwnProps,
  RootState
> = ({ auth: { user }, setting: { lang } }) => ({
  user,
  lang,
});

const ConnectedFavoritesPage = connect<
  FavoritesPageStateProps,
  FavoritesPageDispatchProps,
  FavoritesPageOwnProps,
  RootState
>(mapStateToProps)(FavoritesPage);

export default ConnectedFavoritesPage;
