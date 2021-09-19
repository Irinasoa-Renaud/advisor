import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  CardActionArea,
  Checkbox,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Fab,
  FormControlLabel,
  Grid,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Radio,
  RadioGroup,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MenuInCart, Option, OptionItem } from '../../redux/types/cart';
import Menu from '../../models/Menu.model';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Remove as RemoveIcon,

} from '@material-ui/icons';
import Food from '../../models/Food.model';
import { connect, MapStateToProps } from 'react-redux';
import RootState from '../../redux/types';
import DeleteButton from '../DeleteButton';
import { estimateMenuPrice } from '../../services/cart';
import Accompaniment from '../../models/Accompaniment.model';
import { v4 as uuidv4 } from 'uuid';
import logger from 'use-reducer-logger';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { SlideTransition } from '../transition';
import clsx from 'clsx';
import MiniFab from '../MiniFab';
import Restaurant from '../../models/Restaurant.model';
import ClearCartModal from '../ClearCart';

const maxOptionExceeded: (option: Option) => boolean = (option) => {
  const { maxOptions } = option;
  const total = option.items.reduce<number>(
    (p, { quantity }) => p + quantity,
    0
  );

  return total >= maxOptions;
};

export type MenuState = MenuInCart;

export type MenuAction =
  | { type: 'reset' }
  | { type: 'increment_quantity' }
  | { type: 'decrement_quantity' }
  | {
    type: 'add_food';
    payload: Food;
  }
  | {
    type: 'remove_food';
    payload: Food;
  }
  | {
    type: 'increment_option_item';
    payload: { food: Food; option: string; item: Accompaniment };
  }
  | {
    type: 'decrement_option_item';
    payload: { food: Food; option: string; item: Accompaniment };
  }
  | {
    type: 'clear_option';
    payload: { food: Food; title: string };
  };

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    position: 'relative',
    padding: '0 !important',
    paddingTop: `${theme.spacing(8)}px !important`,
  },
  imageDialog: {
    width: '100%',
    height: 300,
    objectFit: 'cover',
  },
  imageDialogPlaceholder: {
    display: 'flex',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: theme.typography.pxToRem(80),
  },
  number: {
    fontSize: theme.typography.pxToRem(16),
    width: 40,
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.typography.pxToRem(12),
      width: 26,
    },
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
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
    marginBottom: theme.spacing(1),
  },
  foodTypes: {
    margin: theme.spacing(0, 2),
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
  },
  accompaniment: {
    margin: theme.spacing(1, 0),
  },
  accompanimentTitle: {
    display: 'flex',
    backgroundColor: 'rgb(246, 246, 246)',
    padding: theme.spacing(2, 3),
    '&>:first-child': {
      flexGrow: 1,
    },
  },
  accompanimentSection: {
    display: 'none',
    '&.expanded': {
      display: 'block',
    },
  },
  accompanimentOption: {
    padding: theme.spacing(2, 3),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  label: {
    width: '100%',
  },
  itemImage: {
    marginRight: theme.spacing(2),
  },
  foodCard: {
    margin: theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(1, 0),
  },
  dialogActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }
}));

interface MenuDetailsDialogStateProps {
  isNew: (id: string) => boolean;
}

interface MenuDetailsDialogDispatchProps { }

interface MenuDetailsDialogOwnProps {
  item: Menu;
  open: boolean;
  onClose: (
    result: MenuInCart | null,
    reason?: 'add' | 'update' | 'remove' | 'cancel'
  ) => void;
  price?: String;
  restaurant?: Restaurant;
  clearCart?: Function;
  showGlobalPrice?: boolean;
  menuState?: any;
}

type MenuDetailsDialogProps = MenuDetailsDialogStateProps &
  MenuDetailsDialogDispatchProps &
  MenuDetailsDialogOwnProps;

const MenuDetailsDialog: React.FC<MenuDetailsDialogProps> = ({
  open,
  onClose,
  item,
  isNew,
  price,
  restaurant,
  clearCart,
  showGlobalPrice,
  menuState
}) => {
  const classes = useStyles();

  const DEFAULT_STATE = useMemo<MenuInCart>(
    () => ({
      id: uuidv4(),
      foods: [],
      item,
      quantity: 0,
    }),
    [item]
  );

  const reducer: (
    state: MenuState,
    action: MenuAction
  ) => MenuState = useCallback(
    (state = DEFAULT_STATE, action) => {
      let index: number;
      let options: Option[] | null;
      let option: Option;
      let item: OptionItem | null;
      let { quantity, foods } = state;

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

        case 'add_food':
          return {
            ...state,
            foods: [
              ...state.foods,
              {
                food: action.payload,
                options: action.payload.options.map(
                  ({ maxOptions, title }) => ({
                    items: [],
                    maxOptions,
                    title,
                  })
                ),
              },
            ],
          };

        case 'remove_food':
          index = foods.findIndex(
            ({ food: { _id } }) => _id === action.payload._id
          );

          if (index >= 0)
            state.foods = [
              ...state.foods.slice(0, index),
              ...state.foods.slice(index + 1),
            ];

          return {
            ...state,
            foods: [...state.foods],
          };

        case 'increment_option_item':
          options = foods.filter(
            ({ food: { _id } }) => _id === action.payload.food._id
          )[0]?.options;

          if (options) {
            option = options.filter(
              (o) => o.title === action.payload.option
            )[0];

            item = option.items.filter(
              (i) => i.item._id === action.payload.item._id
            )[0];

            if (!item) {
              item = { item: action.payload.item, quantity: 1 };
              option.items.push(item);
            } else {
              item.quantity++;
            }
          }

          return {
            ...state,
          };

        case 'decrement_option_item':
          options = foods.filter(
            ({ food: { _id } }) => _id === action.payload.food._id
          )[0]?.options;

          if (options) {
            option = options.filter(
              (o) => o.title === action.payload.option
            )[0];

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
          }

          return {
            ...state,
          };

        case 'clear_option':
          options = foods.filter(
            ({ food: { _id } }) => _id === action.payload.food._id
          )[0]?.options;

          if (options) {
            option = options.filter((o) => o.title === action.payload.title)[0];

            if (option) option.items = [];
          }

          return {
            ...state,
          };

        case 'reset':
          return {
            ...DEFAULT_STATE,
            id: uuidv4(),
            foods: [],
            quantity: 0,
          };

        default:
          return state;
      }
    },

    [DEFAULT_STATE]
  );

  let [menu, dispatch] = useReducer<React.Reducer<MenuState, MenuAction>>(
    process.env.NODE_ENV === 'development' ? logger(reducer) : reducer,
    DEFAULT_STATE
  );

  const { foods } = item;
  const [additionalPrice, setAdditionaPrice] = useState<number>(0);

  useEffect(
    () => {
      let tempAdditionalPrice = 0
      menu.foods.filter(({ food }) => food.additionalPrice.amount !== 0)?.forEach(food => {
        tempAdditionalPrice += food.food.additionalPrice.amount
      })
      setAdditionaPrice(tempAdditionalPrice)
    },
    [menu]
  )

  const foodTypes = useMemo(
    () => [
      ...new Set(
        item.foods.sort((a: any, b: any) => a.food.type?.priority - b.food.type?.priority)
          .map(
            ({ food: { type } }: any) =>
              (typeof type?.name === 'string' && type?.name) ||
              (type?.name as { [key: string]: string })?.fr
          )
      ),
    ],
    [item.foods]

  );

  const { quantity, foods: foodsInCart } = menu;

  const theme = useTheme();

  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  // const [foods, setFoods] = useState<any>([]);
  const [clearCartAndAddFood, setClearCartAndAddFood] = useState(false);
  const [clearCartOption, setClearCartOption] = useState<number>(0);
  const [openCartError, setOpenCartError] = useState(false);
  const [OpenCollapse, setOpenCollapse] = useState<any>({});

  const decrementQuantity = useCallback(() => {
    if (quantity > 0) dispatch({ type: 'decrement_quantity' });
  }, [dispatch, quantity]);

  const incrementQuantity = useCallback(() => {
    dispatch({ type: 'increment_quantity' });
  }, [dispatch]);

  const addMenu = useCallback(
    () => {
      onClose({
        ...menu,
        item: {
          ...menu.item,
          price: {
            ...menu.item.price,
            amount: (showGlobalPrice || menuState.priceType !== 'priceless') ?
              (menuState.priceType === 'fixed_price' ?
                menu.item.price.amount + additionalPrice
                : 0
              )
              : 0
          }
        },
        foods: menu.foods.map(({ food, options }) => ({
          food: {
            ...food,
            price: {
              ...food.price,
              amount: (showGlobalPrice || menuState.priceType !== 'priceless') ? (menuState.isShowPrice ? food.price.amount : 0) : 0
            }
          },
          options: options.map(({ items, maxOptions, title }) => ({
            items: items.map(({ item, quantity }) => ({
              item: {
                ...item,
                price: {
                  ...item.price,
                  amount: (showGlobalPrice || menuState.priceType !== 'priceless') ? (menuState.isShowPrice ? item.price.amount : 0) : 0
                }
              },
              quantity,
            })),
            maxOptions,
            title
          }))
        }))
      }, isNew(menu.id) ? 'add' : 'update');
      dispatch({ type: 'reset' });
    },
    [isNew, menu, menuState, onClose, showGlobalPrice, additionalPrice]
  )

  const save = useCallback(() => {
    if (restaurant && restaurant._id !== item.restaurant?._id) {
      setOpenCartError(true)
      return;
    }
    addMenu()
  }, [addMenu, restaurant, item.restaurant]);

  useEffect(
    () => {
      if (clearCartAndAddFood) {
        addMenu()
        setClearCartAndAddFood(false)
      }
    },
    [clearCartAndAddFood, addMenu]
  )

  const [openedDefault, setOpenedDefault] = useState<any>(foods
    .filter(
      ({ food: { type: { name } } }: any) =>
        (typeof name === 'string' && name === foodTypes[0]) ||
        (name as { [key: string]: string }).fr === foodTypes[0]
    )[0])

  const tempFunc = () => {
    console.log('')
  }

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
      <Fab
        className={classes.close}
        size="small"
        onClick={() => onClose(null, 'cancel')}
      >
        <CloseIcon />
      </Fab>
      <DialogContent className={classes.dialogContent}>


        <Grid container={true}>

          <Grid item xs>
            <Container>
              <Typography className={classes.name} variant="h4" component="h1">
                {item.name}
              </Typography>
              <Typography
                className={clsx(classes.description, 'translate')}
                variant="body1"
              >
                {item.description}
              </Typography>


              <Typography
                className={clsx(classes.foodTypes, 'translate')}
                variant="body2"
              >
                {foodTypes.join(' + ')}
              </Typography>


            </Container>
          </Grid>

          {console.log("test", item)}

          <Grid item>
            <Typography className={classes.name} variant="h4" component="h1">
              {`€ ${(item.price.amount / 100)}`}
            </Typography>
          </Grid>

        </Grid>

        {!!foods.length &&
          foodTypes.map((type) => (
            <React.Fragment key={type}>
              <Divider className={classes.divider} />
              <Typography
                variant="h6"
                style={{ fontWeight: 'bold' }}
                align="center"
              >
                {type}
              </Typography>
              <Divider className={classes.divider} />
              {foods
                .filter(
                  ({ food: { type: { name } } }: any) =>
                    (typeof name === 'string' && name === type) ||
                    (name as { [key: string]: string }).fr === type
                )
                .sort((a: any, b: any) => a.food.priority - b.food.priority)
                .map(({ food, additionalPrice }: any) => (
                  <Card
                    className={classes.foodCard}
                    elevation={3}
                    key={food._id}
                  >
                    <CardActionArea>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar src={food.imageURL} alt={food.name} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={food.name + `${(additionalPrice.amount > 0 && showGlobalPrice && menu.item.type === 'fixed_price') ? ` (+${additionalPrice.amount / 100}€)` : ''}`}
                          secondary={(food.price?.amount && menuState.isShowPrice && (menuState.priceType !== 'fixed_price') && showGlobalPrice) ?
                            (<span>{`€ ${food.price.amount / 100}`}</span>) : ''
                          }
                        />

                        <Checkbox
                          checked={
                            !!foodsInCart.find(
                              ({ food: { _id: id } }) => id === food._id
                            )
                          }
                          onChange={(_, checked) => {
                            setOpenedDefault(undefined)
                            if (checked) {
                              if (quantity === 0) {
                                incrementQuantity()
                              }
                              dispatch({ type: 'add_food', payload: { ...food, additionalPrice } });
                            }
                            else
                              dispatch({ type: 'remove_food', payload: food });
                          }}
                        />
                      </ListItem>
                    </CardActionArea>
                    <Collapse
                      mountOnEnter={false}
                      in={
                        !!foodsInCart.find(
                          ({ food: { _id: id } }) => id === food._id
                        ) || openedDefault?.food._id === food._id
                      }
                    >
                      {food.options
                        .sort((a: any, b: any) => a.priority - b.priority)
                        .map((option: any) => {
                          const options = foodsInCart.filter(
                            ({ food: { _id } }) => _id === food._id
                          )[0]?.options;

                          if (!option.maxOptions || !option.items.length)
                            return null;

                          return (
                            <div
                              className={classes.accompaniment}
                              key={option.title}
                            >
                              <div className={classes.accompanimentTitle}>
                                <div onClick={() => {
                                  setOpenCollapse({
                                    ...OpenCollapse,
                                    [option.title]: !OpenCollapse[option.title as any] as any
                                  })
                                }}
                                  style={{
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Grid container={true}>

                                    <Grid item xs>
                                      <Typography variant="h6">
                                        {option.title}
                                      </Typography>
                                      <Typography variant="body2">{`Choissisez-en jusqu'à ${option.maxOptions}`}</Typography>
                                    </Grid>

                                    <Grid item>
                                      {OpenCollapse[option.title as any] ? <ExpandLess /> : <ExpandMore />}
                                    </Grid>

                                  </Grid>

                                </div>
                              </div>
                              <div>
                                <Collapse
                                  mountOnEnter={false}
                                  in={OpenCollapse[option.title as any]}
                                >
                                  {option
                                    .maxOptions === 1 ? (
                                    <RadioGroup name={option.title}>
                                      {option.items
                                        .sort((a: any, b: any) => a.priority - b.priority)
                                        .map((item: any) => (
                                          <FormControlLabel
                                            key={item._id}
                                            className={classes.accompanimentOption}
                                            value={item._id}
                                            control={
                                              <Radio
                                                disabled={
                                                  foodsInCart.findIndex(
                                                    ({ food: { _id: id } }) => id === food._id
                                                  ) === -1
                                                }
                                                checked={
                                                  options &&
                                                  options
                                                    .filter(
                                                      (o) => o.title === option.title
                                                    )[0]
                                                    ?.items.filter(
                                                      (i) => i.item._id === item._id
                                                    )[0]?.quantity > 0
                                                }
                                                onClick={() => {
                                                  dispatch({
                                                    type: 'clear_option',
                                                    payload: {
                                                      food,
                                                      title: option.title,
                                                    },
                                                  });
                                                  dispatch({
                                                    type: 'increment_option_item',
                                                    payload: {
                                                      food,
                                                      option: option.title,
                                                      item,
                                                    },
                                                  });
                                                }}
                                              />
                                            }
                                            classes={{ label: classes.label }}
                                            labelPlacement="start"
                                            label={
                                              <Grid container alignItems="center">

                                                <Grid item>

                                                  <Avatar

                                                    className={classes.itemImage}
                                                    src={item.imageURL}
                                                    alt={item.name}
                                                  />

                                                </Grid>

                                                <Grid item>

                                                  <Typography>
                                                    {item.name}
                                                    <br />
                                                    {(item.price &&
                                                      item.price.amount &&
                                                      showGlobalPrice &&
                                                      menuState.isShowPrice) ? `€ ${(item.price.amount / 100)}` : ' '}

                                                  </Typography>

                                                </Grid>

                                              </Grid>
                                            }
                                          />
                                        ))}
                                    </RadioGroup>
                                  ) : option.maxOptions > 1 ? (
                                    <Grid container direction="column">
                                      {option.items
                                        .sort((a: any, b: any) => a.priority - b.priority)

                                        .map((item: any) => (
                                          <Grid
                                            key={item._id}
                                            item
                                            container
                                            alignItems="center"
                                            className={classes.accompanimentOption}
                                            style={{ height: 74 }}
                                          >
                                            <Grid item>
                                              <Avatar
                                                className={classes.itemImage}
                                                src={item.imageURL}
                                                alt={item.name}
                                              />
                                            </Grid>
                                            <Grid item xs>

                                              <Typography>
                                                {item.name}
                                                <br />
                                                {(item.price &&
                                                  item.price.amount &&
                                                  showGlobalPrice &&
                                                  menuState.isShowPrice) ? `€ ${(item.price.amount / 100)}` : ``}
                                              </Typography>

                                            </Grid>

                                            {options &&
                                              options
                                                .filter(
                                                  (o) => o.title === option.title
                                                )[0]
                                                .items.filter(
                                                  (i) => i.item._id === item._id
                                                )[0]?.quantity && (
                                                <>
                                                  <Grid item>
                                                    <MiniFab
                                                      color="primary"
                                                      onClick={() =>
                                                        dispatch({
                                                          type:
                                                            'decrement_option_item',
                                                          payload: {
                                                            food,
                                                            option: option.title,
                                                            item,
                                                          },
                                                        })
                                                      }
                                                      disabled={
                                                        !(
                                                          (options &&
                                                            options
                                                              .filter(
                                                                (o) =>
                                                                  o.title ===
                                                                  option.title
                                                              )[0]
                                                              .items.filter(
                                                                (i) =>
                                                                  i.item._id ===
                                                                  item._id
                                                              )[0]?.quantity) ||
                                                          0
                                                        )
                                                      }
                                                    >
                                                      <RemoveIcon />
                                                    </MiniFab>
                                                  </Grid>
                                                  <Grid
                                                    item
                                                    className={classes.number}
                                                  >
                                                    {(options &&
                                                      options
                                                        .filter(
                                                          (o) =>
                                                            o.title === option.title
                                                        )[0]
                                                        .items.filter(
                                                          (i) =>
                                                            i.item._id === item._id
                                                        )[0]?.quantity) ||
                                                      0}
                                                  </Grid>
                                                </>
                                              )}
                                            <Grid item>
                                              <MiniFab
                                                color="primary"
                                                onClick={() =>
                                                  dispatch({
                                                    type: 'increment_option_item',
                                                    payload: {
                                                      food,
                                                      option: option.title,
                                                      item,
                                                    },
                                                  })
                                                }
                                                disabled={
                                                  (options &&
                                                    maxOptionExceeded(
                                                      options.filter(
                                                        (o) => o.title === option.title
                                                      )[0]
                                                    )) || foodsInCart.findIndex(
                                                      ({ food: { _id: id } }) => id === food._id
                                                    ) === -1
                                                }
                                              >
                                                <AddIcon />
                                              </MiniFab>
                                            </Grid>
                                          </Grid>
                                        ))}
                                    </Grid>
                                  ) : null}

                                </Collapse>
                              </div>
                            </div>
                          );
                        })}
                    </Collapse>
                  </Card>
                ))}
            </React.Fragment>
          ))}
      </DialogContent>
      {quantity !== 0 && <DialogActions className={classes.dialogActions}>
        <div className={classes.controls}>
          <Fab
            size="medium"
            color="primary"
            disabled={quantity <= 1 || !menu.foods.length}
            onClick={decrementQuantity}
          >
            <RemoveIcon />
          </Fab>
          <span className={classes.number}>{quantity}</span>
          <Fab
            size="medium"
            disabled={!menu.foods.length}
            onClick={incrementQuantity}
            color="primary"
          >
            <AddIcon />
          </Fab>
        </div>
        <Button
          fullWidth
          color="primary"
          size="large"
          variant="contained"
          disabled={!quantity || !menu.foods.length}
          onClick={save}
        >
          <span className="translates">
            {isNew(menu.id) ? 'Ajouter au panier' : 'Modifier'}
          </span>
          {(menuState.isShowPrice || menuState.priceType === 'fixed_price') && showGlobalPrice && <span style={{ marginLeft: 'auto' }}>
            {
              ('€' + (estimateMenuPrice(menu) / 100 + additionalPrice / 100))
            }
          </span>}
        </Button>
        {!isNew(menu.id) && (
          <DeleteButton
            size="small"
            onClick={() => {
              onClose(menu, 'remove');
            }}
          />
        )}
      </DialogActions>}
      <ClearCartModal open={openCartError} setOpen={setOpenCartError} action={clearCart || tempFunc} setClearCartAndAddFood={setClearCartAndAddFood} setClearCartOption={setClearCartOption} clearCartOption={clearCartOption} />
    </Dialog>
  );
};

const mapStateToProps: MapStateToProps<
  MenuDetailsDialogStateProps,
  MenuDetailsDialogOwnProps,
  RootState
> = ({ cart: { menus } }) => ({
  isNew: (id) => !menus.filter(({ id: itemId }) => itemId === id).length,
});

const ConnectedMenuDetailsDialog = connect<
  MenuDetailsDialogStateProps,
  MenuDetailsDialogDispatchProps,
  MenuDetailsDialogOwnProps,
  RootState
>(mapStateToProps)(MenuDetailsDialog);

export default ConnectedMenuDetailsDialog;
