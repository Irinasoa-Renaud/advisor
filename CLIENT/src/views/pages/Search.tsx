import React, { useCallback, useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

import Navbar from '../../components/layouts/Navbar';

import {
  Avatar,
  Chip,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  useTheme,
} from '@material-ui/core';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import FoodCard from '../../components/foods/FoodCard';
import search from '../../services/all';
import back from './../../assets/images/back.jpg';
import { connect, MapStateToProps } from 'react-redux';
import RootState from '../../redux/types';
import Food from '../../models/Food.model';
import Restaurant from '../../models/Restaurant.model';
import { ArrowDropDown, ArrowDropUp } from '@material-ui/icons';
import getFoodAttributes from '../../services/foodattributes';
import FoodAttribute from '../../models/FoodAttribute.model';
import { useLocation } from 'react-router-dom';
import querystring, { parse } from 'querystring';
import Axios, { CancelTokenSource } from 'axios';
import { Lang } from '../../redux/types/setting';
import FoodCategory from '../../models/FoodCategory.model';
import { getFoodCategories } from '../../services/food';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2, 0),
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  landing: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage: `url(${back})`,
    backgroundSize: 'cover',
    height: '100vh',
    width: '100%',
  },
  fields: {
    '& > *': {
      margin: theme.spacing(1),
      width: '40ch',
    },
  },
  button: {
    margin: theme.spacing(1),
    padding: theme.spacing(2),
    backgroundColor: '#dc143c',
    color: 'white',
    border: '1px solid transparent',
    '&:hover': {
      borderColor: 'white',
    },
  },
  margin: {
    margin: theme.spacing(1),
  },
  title: {
    color: 'white',
  },
  searchContainer: {
    display: 'flex',
    width: 300,
    paddingTop: theme.spacing(1.4),
    paddingBottom: theme.spacing(1.4),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    backgroundColor: 'white',
    border: '1px solid grey',
    alignItems: 'center',
  },
  searchField: {
    flex: 1,
    border: 'none',
    outline: 'none',
  },
  searchOptionHead: {
    height: 60,
    padding: theme.spacing(0, 2),
  },
  searchOptions: {
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(4),
    },
  },
  label: {
    width: '100%',
  },
  formControl: {
    paddingLeft: theme.spacing(2),
  },
}));

interface SearchStateProps {
  lang: Lang;
}

interface SearchDispatchProps { }

interface SearchOwnProps { }

type SearchProps = SearchStateProps & SearchDispatchProps & SearchOwnProps;


const Search: React.FC<SearchProps> = ({ lang }) => {
  const { search: s } = useLocation();
  const { q, type = 'all', attributes = [] } = querystring.parse(s.substr(1));

  const [loading, setLoading] = useState<boolean>(false);
  const [foods, setFoods] = useState<Food[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const [foodAttributes, setFoodAttributes] = useState<FoodAttribute[]>([]);
  const [loadingFoodAttributes, setLoadingFoodAttributes] = useState<boolean>(
    false
  );
  const [foodCategories, setfoodCategories] = useState<FoodCategory[]>([]);
  const [loadingFoodCategories, setLoadingFoodCategories] = useState(false);

  const [sort, setSort] = useState('popularity');
  const [searchType, setSearchType] = useState<string>(type as string);
  const [searchAttributes, setSearchAttributes] = useState<string[]>(
    attributes as string[]
  );

  const [searchAllergene, setSearchAllergene] = useState<string[]>([]);

  const [filter, setFilter] = useState<any>([]);

  const [openSortPanel, setOpenSortPanel] = useState<boolean>(true);
  const [openTypePanel, setOpenTypePanel] = useState<boolean>(true);
  const [openAttributePanel, setOpenAttributePanel] = useState<boolean>(true);
  const [openCategoriesPanel, setOpenCategoriesPanel] = useState(true);

  const classes = useStyles();

  const theme = useTheme();

  const cancelToken = useRef<CancelTokenSource>();

  useEffect(() => {
    setLoading(true);
    setFoods([]);
    setRestaurants([]);

    if (cancelToken.current !== undefined) {
      cancelToken.current.cancel();
    }

    cancelToken.current = Axios.CancelToken.source();

    search(Object.assign({},
      {
        lang,
        query: (q as string) || '',
        type: searchType,
        cancelToken: cancelToken.current.token,
      },
      filter && {
        filter: JSON.stringify(
          Object.assign({}, {}, filter.length > 0 && { category: filter }, searchAttributes[0] && { attributes: searchAttributes })
        )
      }
    )).then((datas) => {

      const foodsFilter = (datas.filter(({ type }) => type === 'food') as {
        type: 'food';
        content: Food;
      }[]).map(({ content }) => content).sort((a, b) => a.priority - b.priority)

      const foodsnotAlergene: any[] = [];

      foodsFilter.forEach((food: any) => {

        if (food.allergene.length > 0 && searchAttributes.length > 0) {

          food.allergene.forEach((item: any) => {

            if (searchAttributes.includes(item._id)) {
              console.log("allergene ")
            }

          })

        } else {
          foodsnotAlergene.push(food)
        }

      });

      setFoods(foodsnotAlergene)

      setRestaurants(
        (datas.filter(({ type }) => type === 'restaurant') as {
          type: 'restaurant';
          content: Restaurant;
        }[]).map(({ content }) => content).filter(x => {
          if (!x.referencement) return false
          if (!x.status) return false
          return true
        }).sort((a, b) => a.priority - b.priority)
      );
      setLoading(false);
    });
  }, [lang, q, searchType, filter, searchAttributes]);

  useEffect(() => {
    setLoadingFoodAttributes(true);

    getFoodAttributes().then((attributes) => {
      setFoodAttributes(attributes);
      setLoadingFoodAttributes(false);
    });

    setLoadingFoodCategories(true);

    getFoodCategories().then((data) => {
      setfoodCategories(data);
      setLoadingFoodCategories(false);
    });
  }, []);

  const updateFilter = useCallback(
    (id) => {
      const newFilter = [...filter, id]
      setFilter(newFilter);
    },
    [filter]
  )

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" className={classes.root}>
        <Grid container spacing={2}>
          <Grid
            item
            container
            lg={3}
            md={4}
            sm={12}
            style={{ position: 'relative' }}
            className={clsx(classes.searchOptions)}
          >
            <div style={{ width: '100%' }}>
              <Grid
                container
                justify="space-between"
                alignItems="center"
                className={classes.searchOptionHead}
              >
                <Typography variant="h6" component="p" className="translate">
                  Trier par
                </Typography>
                <div>
                  <IconButton
                    onClick={() => setOpenSortPanel(!openSortPanel)}
                  >
                    {openSortPanel ? <ArrowDropUp /> : <ArrowDropDown />}
                  </IconButton>
                </div>
              </Grid>
              {openSortPanel && (
                <>
                  <RadioGroup
                    name="sort"
                    value={sort}
                    onChange={(_, value) => setSort(value)}
                  >
                    <FormControlLabel
                      control={<Radio value="popularity" />}
                      label="Popularité"
                      className={classes.formControl}
                    />
                    <FormControlLabel
                      control={<Radio value="notes" />}
                      label="Note"
                      className={classes.formControl}
                    />
                  </RadioGroup>
                </>
              )}
              <Grid
                container
                justify="space-between"
                alignItems="center"
                className={classes.searchOptionHead}
              >
                <Typography variant="h6" component="p" className="translate">
                  Type de recherche
                </Typography>
                <div>
                  <IconButton
                    onClick={() => setOpenTypePanel(!openTypePanel)}
                  >
                    {openTypePanel ? <ArrowDropUp /> : <ArrowDropDown />}
                  </IconButton>
                </div>
              </Grid>
              {openTypePanel && (
                <>
                  <RadioGroup
                    name="type"
                    value={searchType}
                    onChange={(_, value) => {
                      if (value !== 'food') setSearchAttributes([]);

                      setSearchType(value);
                    }}
                  >
                    <FormControlLabel
                      control={<Radio value="all" />}
                      label={"Tous"}
                      className={clsx(classes.formControl, 'translate')}
                    />
                    <FormControlLabel
                      control={<Radio value="food" />}
                      label={"Plat"}
                      className={clsx(classes.formControl, 'translate')}
                    />
                    <FormControlLabel
                      control={<Radio value="restaurant" />}
                      label={"Restaurants"}
                      className={clsx(classes.formControl, 'translate')}
                    />
                  </RadioGroup>
                </>
              )}
              {searchType === 'food' && (
                <>
                  <Grid
                    container
                    justify="space-between"
                    alignItems="center"
                    className={classes.searchOptionHead}
                  >
                    <Typography variant="h6" component="p" className="translate">
                      Attributs
                    </Typography>
                    <div>
                      <IconButton
                        onClick={() =>
                          setOpenAttributePanel(!openAttributePanel)
                        }
                      >
                        {openAttributePanel ? (
                          <ArrowDropUp />
                        ) : (
                          <ArrowDropDown />
                        )}
                      </IconButton>
                    </div>
                  </Grid>
                  {openAttributePanel &&
                    (loadingFoodAttributes ? (
                      <Grid
                        container
                        justify="center"
                        alignItems="center"
                        style={{ height: 100, margin: theme.spacing(0, 2) }}
                      >
                        <CircularProgress />
                      </Grid>
                    ) : (
                      <Grid
                        container
                        spacing={1}
                        style={{ padding: theme.spacing(0, 2) }}
                      >
                        {foodAttributes.map(({ imageURL, tag, locales, _id }) => (
                          <Grid item>
                            <Chip
                              avatar={<Avatar src={imageURL} alt={tag} />}
                              label={locales.fr || tag}
                              color={
                                searchAttributes.indexOf(_id) >= 0
                                  ? 'primary'
                                  : undefined
                              }
                              onClick={() => {
                                if (searchAttributes.indexOf(_id) < 0) {
                                  setSearchAttributes([
                                    ...searchAttributes,
                                    _id,
                                  ]);
                                }
                              }}
                              onDelete={
                                searchAttributes.indexOf(_id) >= 0
                                  ? function () {
                                    setSearchAttributes(
                                      searchAttributes.filter(
                                        (e) => e !== _id
                                      )
                                    );
                                  }
                                  : undefined
                              }
                            />
                          </Grid>
                        ))}
                      </Grid>
                    ))}
                </>
              )}
              {searchType === 'restaurant' && (
                <>
                  <Grid
                    container
                    justify="space-between"
                    alignItems="center"
                    className={classes.searchOptionHead}
                  >
                    <Typography variant="h6" component="p" className="translate">
                      Catégories
                    </Typography>
                    <div>
                      <IconButton
                        onClick={() =>
                          setOpenCategoriesPanel(!openCategoriesPanel)
                        }
                      >
                        {openCategoriesPanel ? (
                          <ArrowDropUp />
                        ) : (
                          <ArrowDropDown />
                        )}
                      </IconButton>
                    </div>
                  </Grid>
                  {openCategoriesPanel &&
                    (loadingFoodCategories ? (
                      <Grid
                        container
                        justify="center"
                        alignItems="center"
                        style={{ height: 100, margin: theme.spacing(0, 2) }}
                      >
                        <CircularProgress />
                      </Grid>
                    ) : (
                      <Grid
                        container
                        spacing={1}
                        style={{ padding: theme.spacing(0, 2) }}
                      >
                        {foodCategories.map(({ imageURL, name, _id }) => (
                          <Grid item>
                            {_id === JSON.parse(decodeURI(window.location.href).split('&')[1].split('=')[1]).category}
                            <Chip
                              avatar={<Avatar src={imageURL} alt={name.fr} />}
                              label={name.fr}
                              color={
                                (filter?.indexOf(_id) >= 0) ||
                                  (_id === JSON.parse(decodeURI(window.location.href).split('&')[1].split('=')[1]).category)
                                  ? 'primary'
                                  : undefined
                              }
                              onClick={() => updateFilter(_id)}
                              onDelete={
                                filter?.indexOf(_id) >= 0
                                  ? function () {
                                    setFilter(
                                      filter?.filter(
                                        (e: any) => e !== _id
                                      )
                                    );
                                  }
                                  : undefined
                              }
                            />
                          </Grid>
                        ))}
                      </Grid>
                    ))}
                </>
              )}
            </div>
          </Grid>
          <Grid item xs>
            {loading ? (
              <Grid
                container
                justify="center"
                alignItems="center"
                style={{ height: 400 }}
              >
                <CircularProgress />
              </Grid>
            ) : (
              <Grid container direction="column">
                {(searchType === 'all' || searchType === 'restaurant') && (
                  <>
                    <Grid item>
                      <Typography variant="h5" component="p" className="translate">
                        Restaurant(s) trouvés
                      </Typography>
                    </Grid>
                    {restaurants.length ? (
                      <Grid
                        item
                        container
                        spacing={5}
                        style={{ padding: '24px' }}
                      >
                        {restaurants.map((restaurant) => (
                          <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                            <RestaurantCard item={restaurant} />
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Grid
                        container
                        alignItems="center"
                        justify="center"
                        style={{ height: 400 }}
                      >
                        <Typography variant="h5" color="textSecondary" className="translate">
                          Aucun résultat
                        </Typography>
                      </Grid>
                    )}
                  </>
                )}
                {(searchType === 'all' || searchType === 'food') && (
                  <>
                    <Grid>
                      <Typography variant="h5" component="p" className="translate">
                        Nourriture(s) trouvée(s)
                      </Typography>
                    </Grid>
                    {foods.length ? (
                      <Grid
                        item
                        container
                        spacing={5}
                        style={{ padding: '24px' }}
                      >
                        {foods.filter((food) => food.restaurant?.referencement && food.restaurant?.status).map((food) => (
                          <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                            <FoodCard popular item={food} />
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Grid
                        container
                        alignItems="center"
                        justify="center"
                        style={{ height: 400 }}
                      >
                        <Typography variant="h5" color="textSecondary" className="translate">
                          Aucun résultat
                        </Typography>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

const mapStateToProps: MapStateToProps<
  SearchStateProps,
  SearchOwnProps,
  RootState
> = ({ setting: { lang } }) => ({
  lang,
});

const ConnectedSearch = connect<
  SearchStateProps,
  SearchDispatchProps,
  SearchOwnProps,
  RootState
>(mapStateToProps)(Search);

export default ConnectedSearch;
