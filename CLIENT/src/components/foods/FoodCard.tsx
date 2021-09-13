import React, { useCallback, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
import Typography from '@material-ui/core/Typography';
import { Fastfood as FastfoodIcon } from '@material-ui/icons';
import {
  Avatar,
  Chip,
  ClickAwayListener,
  Fab,
  Grid,
  Tooltip,
} from '@material-ui/core';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Image,
} from '@material-ui/icons';
import Food from '../../models/Food.model';
import { connect, MapStateToProps } from 'react-redux';
import RootState, { RootActionTypes } from '../../redux/types';
import { addFavoriteFood, removeFavoriteFood } from '../../redux/actions/auth';
import { ThunkDispatch } from 'redux-thunk';
import { useSnackbar } from 'notistack';
import FoodDetailsDialog from './FoodDetailsDialog';
import CardBadge from '../CardBadge';
import clsx from 'clsx';
import Restaurant from '../../models/Restaurant.model';
import {
  addFoodToCart,
  removeFoodFromCart,
  resetCart,
  updateFoodInCart,
} from '../../redux/actions/cart';
import { FoodInCart } from '../../redux/types/cart';
import FoodAttribute from '../../models/FoodAttribute.model';
import VisibilityIcon from '@material-ui/icons/Visibility';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    display: 'flex',
    minHeight: 200,
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      minHeight: 140,
    },
    '&.active': {
      border: `2px solid ${theme.palette.primary.main}`,
    },
  },
  cardAction: {
    display: 'flex',
    alignItems: 'stretch',
  },
  cardContent: {
    width: '60%',
  },
  cardMedia: {
    width: '100%',
    height: '100%',
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
  price: {
    fontSize: 16,
    marginTop: 'auto',
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(1),
    },
  },
  favoriteButton: {
    color: 'white',
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(2),
  },
  chipRoot: {
    [theme.breakpoints.down('sm')]: {
      height: '26px !important',
    },
  },
  chipAvatar: {
    marginRight: `${theme.spacing(0.75)}px !important`,
    [theme.breakpoints.down('sm')]: {
      width: '16px !important',
      height: '16px !important',
    },
  },
  chipLabel: {
    padding: 0,
  },
  see: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderTopRightRadius: '16px',
    backgroundColor: 'gray',
    height: 40,
    width: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  overlayContainer: {
    position: 'relative',
    width: '40%',
    height: '100%'
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

interface FoodCardStateProps {
  count: number;
  showPrice: boolean;
  isFavorite: boolean;
  authenticated: boolean;
  restaurant: Restaurant | null;
  pricelessCommand: boolean;
  totalCount: number;
}

interface FoodCardDispatchProps {
  addToFavorites: () => Promise<void>;
  removeFromFavorites: () => Promise<void>;
  addFood: (data: FoodInCart) => void;
  updateFood: (data: FoodInCart) => void;
  removeFood: (id: string) => void;
  resetCart: () => void;
}

interface FoodCardOwnProps {
  item: Food;
  popular?: boolean;
  showGlobalPrice?: boolean;
}

type FoodCardProps = FoodCardStateProps &
  FoodCardDispatchProps &
  FoodCardOwnProps;

const FoodCard: React.FC<FoodCardProps> = ({
  item,
  showPrice,
  isFavorite,
  authenticated,
  addToFavorites,
  removeFromFavorites,
  addFood,
  updateFood,
  removeFood,
  count,
  restaurant,
  pricelessCommand,
  totalCount,
  popular,
  resetCart,
  showGlobalPrice
}) => {
  const classes = useStyles();

  const [open, setOpen] = useState(false);

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
        await removeFromFavorites();
        enqueueSnackbar('Supprimé des favoris', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
      }
    } else {
      try {
        await addToFavorites();
        enqueueSnackbar('Ajouté aux favoris', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar("Erreur lors de l'ajout", { variant: 'error' });
      }
    }
  };

  const onDetailsClose = useCallback<
    (
      result: FoodInCart | null,
      reason?: 'add' | 'update' | 'remove' | 'cancel'
    ) => void
  >(
    (result, reason) => {
      if (result) {
        if (reason === 'add') addFood(result);
        else if (reason === 'update') updateFood(result);
        else if (reason === 'remove') removeFood(result.id);
      }
      setOpen(false);
    },
    [addFood, removeFood, updateFood]
  );

  const [openedTooltips, setOpenedTooltips] = useState<string[]>([]);

  const handleTooltipClose = (id: string) => () => {
    setOpenedTooltips((v) => v.filter((v) => v !== id));
  };

  const handleTooltipClick: (
    id: string
  ) => React.MouseEventHandler<HTMLDivElement> = (id: string) => (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!openedTooltips.find((v) => v === id))
      setOpenedTooltips((v) => [...v, id]);
    else setOpenedTooltips((v) => v.filter((v) => v === id));
  };

  return (
    <>
      <CardBadge badgeContent={count} color="primary">
        <Card
          className={clsx(classes.root, { active: !!count })}
          elevation={count ? 0 : undefined}
        >
          <CardActionArea
            onClick={() => {

              if (item.isAvailable) {
                setOpen(true);
              }
              // if (totalCount) {
              //   if (
              //     (pricelessCommand && item.price.amount) ||
              //     (!pricelessCommand && !item.price.amount)
              //   )
              //     return enqueueSnackbar(
              //       'Vous ne pouvez pas commander des plats sans prix et des plats avec prix à la fois'
              //     );
              // }

            }}
            className={classes.cardAction}
          >
            <CardContent className={classes.cardContent}>
              <Typography component="h5" variant="h5" className="translate">
                {item.name}
              </Typography>
              {item.description && (
                <Typography
                  variant="subtitle1"
                  color="textSecondary"
                  className="translate"
                >
                  {item.description}
                </Typography>
              )}
              {!popular && showPrice && item.price.amount && showGlobalPrice && (
                <Typography
                  component="h6"
                  variant="h6"
                  className={classes.price}
                  style={{ marginLeft: 0 }}
                >
                  €
                  {((item.price.amount || 0) / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                  })}
                </Typography>
              )}
              <Grid container spacing={1}>
                {(item.attributes as FoodAttribute[]).map(
                  ({ _id, imageURL, tag, locales }) => (
                    <Grid item key={_id}>
                      <ClickAwayListener onClickAway={handleTooltipClose(_id)}>
                        <div>
                          <Tooltip
                            arrow
                            onClose={handleTooltipClose(_id)}
                            open={!!openedTooltips.find((v) => v === _id)}
                            title={
                              <span className="translate">{locales?.fr}</span>
                            }
                            disableFocusListener
                            disableHoverListener
                            disableTouchListener
                          >
                            <Chip
                              onClick={handleTooltipClick(_id)}
                              classes={{
                                root: classes.chipRoot,
                                avatar: classes.chipAvatar,
                                label: classes.chipLabel,
                              }}

                              avatar={imageURL ? (<Avatar alt={tag} src={imageURL} />) : (<FastfoodIcon />)}
                              label={null}
                            />
                          </Tooltip>
                        </div>
                      </ClickAwayListener>
                    </Grid>
                  )
                )}
                {(item.allergene as FoodAttribute[]).map(({ _id, imageURL, tag, locales }) => (
                    <Grid item key={_id}>
                      <ClickAwayListener onClickAway={handleTooltipClose(_id)}>
                        <div>
                          <Tooltip
                            arrow
                            onClose={handleTooltipClose(_id)}
                            open={!!openedTooltips.find((v) => v === _id)}
                            title={
                              <span className="translate">{locales?.fr}</span>
                            }
                            disableFocusListener
                            disableHoverListener
                            disableTouchListener
                          >
                            <Chip
                              onClick={handleTooltipClick(_id)}
                              classes={{
                                root: classes.chipRoot,
                                avatar: classes.chipAvatar,
                                label: classes.chipLabel,
                              }}

                              avatar={imageURL ? (<Avatar alt={tag.split('-')[1]} src={imageURL} />) : (<FastfoodIcon />)}
                              label={null}
                            />
                          </Tooltip>
                        </div>
                      </ClickAwayListener>
                    </Grid>
                  )
                )}
              </Grid>
            </CardContent>
            {Boolean(item.imageURL) ? (
              <div className={classes.overlayContainer}>
                <CardMedia
                  className={classes.cardMedia}
                  image={item.imageURL}
                  title={item.name}
                />
                {(item.imageNotContractual || !item.isAvailable) && (
                  <div className={classes.overlayContent}>
                    <p style={{ color: 'white' }} className="translate">{!item.isAvailable ? "Non disponible" : "Non contractuel"}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={classes.overlayContainer}>
                <Grid
                  container
                  justify="center"
                  alignItems="center"
                  className={classes.cardMedia}
                >
                  <Image fontSize="inherit" />
                </Grid>
              </div>
            )}
          </CardActionArea>
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
          {popular && (
            <div onClick={async () => setOpen(true)} className={classes.see}>
              <VisibilityIcon style={{ color: 'white', zIndex: 1000 }} />
            </div>
          )}
        </Card>
      </CardBadge>

      <FoodDetailsDialog
        popular={popular}
        item={item}
        open={open}
        onClose={onDetailsClose}
        restaurant={restaurant || undefined}
        clearCart={resetCart}
        showGlobalPrice={showGlobalPrice}
        isAvailable={item.isAvailable}
      />
    </>
  );
};

const mapStateToProps: MapStateToProps<
  FoodCardStateProps,
  FoodCardOwnProps,
  RootState
> = (
  {
    cart: { priceless: pricelessCommand, foods, restaurant },
    setting: { showPrice },
    auth: { user, authenticated },
  },
  { item: { _id } }
) => ({
  count: foods
    .filter(({ item }) => item._id === _id)
    .reduce((p, { quantity }) => p + quantity, 0),
  showPrice,
  isFavorite: !!user && !!user.favoriteFoods.filter((id) => id === _id).length,
  authenticated,
  restaurant,
  pricelessCommand,
  totalCount: foods.length,
});

const mapDispatchToProps: (
  dispatch: ThunkDispatch<RootState, undefined, RootActionTypes>,
  props: FoodCardOwnProps
) => FoodCardDispatchProps = (dispatch, { item: { _id: foodId } }) => ({
  addToFavorites: () => dispatch(addFavoriteFood(foodId)),
  removeFromFavorites: () => dispatch(removeFavoriteFood(foodId)),
  addFood: ({ id, item, quantity, options }) =>
    dispatch(
      addFoodToCart({
        id,
        item,
        quantity,
        options,
      })
    ),
  updateFood: ({ id, item, quantity, options }) =>
    dispatch(
      updateFoodInCart({
        id,
        item,
        quantity,
        options,
      })
    ),
  removeFood: (id) => dispatch(removeFoodFromCart(foodId)),
  resetCart: () => dispatch(resetCart()),
});

const ConnectedFoodCard = connect<
  FoodCardStateProps,
  FoodCardDispatchProps,
  FoodCardOwnProps,
  RootState
>(
  mapStateToProps,
  mapDispatchToProps
)(FoodCard);

export default ConnectedFoodCard;
