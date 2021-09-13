import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Fab,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  RadioGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import Food from '../../models/Food.model';
import { FoodInCart, Option, OptionItem } from '../../redux/types/cart';
import { makeStyles } from '@material-ui/core/styles';
import Accompaniment from '../../models/Accompaniment.model';
import { useSnackbar } from 'notistack';
import {
  AccessTime,
  Add as AddIcon,
  Check,
  Close,
  Close as CloseIcon,
  ExpandMore,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Image,
  KeyboardArrowRight,
  Remove as RemoveIcon,
  Visibility,
  Fastfood as FastfoodIcon
} from '@material-ui/icons';
import clsx from 'clsx';
import RootState, { RootActionTypes } from '../../redux/types';
import { connect, MapStateToProps } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { addFavoriteFood, removeFavoriteFood } from '../../redux/actions/auth';
import DeleteButton from '../DeleteButton';
import { estimateFoodPrice } from '../../services/cart';
import logger from 'use-reducer-logger';
import { v4 as uuidv4 } from 'uuid';
import { SlideTransition } from '../transition';
import FoodAttribute from '../../models/FoodAttribute.model';
import RectangularRadio from '../RectangularRadio';
import { Link } from 'react-router-dom';
import Restaurant from '../../models/Restaurant.model';
import { hasNoValidOption } from '../../utils/food';
import MiniFab from '../MiniFab';
import ClearCartModal from '../ClearCart';

const maxOptionExceeded: (option: Option) => boolean = (option) => {
  const { maxOptions } = option;
  const total = option.items.reduce<number>(
    (p, { quantity }) => p + quantity,
    0
  );

  return total >= maxOptions;
};

type FoodState = FoodInCart;

type FoodAction =
  | { type: 'reset' }
  | { type: 'increment_quantity' }
  | { type: 'decrement_quantity' }
  | {
    type: 'increment_option_item';
    payload: { option: string; item: Accompaniment };
  }
  | {
    type: 'decrement_option_item';
    payload: { option: string; item: Accompaniment };
  }
  | {
    type: 'clear_option';
    payload: string;
  };

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    position: 'relative',
    padding: '0 !important',
  },
  imageDialog: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageDialogPlaceholder: {
    height: 300,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: theme.typography.pxToRem(80),
  },
  number: {
    fontSize: theme.typography.pxToRem(16),
    width: 36,
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.typography.pxToRem(14),
      width: 26,
    },
  },
  favoriteButton: {
    color: 'white',
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(2),
  },
  price: {
    fontSize: 16,
    marginTop: 'auto',
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  attributes: {
    marginTop: -theme.spacing(2),
    padding: theme.spacing(0, 2, 2, 2),
  },
  close: {
    position: 'absolute',
    left: theme.spacing(2),
    top: theme.spacing(2),
    zIndex: theme.zIndex.modal + 1,
  },
  name: {
    margin: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  description: {
    margin: theme.spacing(0, 2),
  },
  accompaniment: {
    backgroundColor: 'rgb(246, 246, 246)',
    margin: theme.spacing(1, 0),
  },
  accompanimentTitle: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(0, 3),
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2)
  },
  accompanimentOption: {
    padding: theme.spacing(2, 3),
    '&.MuiFormControlLabel-root': {
      padding: theme.spacing(2, 0),
      marginRight: 0,
      flexDirection: 'row-reverse',
    },
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  label: {
    width: '100%',
  },
  itemImage: {
    marginRight: theme.spacing(1),
  },
  accordionDetails: {
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  restaurantLink: {
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  dialogActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  overlayContainer: {
    position: 'relative',
    width: '100%',
    height: 300
  },
  overlayContent: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}));

interface FoodDetailsDialogStateProps {
  authenticated: boolean;
  isFavorite: boolean;
  showPrice: boolean;
  isNew: (id: string) => boolean;
}

interface FoodDetailsDialogDispatchProps {
  addToFavorites: (id: string) => Promise<void>;
  removeFromFavorites: (id: string) => Promise<void>;
}

interface FoodDetailsDialogOwnProps {
  value?: FoodInCart;
  item: Food;
  open: boolean;
  popular?: boolean;
  onClose: (
    result: FoodInCart | null,
    reason?: 'add' | 'update' | 'remove' | 'cancel'
  ) => void;
  restaurant?: Restaurant;
  clearCart?: Function;
  showGlobalPrice?: boolean;
  isAvailable?: boolean;
}

type FoodDetailsDialogProps = FoodDetailsDialogStateProps &
  FoodDetailsDialogDispatchProps &
  FoodDetailsDialogOwnProps;

const FoodDetailsDialog: React.FC<FoodDetailsDialogProps> = ({
  onClose,
  open,
  addToFavorites,
  isFavorite,
  authenticated,
  removeFromFavorites,
  item,
  showPrice,
  isNew,
  value,
  popular,
  restaurant,
  clearCart,
  showGlobalPrice,
  isAvailable
}) => {
  const classes = useStyles();

  const DEFAULT_STATE = useMemo<FoodInCart>(
    () =>
      value || {
        id: uuidv4(),
        item,
        options: item.options.map(({ maxOptions, title }) => ({
          maxOptions,
          title,
          items: [],
        })),
        quantity: 0,
        comment: '',
      },
    [item, value]
  );

  const reducer: (
    state: FoodState,
    action: FoodAction
  ) => FoodState = useCallback(
    (state = DEFAULT_STATE, action) => {
      let option: Option | null;
      let item: OptionItem | null;
      let { options, quantity } = state;

      switch (action.type) {
        case 'increment_quantity':
          return {
            ...state,
            quantity: quantity + 1,
          };

        case 'decrement_quantity':
          return {
            ...state,
            quantity: quantity - 1,
          };

        case 'increment_option_item':
          option = options.filter((o) => o.title === action.payload.option)[0];

          item = option.items.filter(
            (i) => i.item._id === action.payload.item._id
          )[0];

          if (!item) {
            item = { item: action.payload.item, quantity: 1 };
            option.items.push(item);
          } else {
            item.quantity++;
          }

          return {
            ...state,
          };

        case 'decrement_option_item':
          option = options.filter((o) => o.title === action.payload.option)[0];

          item =
            option &&
            option.items.filter(
              (i) => i.item._id === action.payload.item._id
            )[0];

          if (item && item.quantity) item.quantity--;

          if (item && !item.quantity)
            option.items = option.items.filter((i) => i !== item);

          if (option && !option.items.length)
            options = options.filter((o) => o !== option);

          return {
            ...state,
          };

        case 'clear_option':
          option = options.filter((o) => o.title === action.payload)[0];

          if (option) option.items = [];

          return {
            ...state,
            options: [...options],
          };

        case 'reset':
          return {
            ...DEFAULT_STATE,
            id: uuidv4(),
            options: options.map(({ title, maxOptions }) => ({
              title,
              maxOptions,
              items: [],
            })),
          };

        default:
          return state;
      }
    },
    [DEFAULT_STATE]
  );

  const [food, dispatch] = useReducer<React.Reducer<FoodState, FoodAction>>(
    process.env.NODE_ENV === 'development' ? logger(reducer) : reducer,
    DEFAULT_STATE
  );

  const { quantity, options } = food;

  const [openedSection, setOpenedSection] = useState<string>(item.options[0]?.title);

  const [enabled, setEnabled] = useState<boolean>(() => hasNoValidOption(item));

  const [expandOpeningTimes, setExpandOpeningTimes] = useState<boolean>(false);

  const [clearCartAndAddFood, setClearCartAndAddFood] = useState(false);
  const [clearCartOption, setClearCartOption] = useState<number>(0)
  const [openCartError, setOpenCartError] = useState(false);

  const tempFunc = () => {
    setClearCartOption(0)
  }

  const handleOptionChange = () => {
    if (!enabled) setEnabled(true);
  };

  const addFood = useCallback(
    () => {
      if (!showGlobalPrice) {
        onClose({
          ...food,
          item: {
            ...item,
            price: {
              ...food.item.price,
              amount: 0
            }
          },
          options: options.map(({ items, maxOptions, title }) => ({
            items: items.map(({ item, quantity }) => ({
              item: {
                ...item,
                price: {
                  ...item.price,
                  amount: 0
                }
              },
              quantity,
            })),
            maxOptions,
            title
          }))
        }, isNew(food.id) ? 'add' : 'update');
        dispatch({ type: 'reset' });
      } else {
        onClose(food, isNew(food.id) ? 'add' : 'update');
        dispatch({ type: 'reset' });
      }
    },
    [food, isNew, item, onClose, options, showGlobalPrice]
  )

  const save = useCallback(() => {
    if (restaurant && restaurant._id !== item.restaurant?._id) {
      setOpenCartError(true)
      return;
    }
    addFood()
    setOpenedSection('');
  }, [restaurant, item.restaurant, addFood]);

  useEffect(
    () => {
      if (clearCartAndAddFood) {
        addFood()
        setClearCartAndAddFood(false);
      }
    },
    [food, onClose, item, options, clearCartAndAddFood, isNew, addFood]
  )

  const decrementQuantity = useCallback(() => {
    if (quantity > 0) dispatch({ type: 'decrement_quantity' });
  }, [dispatch, quantity]);

  const incrementQuantity = useCallback(() => {
    dispatch({ type: 'increment_quantity' });
  }, [dispatch]);

  const [optionSelected, setOptionSelected] = useState<any[]>([]);
  const addOption = useCallback(
    (option) => {
      if (quantity === 0) {
        incrementQuantity()
      }
      setOptionSelected([...optionSelected, option])
    },
    [optionSelected, quantity, incrementQuantity]
  )

  const removeOption = useCallback(
    (option) => {
      const index = optionSelected.findIndex(x => x.title === option.title)
      const newOption = optionSelected
      newOption.splice(index, 1)
      setOptionSelected(newOption)
    },
    [optionSelected]
  )

  const { enqueueSnackbar } = useSnackbar();

  const favoriteClick = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();

    if (!authenticated) {
      return enqueueSnackbar(
        'Vous devez vous connecter pour pouvoir effectuer cette action',
        { variant: 'info' }
      );
    }

    if (isFavorite) {
      try {
        await removeFromFavorites(item._id);
        enqueueSnackbar('Supprimé des favoris', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
      }
    } else {
      try {
        await addToFavorites(item._id);
        enqueueSnackbar('Ajouté aux favoris', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar("Erreur lors de l'ajout", { variant: 'error' });
      }
    }
  };

  const theme = useTheme();

  const smDown = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSectionChange = (option: string) => (
    _event: React.ChangeEvent<{}>,
    isExpanded: boolean
  ) => {
    setOpenedSection(isExpanded ? option : '');
  };

  const checkIfIsSelectedAllOptions = useCallback(
    () => {
      const emptyOptions = options.filter((option) => option.items.length === 0)
      if (emptyOptions.length > 0) {
        return false
      } else {
        return true
      }
    },
    [options]
  )

  return (
    <Dialog
      open={open}
      TransitionComponent={SlideTransition}
      keepMounted
      onClose={() => onClose(null, 'cancel')}
      fullWidth
      fullScreen={smDown}
      maxWidth="sm"
      disableBackdropClick
    >
      <Fab className={classes.close} size="small" onClick={() => onClose(null)}>
        <CloseIcon />
      </Fab>
      <DialogContent className={classes.dialogContent}>
        <Fab
          color="primary"
          className={classes.favoriteButton}
          onClick={favoriteClick}
          size="medium"
          aria-label="favori"
          title={!isFavorite ? 'Ajouter aux favoris' : 'Retirer des favoris'}
        >
          {!isFavorite ? <FavoriteBorderIcon /> : <FavoriteIcon />}
        </Fab>
        {Boolean(item.imageURL) ? (
          <div className={classes.overlayContainer}>
            <img
              src={item.imageURL}
              alt={item.name}
              className={classes.imageDialog}
            />
            {item.imageNotContractual && (
              <div className={classes.overlayContent}>
                <p style={{ color: 'white' }} className="translate">Non contractuel</p>
              </div>
            )}
          </div>
        ) : (
          <div className={classes.overlayContainer}>
            <div className={classes.imageDialogPlaceholder}>
              <Image fontSize="large" />
            </div>
          </div>
        )}
        <Container>
          <Typography
            className={classes.name}
            variant="h4"
            component="h1"
            align={popular ? 'center' : undefined}
          >
            {item.name || item.name.fr}
          </Typography>

          {popular && item.restaurant && (
            <>
              <Divider style={{ marginTop: theme.spacing(2) }} />

              <Button
                fullWidth
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingTop: theme.spacing(2),
                  paddingBottom: theme.spacing(2),
                }}
                onClick={() => setExpandOpeningTimes((v) => !v)}
              >
                <AccessTime color="secondary" />
                <Typography
                  align="left"
                  color="primary"
                  className="translate"
                  style={{ marginLeft: theme.spacing(4), marginRight: 'auto' }}
                >
                  Horaire
                </Typography>
                <KeyboardArrowRight
                  color="secondary"
                  style={{
                    transform: expandOpeningTimes ? 'rotate(90deg)' : 'none',
                    transition: 'transform .3s ease-out',
                  }}
                />
              </Button>

              <Divider />

              <Collapse in={expandOpeningTimes}>
                <List>
                  {item.restaurant.openingTimes.map(({ day, openings }) => (
                    <React.Fragment key={day}>
                      <ListItem>
                        <Typography style={{ marginRight: 'auto' }}>
                          {day}
                        </Typography>
                        <div>
                          {openings.map(({ begin, end }, i) => (
                            <Typography key={i}>{`${begin.hour.toLocaleString(
                              'fr-FR',
                              {
                                minimumIntegerDigits: 2,
                              }
                            )} : ${begin.minute.toLocaleString('fr-FR', {
                              minimumIntegerDigits: 2,
                            })} - ${end.hour.toLocaleString('fr-FR', {
                              minimumIntegerDigits: 2,
                            })} : ${end.minute.toLocaleString('fr-FR', {
                              minimumIntegerDigits: 2,
                            })}`}</Typography>
                          ))}
                        </div>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </Collapse>

              <Box height={theme.spacing(2)} />
            </>
          )}

          {popular && item.restaurant && (
            <>
              <Typography className={classes.description} variant="body1">
                {item.description}
              </Typography>

              <Typography
                variant="h6"
                component="p"
                className={clsx('notranslate', classes.restaurantLink)}
              >
                <span className="translate">Retrouvez-le chez</span>{' '}
                <Link
                  to={`/restaurants/${item.restaurant._id}`}
                  onClick={() => onClose(null, 'cancel')}
                >
                  {item.restaurant.name}
                </Link>
              </Typography>
            </>
          )}

          {popular && item.restaurant && (
            <>
              <Divider style={{ marginTop: theme.spacing(2) }} />
              <Grid
                container
                justify="center"
                alignItems="center"
                style={{ padding: theme.spacing(2) }}
              >
                <Grid
                  item
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: theme.spacing(0, 2),
                  }}
                >
                  <Typography className="translate">Livraison</Typography>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '50%',
                      marginLeft: theme.spacing(1),
                      color: item.restaurant.delivery ? 'green' : 'red',
                      border: `1px solid ${item.restaurant.delivery ? 'green' : 'red'
                        }`,
                    }}
                  >
                    {item.restaurant.delivery ? (
                      <Check color="inherit" />
                    ) : (
                      <Close color="inherit" />
                    )}
                  </Box>
                </Grid>
                <Grid
                  item
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: theme.spacing(0, 2),
                  }}
                >
                  <Typography className="translate">Sur place</Typography>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '50%',
                      marginLeft: theme.spacing(1),
                      color: item.restaurant.surPlace ? 'green' : 'red',
                      border: `1px solid ${item.restaurant.surPlace ? 'green' : 'red'
                        }`,
                    }}
                  >
                    {item.restaurant.surPlace ? (
                      <Check color="inherit" />
                    ) : (
                      <Close color="inherit" />
                    )}
                  </Box>
                </Grid>
                <Grid
                  item
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: theme.spacing(0, 2),
                  }}
                >
                  <Typography className="translate">À emporter</Typography>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '50%',
                      marginLeft: theme.spacing(1),
                      color: item.restaurant.aEmporter ? 'green' : 'red',
                      border: `1px solid ${item.restaurant.aEmporter ? 'green' : 'red'
                        }`,
                    }}
                  >
                    {item.restaurant.aEmporter ? (
                      <Check color="inherit" />
                    ) : (
                      <Close color="inherit" />
                    )}
                  </Box>
                </Grid>
              </Grid>
              <Divider style={{ marginBottom: theme.spacing(2) }} />
            </>
          )}

          {popular && item.restaurant && (
            <>
              <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                {item.restaurant.address}
              </Typography>
              <Typography variant="h6">
                {item.restaurant.phoneNumber}
              </Typography>
            </>
          )}

          {!popular && (
            <Typography className={classes.description} variant="body1">
              {item.description}
            </Typography>
          )}

          {!popular && showPrice && item.price.amount && showGlobalPrice && (
            <Typography className={classes.price}>
              €
              {((item.price.amount || 0) / 100).toLocaleString(undefined, {
                minimumFractionDigits: 1,
              })}
            </Typography>
          )}

          {!showGlobalPrice && (
            <Typography className={classes.price}></Typography>
          )}

          {popular && <Box height={theme.spacing(2)} />}

          <Grid container spacing={2} className={classes.attributes}>
            {(item.attributes as FoodAttribute[]).map(
              ({ _id, imageURL, locales: { fr: name } }) => (
                <Grid item key={_id}>
                  <Chip
                    avatar={imageURL ? (<Avatar alt={name} src={imageURL} />) : (<FastfoodIcon />)}
                    label={<span className="translate">{name}</span>}
                  />
                </Grid>
              )
            )}

            {(item.allergene as FoodAttribute[]).map(
              ({ _id, imageURL, locales: { fr: name } }) => (
                <Grid item key={_id}>
                  <Chip
                    avatar={imageURL ? (<Avatar alt={name} src={imageURL} />) : (<FastfoodIcon />)}
                    label={<span className="translate">{name}</span>}
                  />
                </Grid>
              )
            )}
          </Grid>
        </Container>
        {!popular &&
          item.options.map(
            (option) =>
              !!option.items.length && (
                <Accordion
                  expanded={openedSection === option.title}
                  key={option.title}
                  elevation={0}
                  onChange={handleSectionChange(option.title)}
                >
                  <AccordionSummary
                    className={classes.accompaniment}
                    expandIcon={<ExpandMore />}
                  >
                    <div className={classes.accompanimentTitle}>
                      <Typography variant="h6">{option.title}</Typography>
                      <Typography variant="body2">{`Choissisez-en jusqu'à ${option.maxOptions}`}</Typography>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails className={classes.accordionDetails}>
                    {option.maxOptions === 1 || option.maxOptions === 0 ? (
                      <RadioGroup name={option.title} style={{ width: '100%', paddingLeft: '16px', paddingRight: '8px' }}>
                        {option.items.map((item) => (
                          <FormControlLabel
                            key={item._id}
                            className={classes.accompanimentOption}
                            value={item._id}
                            disabled={(quantity > 1 && optionSelected.length > 0)}
                            control={
                              <RectangularRadio
                                checked={
                                  options
                                    .filter((o) => o.title === option.title)[0]
                                    ?.items.filter(
                                      (i) => i.item._id === item._id
                                    )[0]?.quantity > 0
                                }
                                onChange={({ target: { checked } }) => {
                                  if (checked) {
                                    handleOptionChange();
                                    addOption(option);
                                    dispatch({
                                      type: 'clear_option',
                                      payload: option.title,
                                    });
                                    dispatch({
                                      type: 'increment_option_item',
                                      payload: { option: option.title, item },
                                    });
                                  }
                                }}
                              />
                            }
                            classes={{ label: classes.label }}
                            label={
                              <Grid container alignItems="center">
                                <Grid item>

                                  {item.imageURL ? (<Avatar
                                    alt={item.name}
                                    src={item.imageURL}
                                    className={classes.itemImage}
                                  />) : (<FastfoodIcon />)}

                                </Grid>
                                <Grid item xs>
                                  <Typography>{item.name}</Typography>
                                </Grid>

                              </Grid>
                            }
                          />
                        ))}
                      </RadioGroup>
                    ) : option.maxOptions > 1 ? (
                      <Grid container direction="column">
                        {option.items.map((item) => (
                          <Grid
                            key={item._id}
                            item
                            container
                            alignItems="center"
                            className={classes.accompanimentOption}
                            style={{ height: 74 }}
                          >
                            <Grid item>
                              {item.imageURL ? (<Avatar
                                alt={item.name}
                                src={item.imageURL}
                                className={classes.itemImage}
                              />) : (<FastfoodIcon />)}
                            </Grid>
                            <Grid item xs>
                              <Typography>{item.name}</Typography>
                            </Grid>
                            <Grid item xs>
                              <Typography>{item.price.amount !== 0 && `€ ${(item.price.amount / 100)}`}</Typography>
                            </Grid>
                            {options
                              .filter((o) => o.title === option.title)[0]
                              .items.filter((i) => i.item._id === item._id)[0]
                              ?.quantity && (
                                <>
                                  <Grid item>
                                    <MiniFab
                                      color="primary"
                                      onClick={() => {
                                        removeOption(option)
                                        dispatch({
                                          type: 'decrement_option_item',
                                          payload: { option: option.title, item },
                                        })
                                      }
                                      }
                                      disabled={
                                        !(
                                          options
                                            .filter(
                                              (o) => o.title === option.title
                                            )[0]
                                            .items.filter(
                                              (i) => i.item._id === item._id
                                            )[0]?.quantity || 0
                                        )
                                      }
                                    >
                                      <RemoveIcon />
                                    </MiniFab>
                                  </Grid>
                                  <Grid item className={clsx(classes.number)}>
                                    {options
                                      .filter((o) => o.title === option.title)[0]
                                      .items.filter(
                                        (i) => i.item._id === item._id
                                      )[0]?.quantity || 0}
                                  </Grid>
                                </>
                              )}
                            <Grid item>
                              <MiniFab
                                color="primary"
                                onClick={() => {
                                  handleOptionChange();
                                  addOption(option);
                                  dispatch({
                                    type: 'increment_option_item',
                                    payload: { option: option.title, item },
                                  });
                                }}
                                disabled={maxOptionExceeded(
                                  options.filter(
                                    (o) => o.title === option.title
                                  )[0]
                                ) || (quantity > 1 && optionSelected.length > 0)}
                              >
                                <AddIcon />
                              </MiniFab>
                            </Grid>
                          </Grid>
                        ))}
                      </Grid>
                    ) : null}
                  </AccordionDetails>
                </Accordion>
              )
          )}
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        {(!popular && isAvailable) ? (
          <>
            {(checkIfIsSelectedAllOptions() && (quantity !== 0 || item.options.length === 0)) && <div className={classes.controls}>
              <Fab
                size="medium"
                onClick={decrementQuantity}
                color="primary"
                disabled={quantity <= 1 || !enabled}
              >
                <RemoveIcon />
              </Fab>
              <span className={classes.number}>{quantity}</span>
              <Fab
                size="medium"
                onClick={incrementQuantity}
                disabled={!enabled}
                color="primary"
              >
                <AddIcon />
              </Fab>
            </div>}
            {(checkIfIsSelectedAllOptions() && (quantity !== 0 || item.options.length === 0)) && <Button
              fullWidth
              color="primary"
              size={'large'}
              variant="contained"
              disabled={!quantity || (item.options.length > 0 && optionSelected.length === 0) || !checkIfIsSelectedAllOptions()}
              onClick={save}
            >
              <span className="translate">
                {isNew(food.id) ? 'Ajouter au panier' : 'Modifier'}
              </span>
              {showGlobalPrice && <span style={{ marginLeft: 'auto' }}>
                {'€' + estimateFoodPrice(food) / 100}
              </span>}
            </Button>}
            {!isNew(food.id) && (
              <DeleteButton
                size="small"
                onClick={() => {
                  onClose(food, 'remove');
                }}
              />
            )}
          </>
        ) :
          popular ? (
            <Button
              fullWidth
              variant="contained"
              size="large"
              color="primary"
              startIcon={<Visibility />}
              className="translate"
              component={Link}
              onClick={() => onClose(null, 'cancel')}
              to={`/restaurants/${(item.restaurant as Restaurant)._id}`}
            >
              Voir le restaurant
            </Button>
          ) : <></>}
        {!isAvailable && (
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<Visibility />}
            className="translate"
            onClick={() => { }}
            disabled={true}
          >
            Plat non disponible
          </Button>
        )}
      </DialogActions>
      <ClearCartModal open={openCartError} setOpen={setOpenCartError} action={clearCart || tempFunc} setClearCartAndAddFood={setClearCartAndAddFood} setClearCartOption={setClearCartOption} />
    </Dialog>
  );
};

const mapStateToProps: MapStateToProps<
  FoodDetailsDialogStateProps,
  FoodDetailsDialogOwnProps,
  RootState
> = (
  { cart: { foods }, setting: { showPrice }, auth: { user, authenticated } },
  { item: { _id } }
) => ({
  showPrice,
  isFavorite: !!user && !!user.favoriteFoods.filter((id) => id === _id).length,
  authenticated,
  isNew: (id) => !foods.filter(({ id: itemId }) => itemId === id).length,
});

const mapDispatchToProps: (
  dispatch: ThunkDispatch<RootState, undefined, RootActionTypes>,
  props: FoodDetailsDialogOwnProps
) => FoodDetailsDialogDispatchProps = (dispatch) => ({
  removeFromFavorites: (id) => dispatch(removeFavoriteFood(id)),
  addToFavorites: (id) => dispatch(addFavoriteFood(id)),
});

const ConnectedFoodDetailsDialog = connect<
  FoodDetailsDialogStateProps,
  FoodDetailsDialogDispatchProps,
  FoodDetailsDialogOwnProps,
  RootState
>(
  mapStateToProps,
  mapDispatchToProps
)(FoodDetailsDialog);

export default ConnectedFoodDetailsDialog;
