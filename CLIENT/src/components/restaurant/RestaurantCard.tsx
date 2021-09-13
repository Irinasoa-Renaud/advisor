import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { useHistory } from 'react-router-dom';

import Divider from '@material-ui/core/Divider';
import { Fab } from '@material-ui/core';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@material-ui/icons';
import { connect, MapStateToProps } from 'react-redux';
import RootState from '../../redux/types';
import { ThunkDispatch } from 'redux-thunk';
import { AuthActionTypes } from '../../redux/types/auth';
import {
  addFavoriteRestaurant,
  removeFavoriteRestaurant,
} from '../../redux/actions/auth';
import Restaurant from '../../models/Restaurant.model';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    maxWidth: 600,
    cursor: 'pointer',
    backgroundColor: 'transparent',
  },
  media: {
    height: 160,
  },
  divider: {
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
  },
  cardContent: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: 0,
    paddingRight: 0,
  },
  favoriteButton: {
    color: 'white',
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(2),
  },
}));

interface RestaurantCardStateProps {
  isFavorite: boolean;
  authenticated: boolean;
}

interface RestaurantCardDispatchProps {
  addToFavorites: () => Promise<void>;
  removeFromFavorites: () => Promise<void>;
}

interface RestaurantCardOwnProps {
  item: Restaurant 
}

type RestaurantCardProps = RestaurantCardStateProps &
  RestaurantCardDispatchProps &
  RestaurantCardOwnProps;

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  item: { _id, logo, name, city, address, category },
  authenticated,
  isFavorite,
  addToFavorites,
  removeFromFavorites,
}) => {
  const classes = useStyles();

  const history = useHistory();

  const { enqueueSnackbar } = useSnackbar();

  const clicked = () => {
    history.push('/restaurants/' + _id);
  };

  const favoriteClick = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();

    if (!authenticated) {
      return enqueueSnackbar(
        'Vous devez vous connecter pour pouvoir effectuer cette action',
        {
          variant: 'info',
        }
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

  return (
    <>
      <Card className={classes.root} key={_id} onClick={clicked} elevation={0}>
        <CardMedia className={classes.media} image={logo} title={name} />
        <CardContent className={classes.cardContent}>
          <Typography variant="h5" component="h2" align="left">
            {name}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            component="p"
            align="left"
          >
            {city}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            component="p"
            align="left"
          >
            {address}
          </Typography>
          <Divider className={classes.divider} />
          <Typography
            variant="body2"
            color="textSecondary"
            component="p"
            align="left"
            className="translate"
          >
            {category?.name?.fr}
          </Typography>
        </CardContent>
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
      </Card>
    </>
  );
};

const mapStateToProps: MapStateToProps<
  RestaurantCardStateProps,
  RestaurantCardOwnProps,
  RootState
> = ({ auth: { user, authenticated } }, { item: { _id } }) => ({
  isFavorite:
    !!user && !!user.favoriteRestaurants.filter((id) => id === _id).length,
  authenticated,
});

const mapDispatchToProps: (
  dispatch: ThunkDispatch<RootState, undefined, AuthActionTypes>,
  ownProps: RestaurantCardOwnProps
) => RestaurantCardDispatchProps = (dispatch, { item: { _id } }) => ({
  addToFavorites: () => dispatch(addFavoriteRestaurant(_id)),
  removeFromFavorites: () => dispatch(removeFavoriteRestaurant(_id)),
});

const ConnectedRestaurantCard = connect(
  mapStateToProps,
  mapDispatchToProps
)(RestaurantCard);

export default ConnectedRestaurantCard;
