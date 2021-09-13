import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import Typography from '@material-ui/core/Typography';
import { connect, MapStateToProps } from 'react-redux';
import RootState, { RootActionTypes } from '../../redux/types';
import Menu from '../../models/Menu.model';
import MenuDetailsDialogProps from './MenuDetailsDialog';
import CardBadge from '../CardBadge';
import Restaurant from '../../models/Restaurant.model';
import { MenuInCart } from '../../redux/types/cart';
import { ThunkDispatch } from 'redux-thunk';
import {
  addMenuToCart,
  removeMenuFromCart,
  resetCart,
  updateMenuInCart,
} from '../../redux/actions/cart';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    display: 'flex',
  },
  cardAction: {
    display: 'flex',
    alignItems: 'stretch',
  },
  cardContent: {
    flexGrow: 1,
  },
  cardMedia: {
    width: '40%',
    fontSize: theme.typography.pxToRem(80),
  },
  text: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  playIcon: {
    height: 38,
    width: 38,
  },
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
  },
  imageDialog: {
    height: '40vh',
  },
  number: {
    fontSize: '18px',
    width: 40,
    textAlign: 'center',
  },
  favoriteButton: {
    color: 'white',
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(2),
  },
  imageFood: {
    width: 50,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
  },
  name: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
    '&::after': {
      content: '""',
      display: 'block',
      flexGrow: 1,
      boxSizing: 'content-box',
      height: 0,
      marginLeft: theme.spacing(2),
      borderTop: '4px dotted rgba(0, 0, 0, .4)',
    },
  },
}));

interface MenuCardStateProps {
  count: number;
  isFavorite: boolean;
  restaurant: Restaurant | null;
}

interface MenuCardDispatchProps {
  addMenu: (data: MenuInCart) => void;
  updateMenu: (data: MenuInCart) => void;
  removeMenu: (id: string) => void;
  resetCart: () => void;
}

interface MenuCardOwnProps {
  item: Menu;
  showGlobalPrice?: boolean;
}

type MenuCardProps = MenuCardStateProps &
  MenuCardDispatchProps &
  MenuCardOwnProps;

const MenuCard: React.FC<MenuCardProps> = ({
  item,
  count,
  restaurant,
  addMenu,
  updateMenu,
  removeMenu,
  resetCart,
  showGlobalPrice
}) => {
  const classes = useStyles();

  const [open, setOpen] = useState(false);

  const [menuState, setMenuState] = useState<any>({
    isShowPrice: true,
    priceType: '',
    price: 0,
    showMenuPrice: false,
  })

  useEffect(
    () => {
      switch (item.type) {
        case 'priceless':
          setMenuState((s: any) => ({...s, isShowPrice: false, showMenuPrice: false}))
          break;
        case 'fixed_price':
          setMenuState((s: any) => ({...s, isShowPrice: false, showMenuPrice: true}))
          break;
        default:
          setMenuState((s: any) => ({...s, isShowPrice: true, showMenuPrice: false}))
      }
      setMenuState((s: any) => ({...s, priceType: item.type, price: item.price.amount || item.price}))
    },
    [item]
  )

  const foodTypes = useMemo(
    () => [
      ...new Set(
        item.foods.map(
          ({ food: {type} }: any) =>
            (typeof type?.name === 'string' && type?.name) ||
            (type?.name as { [key: string]: string })?.fr
        )
      ),
    ],
    [item.foods]
  );

  const onDetailsClose = useCallback<
    (
      result: MenuInCart | null,
      reason?: 'add' | 'update' | 'remove' | 'cancel'
    ) => void
  >(
    (result, reason) => {
      if (result) {
        if (reason === 'add') addMenu(result);
        else if (reason === 'update') updateMenu(result);
        else if (reason === 'remove') removeMenu(result.id);
      }
      setOpen(false);
    },
    [addMenu, removeMenu, updateMenu]
  );

  return (
    <>
      <CardBadge badgeContent={count} color="primary">
        <Card className={classes.root}>
          <CardActionArea
            onClick={() => {
              setOpen(true);
            }}
            className={classes.cardAction}
          >
            <CardContent className={classes.cardContent}>
              <Typography component="h5" variant="h5" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <Typography component="h5" variant="h5">
                  {item.name}
                </Typography>
                {menuState.showMenuPrice && item.type !== 'priceless' && showGlobalPrice && <Typography component="h6" variant="h6" style={{ color: 'red' }}>
                  €{item.price.amount / 100}
                </Typography>}
              </Typography>
              <Typography
                className="translate"
                variant="subtitle1"
                color="textSecondary"
              >
                {foodTypes.join(' • ')}
              </Typography>
            </CardContent>
            {/* {Boolean(item.imageURL) ? (
              <CardMedia
                className={classes.cardMedia}
                image={item.imageURL}
                title={item.name}
              />
            ) : (
              <Grid
                container
                justify="center"
                alignItems="center"
                className={classes.cardMedia}
              >
                <Image fontSize="inherit" />
              </Grid>
            )} */}
          </CardActionArea>
        </Card>
      </CardBadge>

      <MenuDetailsDialogProps
        item={item}
        open={open}
        onClose={onDetailsClose}
        restaurant={restaurant || undefined}
        clearCart={resetCart}
        showGlobalPrice={showGlobalPrice}
        menuState={menuState}
      />
    </>
  );
};

const mapStateToProps: MapStateToProps<
  MenuCardStateProps,
  MenuCardOwnProps,
  RootState
> = (
  { cart: { menus, restaurant }, setting: { showPrice }, auth: { user } },
  { item: { _id } }
) => ({
  count: menus
    .filter(({ item: { _id: itemId } }) => itemId === _id)
    .reduce<number>((p, { quantity }) => p + quantity, 0),
  showPrice,
  isFavorite: !!user && !!user.favoriteFoods.filter((id) => id === _id).length,
  restaurant,
});

const mapDispatchToProps: (
  dispatch: ThunkDispatch<RootState, undefined, RootActionTypes>,
  props: MenuCardOwnProps
) => MenuCardDispatchProps = (dispatch) => ({
  resetCart: () => dispatch(resetCart()),
  addMenu: ({ id, foods, item, quantity }) =>
    dispatch(
      addMenuToCart({
        id,
        foods,
        item,
        quantity,
      })
    ),
  updateMenu: ({ id, foods, item, quantity }) =>
    dispatch(
      updateMenuInCart({
        id,
        foods,
        item,
        quantity,
      })
    ),
  removeMenu: (id) => dispatch(removeMenuFromCart(id)),
});

const ConnectedMenuCard = connect<
  MenuCardStateProps,
  MenuCardDispatchProps,
  MenuCardOwnProps,
  RootState
>(
  mapStateToProps,
  mapDispatchToProps
)(MenuCard);

export default ConnectedMenuCard;
