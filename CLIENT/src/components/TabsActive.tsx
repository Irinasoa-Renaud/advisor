import React, { createRef, useCallback, useEffect, useState } from 'react';
import SwipeableViews, { OnChangeIndexCallback } from 'react-swipeable-views';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import FoodCard from './foods/FoodCard';
import {
  Avatar,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  Theme,
  Typography,
  useMediaQuery,
} from '@material-ui/core';

import Food from '../models/Food.model';
import Menu from '../models/Menu.model';
import MenuCard from './menus/MenuCard';
import NoResult from './NoResult';
import { useTypographyStyles } from '../hooks/styles';
import clsx from 'clsx';
import FoodAttribute from '../models/FoodAttribute.model';
import getFoodAttributes from '../services/foodattributes';
import Loader from './Loader';
import { SlideTransition } from './transition';
import { useSelector } from '../utils/redux';
import Restaurant from '../models/Restaurant.model';

interface TabPanelProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
  > {
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, className, ...other } = props;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      <Box className={className} style={{ overflow: 'hidden' }}>
        {children}
      </Box>
    </div>
  );
};

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      padding: 0,
    },
  },
  panelContainer: {
    padding: theme.spacing(2),
  },
  type: {
    paddingBottom: 0,
    '&>p': {
      fontSize: theme.typography.pxToRem(18),
      fontWeight: 500,
      padding: theme.spacing(1, 0),
    },
  },
  filterButton: {
    position: 'absolute',
    right: 0,
    bottom: -6,
  },
  divider: {
    margin: theme.spacing(1, 0),
  },
  floatingOnScroll: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  stickyAppBar: {
    // height: '32px',
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  }
}));

interface FullWidthTabsProps {
  foods: Array<Food>;
  menus: Array<Menu>;
  id: string;
  resto?: Restaurant;
  onSearchAttributesChange?: (attributes: string[]) => void;
}

const FullWidthTabs: React.FC<FullWidthTabsProps> = ({
  foods,
  menus,
  resto,
  onSearchAttributesChange,
}) => {
  const { priceType }: any = useSelector(({ setting: { price } }: any) => ({
    priceType: price
  }))

  const classes = useStyles();
  const typographyClasses = useTypographyStyles();

  const theme = useTheme();

  const [tabIndex, setTabIndex] = useState(0);

  const [openFilter, setOpenFilter] = useState(false);

  const [loadingFoodAttributes, setLoadingFoodAttributes] = useState(false);
  const [foodAttributes, setFoodAttributes] = useState<FoodAttribute[]>([]);

  const [searchAttributes, setSearchAttributes] = useState<string[]>([]);
  const [showStickyFoodType, setShowStickyFoodType] = useState<boolean>(false);

  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const foodTypes = new Set(
    foods
      .sort((a: any, b: any) => a.type.priority - b.type.priority)
      .map(({ type: { name: type } }) =>
        (type as string).toLowerCase() === 'boisson'
          ? undefined
          : (type as string)
      )
  );

  const foodTypeRef = createRef<HTMLDivElement>();

  const onWindowScroll = useCallback(
    () => {
      const elementOffsetTopPos = foodTypeRef.current?.offsetTop || 0;
      if ((window.scrollY - 10) >= elementOffsetTopPos) {
        setShowStickyFoodType(true);
      } else {
        setShowStickyFoodType(false);
      }
    },
    [foodTypeRef]
  )

  useEffect(() => {
    window.addEventListener('scroll', onWindowScroll);
    onWindowScroll();

    return () => window.removeEventListener('scroll', onWindowScroll)
  },
    [onWindowScroll])

  const renderFloatingFoodType = useCallback(
    () => {
      if (tabIndex === 0 && showStickyFoodType) {
        return (
          <AppBar position='sticky' color="default" className={classes.stickyAppBar}>
            <Typography
              component="h2"
              variant="h5"
              align="left"
              className={clsx(typographyClasses.categoryTitle, 'translate')}
              style={{ marginBottom: 0 }}
            >
              Nos plats: <span style={{ fontSize: '16px' }}>{[...foodTypes].filter((type) => type !== undefined).join(', ')}</span>
            </Typography>
          </AppBar>
        )
      }
    },
    [tabIndex, foodTypes, typographyClasses.categoryTitle, classes.stickyAppBar, showStickyFoodType]
  )

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    if (newValue < 3) setTabIndex(newValue);
    else if (newValue === 3) setOpenFilter(true);
  };

  const handleChangeIndex: OnChangeIndexCallback = (index) => {
    setTabIndex(index);
  };

  const drinks = foods.filter(
    ({ type: { tag } }) => (tag as string) === 'drink'
  );

  const notDrinks = foods.filter(
    ({ type: { tag } }) => (tag as string) !== 'drink'
  );

  useEffect(() => {

    setLoadingFoodAttributes(true);

    getFoodAttributes().then((datas) => {
      setFoodAttributes(datas);
      setLoadingFoodAttributes(false);
    });

    return () => setLoadingFoodAttributes(false);
  }, []);

  return (
    <>
      {renderFloatingFoodType()}
      <Container ref={foodTypeRef} maxWidth="xl" className={classes.root}>
        <AppBar position="static" color="default">
          <Tabs
            value={tabIndex}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            centered
            aria-label="full width tabs example"
          >
            <Tab
              label={<span className="translate">À la carte</span>}
              {...a11yProps(0)}
            />
            {resto?.isMenuActive && <Tab
              label={<span className="translate">Menus</span>}
              {...a11yProps(1)}
            />}
            {resto?.isBoissonActive && <Tab
              label={<span className="translate">Boissons</span>}
              {...a11yProps(2)}
            />}
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={tabIndex}
          onChangeIndex={handleChangeIndex}
          disableLazyLoading
          animateHeight
        >
          <TabPanel value={tabIndex} index={0} dir={theme.direction}>
            <Grid
              container
              spacing={smDown ? 2 : 5}
              className={classes.panelContainer}
            >
              {!showStickyFoodType && <Grid item xs={12} style={{ paddingBottom: 0 }}>
                <Typography
                  component="h2"
                  variant="h5"
                  align="left"
                  className={clsx(typographyClasses.categoryTitle, 'translate')}
                  style={{ marginBottom: 0 }}
                >
                  Nos plats: <span style={{ fontSize: '16px' }}>{[...foodTypes].filter((type) => type !== undefined).join(', ')}</span>
                </Typography>
              </Grid>}

              {notDrinks.length ? (
                [...foodTypes]
                  .map(
                    (type) =>
                      type && (
                        <React.Fragment key={type}>
                          <Grid item xs={12} className={classes.type}>
                            <Divider />
                            <Typography className="translate">{type}</Typography>
                            <Divider />
                          </Grid>
                          {notDrinks
                            .filter((item: any) => item.statut)
                            .filter(({ type: { name: t } }) => t === type)
                            .length > 0 ?

                            notDrinks
                              .filter((item: any) => item.statut)
                              .sort((a: any, b: any) => a.priority - b.priority)
                              .filter(({ type: { name: t } }) => t === type)
                              .map((food) => (
                                <Grid
                                  key={food._id}
                                  item
                                  xs={12}
                                  sm={6}
                                  md={4}
                                  lg={4}
                                  xl={4}
                                >
                                  <FoodCard showGlobalPrice={priceType !== 'priceless'} item={food} />
                                </Grid>
                              )) : (
                              <p
                                style={{
                                  width: '100%',
                                  textAlign: 'center'
                                }}
                              >
                                Aucun {type} est disponible
                              </p>
                            )
                          }
                        </React.Fragment>
                      )
                  )
              ) : (
                <Grid item xs={12}>
                  <NoResult
                    height={120}
                    justify="center"
                    text="Aucun plat trouvé"
                  />
                </Grid>
              )}
            </Grid>
          </TabPanel>
          {resto?.isMenuActive && (
            <TabPanel value={tabIndex} index={1} dir={theme.direction}>
              <Grid
                container
                spacing={smDown ? 2 : 5}
                className={classes.panelContainer}
              >
                <Grid item xs={12} style={{ paddingBottom: 0 }}>
                  <Typography
                    component="h2"
                    variant="h5"
                    align="left"
                    className={clsx(typographyClasses.categoryTitle, 'translate')}
                    style={{ marginBottom: 0 }}
                  >
                    Nos menus
                  </Typography>
                </Grid>

                {menus.length ? (
                  menus
                    .filter((menus: any) => menus.foods.filter((foods: any) => foods.food.statut).length > 0)
                    .sort((a: any, b: any) => a.priority - b.priority)
                    .map((menu) => (
                      <Grid
                        key={menu._id}
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        lg={12}
                        xl={12}
                      >
                        <MenuCard showGlobalPrice={priceType !== 'priceless'} item={menu} />
                      </Grid>
                    ))
                ) : (
                  <Grid item xs={12}>
                    <NoResult
                      height={120}
                      justify="center"
                      text="Aucun menu trouvé"
                    />
                  </Grid>
                )}
              </Grid>
            </TabPanel>
          )}
          {resto?.isBoissonActive && (
            <TabPanel value={tabIndex} index={2} dir={theme.direction}>
              <Grid
                container
                spacing={smDown ? 2 : 5}
                className={classes.panelContainer}
              >
                <Grid item xs={12} style={{ paddingBottom: 0 }}>
                  <Typography
                    component="h2"
                    variant="h5"
                    align="left"
                    className={clsx(typographyClasses.categoryTitle, 'translate')}
                    style={{ marginBottom: 0 }}
                  >
                    Nos boissons
                  </Typography>
                </Grid>
                {drinks.length ? (
                  drinks.sort((a, b) => a.priority - b.priority).map((food) => (
                    <Grid key={food._id} item xs={12} sm={6} md={4} lg={4} xl={4}>
                      <FoodCard showGlobalPrice={priceType !== 'priceless'} item={food} />
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <NoResult
                      height={120}
                      justify="center"
                      text="Aucune boisson trouvée"
                    />
                  </Grid>
                )}
              </Grid>
            </TabPanel>
          )}
        </SwipeableViews>
      </Container>

      <Dialog
        maxWidth="sm"
        fullWidth
        fullScreen={smDown}
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        TransitionComponent={SlideTransition}
      >
        <DialogTitle className="translate">Filtres</DialogTitle>
        <Divider className={classes.divider} />
        <DialogContent>
          {loadingFoodAttributes ? (
            <Loader />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
              }}
            >
              <Typography className="translate" gutterBottom>
                Retirer les allergènes
              </Typography>
              {foodAttributes
                .sort((a: any, b: any) => a.priority - b.priority)
                .filter(({ tag }) => tag.startsWith('allergen'))
                .map(({ _id, imageURL, locales: { fr: name } }) => (
                  <FormControlLabel
                    key={_id}
                    control={
                      <Checkbox
                        checked={searchAttributes.includes(_id)}
                        onChange={(_, checked) => {
                          if (checked) setSearchAttributes((v) => [...v, _id]);
                          else
                            setSearchAttributes((v) =>
                              v.filter((e) => e !== _id)
                            );
                        }}
                        name={name}
                      />
                    }
                    label={
                      <Grid container spacing={1} alignItems="center">
                        <Grid item>
                          <Avatar src={imageURL} alt={name} />
                        </Grid>
                        <Grid item>
                          <Typography className="translate">{name}</Typography>
                        </Grid>
                      </Grid>
                    }
                  />
                ))}
              <Typography
                className="translate"
                style={{ marginTop: theme.spacing(2) }}
                gutterBottom
              >
                Afficher
              </Typography>
              {foodAttributes
                .sort((a: any, b: any) => a.priority - b.priority)
                .filter(({ tag }) => !tag.startsWith('allergen'))
                .map(({ _id, imageURL, locales: { fr: name } }) => (
                  <FormControlLabel
                    key={_id}
                    control={
                      <Checkbox
                        checked={searchAttributes.includes(_id)}
                        onChange={(_, checked) => {
                          if (checked) setSearchAttributes((v) => [...v, _id]);
                          else
                            setSearchAttributes((v) =>
                              v.filter((e) => e !== _id)
                            );
                        }}
                        name={name}
                      />
                    }
                    label={
                      <Grid container spacing={1} alignItems="center">
                        <Grid item>
                          <Avatar src={imageURL} alt={name} />
                        </Grid>
                        <Grid item>
                          <Typography className="translate">{name}</Typography>
                        </Grid>
                      </Grid>
                    }
                  />
                ))}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilter(false)}>Annuler</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              setOpenFilter(false);
              onSearchAttributesChange?.(searchAttributes);
            }}
          >
            Valider
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FullWidthTabs;
