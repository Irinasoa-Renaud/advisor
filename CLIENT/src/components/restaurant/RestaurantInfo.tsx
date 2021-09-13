import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

import Typography from '@material-ui/core/Typography';
import {
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Fab,
  IconButton,
  Slide,
  Theme,
  useMediaQuery,
} from '@material-ui/core';
import FavoriteborderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { Link } from 'react-router-dom';
import { connect, MapStateToProps } from 'react-redux';
import RootState from '../../redux/types';
import { ThunkDispatch } from 'redux-thunk';
import { AuthActionTypes } from '../../redux/types/auth';
import {
  addFavoriteRestaurant,
  removeFavoriteRestaurant,
} from '../../redux/actions/auth';
import { FacebookShareButton, FacebookIcon } from 'react-share';
import Restaurant from '../../models/Restaurant.model';
import { TransitionProps } from '@material-ui/core/transitions/transition';
import {
  Close,
  LocationOn,
  LocationOn as LocationOnIcon,
  Phone,
} from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import Map from './Map';
import { Marker } from 'react-google-maps';
import DirectionsRenderer from 'react-google-maps/lib/components/DirectionsRenderer';
import clsx from 'clsx';
import { distance, getGeoLocation } from '../../services/location';
import ImageLoader from '../ImageLoader';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import ItineraireDialog from './ItineraireDialog';
import theme from '../../theme';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    width: '80%',
    margin: '0 auto',
    top:'-4vh',
    zIndex:1
  },
  backgroundContainer: {
    width: '100%',
    height: '100%',

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
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: theme.typography.pxToRem(25),
  },
  type: {
    fontStyle: 'italic',
    marginBottom: theme.spacing(2),
  },
  pos: {
    marginBottom: 12,
  },
  card: {
    [theme.breakpoints.up('md')]: {
      minWidth: 600,
      maxWidth: 700,
    },
    [theme.breakpoints.up('sm')]: {
      minWidth: 500,
    },
    [theme.breakpoints.down('sm')]: {
      minWidth: '90vw',
    },
  },
  qrcodeContainer: {
    marginTop: theme.spacing(2),
  },
  qr: {
    width: 100,
    [theme.breakpoints.down('sm')]: {
      width: 80,
    },
  },
  facebookShareButton: {
    display: 'flex',
    marginLeft: 'auto !important',
    marginRight: theme.spacing(1),
    alignItems: 'center',
    padding: `${theme.spacing(1)}px !important`,
    borderRadius: 16,
    '&:hover': {
      backgroundColor: '#eee !important',
    },
    '& > * + *': {
      marginLeft: theme.spacing(1),
    },
  },
  dialogContent: {
    padding: 0,
    paddingTop: '0 !important',
    position: 'relative',
  },
  close: {
    position: 'absolute',
    left: theme.spacing(2),
    top: theme.spacing(2),
  },
  dialogTitle: {
    display: 'table',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  markerLabel: {
    backgroundColor: 'rgba(255, 255, 255, .4)',
    padding: theme.spacing(1),
    borderRadius: 6,
  },
  informationSection: {
    margin: theme.spacing(2, 0),
  },
  openTimeSection: {
    width: '100%',
    marginBottom: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  },
  typeContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: '4px'
  },
  openTime: {
  },
  stepLabel: {
    fontWeight: 'bold'
  },
  openMap: {

  },
  opentTimeDay: {
    fontWeight: 'bold'
  }
}));

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface RestaurantHeaderStateProps {
  isFavorite: boolean;
  authenticated: boolean;
}

interface RestaurantHeaderDispatchProps {
  addToFavorites: () => Promise<void>;
  removeFromFavorites: () => Promise<void>;
}

interface RestaurantHeaderOwnProps {
  restaurant: Restaurant;
}

type RestaurantHeaderProps = RestaurantHeaderStateProps &
  RestaurantHeaderDispatchProps &
  RestaurantHeaderOwnProps;

const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({
  restaurant,
  isFavorite,
  addToFavorites,
  removeFromFavorites,
  authenticated,
}) => {
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const [openDetails, setOpenDetails] = useState(false);

  const [distanceFromHere, setDistance] = useState<number>();
  const [directions, setDirections] = useState<google.maps.DirectionsResult>();
  const [externalGoogleMapLink, setExternalGoogleMapLink] = useState<string>('');
  const [openItineraireDialog, setOpenItineraireDialog] = useState(false);
  const [expandMap, setExpandMap] = useState<boolean>(false);


  const [lng, setLng] = useState<number>();
  const [lat, setLat] = useState<number>();

  useEffect(() => {
    getGeoLocation()
      .then((p) => {
        setLng(p.coords.longitude);
        setLat(p.coords.latitude);
        if (lat && lng) {
          setExternalGoogleMapLink(`http://maps.google.com/maps?f=d&hl=en&saddr=${lat},${lng}&daddr=${restaurant.location.coordinates[1]},${restaurant.location.coordinates[0]}`)
          setDistance(+distance(lat || 0, lng || 0, restaurant.location.coordinates[1], restaurant.location.coordinates[0], 'K'));
        }
      })
      .catch(() => {
        enqueueSnackbar('Erreur lors de la géolocalisation');
      });
  }, [enqueueSnackbar, lat, lng, restaurant.location.coordinates]);

  const getDirection = useCallback(() => {
    if (lat !== undefined && lng !== undefined) {
      const directionsService = new google.maps.DirectionsService();

      const origin = { lat, lng };
      const destination = {
        lat: restaurant.location.coordinates[1],
        lng: restaurant.location.coordinates[0],
      };

      directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) setDirections(result || undefined);
          else if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
            enqueueSnackbar(
              'Aucun résultat lors de la recherche. Vous êtes peut-être trop éloigné(e) de la destination',
              { variant: 'info' }
            );
          } else {
            enqueueSnackbar("Erreur lors de la recherche de l'itinéraire", {
              variant: 'error',
            });
          }
        }
      );
    }
  }, [enqueueSnackbar, lat, lng, restaurant.location.coordinates]);

  const favoriteClick = async () => {
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

  const {
    _id: restaurantId,
    couvertureWeb,
    name,
    type,
    description,
    qrcodeLink: imageQr,
    address,
    phoneNumber,
    delivery,
    aEmporter,
    surPlace,
  } = restaurant;

  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  return (
    <>
      <div className={classes.root}>

        <Grid
          container
          justify="flex-start"
          alignItems="flex-start"
          direction="column"
        >
          <Grid container item xs={12} justify='center'>
            <Card  >
              <CardContent>
                <Grid container justify="space-between">
                  <Grid item>
                    <Typography className={classes.title} color="textPrimary">
                      {name}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <IconButton
                      color="secondary"
                      onClick={favoriteClick}
                      size="medium"
                      edge="start"
                      aria-label="favori"
                      className="translate"
                      title={
                        !isFavorite
                          ? 'Ajouter aux favoris'
                          : 'Retirer des favoris'
                      }
                    >
                      {!isFavorite ? <FavoriteborderIcon /> : <FavoriteIcon />}
                    </IconButton>
                  </Grid>
                </Grid>
                {type && (
                  <Typography
                    variant="body2"
                    component="h6"
                    className={clsx(classes.type, 'translate')}
                    gutterBottom
                  >
                    {type}
                  </Typography>
                )}
                {description && (
                  <Typography
                    variant="body2"
                    component="p"
                    className="translate"
                  >
                    {description}
                    <br />
                  </Typography>
                )}
                <br />
                <Grid container>
                  <Grid item className={clsx(classes.typeContent, 'translate')}>
                    <div>
                      Livraison
                    </div>
                    <div>
                      {delivery ? (<CheckCircleOutlineIcon style={{ color: 'green' }} />) : (<HighlightOffIcon style={{ color: 'red' }} />)}
                    </div>
                  </Grid>
                  <Grid item className={clsx(classes.typeContent, 'translate')}>
                    <div>
                      À emporter
                    </div>
                    <div>
                      {aEmporter ? (<CheckCircleOutlineIcon style={{ color: 'green' }} />) : (<HighlightOffIcon style={{ color: 'red' }} />)}
                    </div>
                  </Grid>
                  <Grid item className={clsx(classes.typeContent, 'translate')}>
                    <div>
                      Sur place
                    </div>
                    <div>
                      {surPlace ? (<CheckCircleOutlineIcon style={{ color: 'green' }} />) : (<HighlightOffIcon style={{ color: 'red' }} />)}
                    </div>
                  </Grid>
                </Grid>
                {phoneNumber && (
                  <Grid
                    container
                    alignItems="center"
                    className={classes.informationSection}
                  >
                    <Grid item xs>
                      <Typography
                        variant="h6"
                        component={Link}
                        style={{ color: 'black' }}
                        to={`/restaurants/${restaurantId}/contact`}
                      >
                        {phoneNumber}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
                <Grid item xs>
                  <Typography
                    variant="h6"
                    component={Link}
                    style={{ color: 'black' }}
                    to={`/restaurants/${restaurantId}/route`}
                  >
                    {address}
                  </Typography>
                </Grid>
              </CardContent>

              <CardActions>
                <div style={{
                  textAlign:'center'
                }}>
                  <ImageLoader src={imageQr} imageClassName={classes.qr} />
                </div>
              </CardActions>

              <CardActions>
                <Button
                  onClick={() => setOpenDetails(true)}
                  className="translate"
                >
                  En Savoir Plus
                </Button>
                <Button
                  color="primary"
                  component={Link}
                  to={`/restaurants/${restaurantId}/contact`}
                  className="translate"
                >
                  Contact
                </Button>
                <FacebookShareButton
                  className={clsx(classes.facebookShareButton, 'translate')}
                  url={window.location.href}
                  quote={'Un petit creux? Menu advisor est là pour ça'}
                  hashtag="#menuadvisor"
                >
                  <FacebookIcon size={36} round />
                  <span>Partager</span>
                </FacebookShareButton>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </div>

      {/* Details dialog */}
      <Dialog
        open={openDetails}
        TransitionComponent={Transition}
        onClose={() => setOpenDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent className={classes.dialogContent}>
          <div style={{ height: !expandMap ? 100 : 400, backgroundColor: '#eee' }}>
            <Map
              defaultZoom={14}
              defaultCenter={{
                lng: restaurant.location.coordinates[0],
                lat: restaurant.location.coordinates[1],
              }}
              googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}`}
              loadingElement={<div style={{ height: '100%' }} />}
              containerElement={<div style={{ height: '100%' }} />}
              mapElement={<div style={{ height: '100%' }} />}
            >
              {(!directions ||
                !directions.routes ||
                !directions.routes.length) && (
                  <>
                    <Marker
                      position={{
                        lng: restaurant.location.coordinates[0],
                        lat: restaurant.location.coordinates[1],
                      }}
                      label={{ text: restaurant.name }}
                      labelClass={clsx(classes.markerLabel, 'translate')}
                    />
                    {lng !== undefined && lat !== undefined && (
                      <Marker
                        position={{ lng, lat }}
                        label={{ text: 'Vous' }}
                        labelClass={clsx(classes.markerLabel, 'translate')}
                      />
                    )}
                  </>
                )}
              <DirectionsRenderer directions={directions} />
            </Map>
          </div>
          <Fab
            className={classes.close}
            size="small"
            onClick={() => setOpenDetails(false)}
          >
            <Close />
          </Fab>
          <Container>
            <Typography
              variant="h4"
              component="h4"
              className={clsx(classes.dialogTitle, 'translate')}
            >
              Localisation et heures d'ouverture {distanceFromHere && `(${distanceFromHere} Km)`}
            </Typography>
            <Button
              className={clsx(classes.openMap, 'translate')}
              size="small"
              color='secondary'
              variant='contained'
              onClick={() => setExpandMap(!expandMap)}
            >
              <LocationOn fontSize="small" /> Carte
            </Button>
            <Grid
              container
              alignItems="center"
              className={classes.informationSection}
            >
              <Grid item>
                <LocationOn fontSize="small" />
              </Grid>
              <Grid item xs>
                <Typography variant="h6" component="p">
                  {address}
                </Typography>
              </Grid>
            </Grid>
            {phoneNumber && (
              <Grid
                container
                alignItems="center"
                className={classes.informationSection}
              >
                <Grid item>
                  <Phone fontSize="small" />
                </Grid>
                <Grid item xs>
                  <Typography
                    variant="h6"
                    component={Link}
                    style={{ color: 'black' }}
                    to={`/restaurants/${restaurantId}/contact`}
                  >
                    {phoneNumber}
                  </Typography>
                </Grid>
              </Grid>
            )}
            {restaurant.openingTimes.map(({ day, openings }, index: any) => (
              <>
                <Divider style={{ marginBottom: theme.spacing(1) }} />
                <div className={classes.openTimeSection}>
                  <div className={clsx(classes.opentTimeDay, 'translate')}>
                    {day.toUpperCase()} :
                  </div>
                  <div>
                    {openings.map(({ begin, end }, index: any) => (
                      <Typography
                        key={index}
                        variant="body2"
                        className={clsx(classes.openTime, 'notranslate')}
                      >
                        {`${(begin.hour < 10 ? '0' : '') + begin.hour}:${(begin.minute < 10 ? '0' : '') + begin.minute
                          } - ${(end.hour < 10 ? '0' : '') + end.hour}:${(end.minute < 10 ? '0' : '') + end.minute
                          }`}
                      </Typography>
                    ))}
                  </div>
                </div>
              </>
            ))}
          </Container>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenItineraireDialog(true)}
            color="primary"
            startIcon={<LocationOnIcon />}
            variant="contained"
            className="translate"
          >
            Trouver des itinéraires
          </Button>
          <Button onClick={() => setOpenDetails(false)}>OK</Button>
        </DialogActions>
      </Dialog>
      {/* -------------- */}
      <ItineraireDialog open={openItineraireDialog} setOpenItineraireDialog={setOpenItineraireDialog} itineraireExterne={externalGoogleMapLink} getDirection={getDirection} />
    </>
  );
};

const mapStateToProps: MapStateToProps<
  RestaurantHeaderStateProps,
  RestaurantHeaderOwnProps,
  RootState
> = ({ auth: { user, authenticated } }, { restaurant: { _id } }) => ({
  isFavorite: !!user && user.favoriteRestaurants.indexOf(_id) > 0,
  authenticated,
});

const mapDispatchToProps: (
  dispatch: ThunkDispatch<RootState, undefined, AuthActionTypes>,
  ownProps: RestaurantHeaderOwnProps
) => RestaurantHeaderDispatchProps = (dispatch, { restaurant: { _id } }) => ({
  addToFavorites: () => dispatch(addFavoriteRestaurant(_id)),
  removeFromFavorites: () => dispatch(removeFavoriteRestaurant(_id)),
});

const ConnectedRestaurantHeader = connect(
  mapStateToProps,
  mapDispatchToProps
)(RestaurantHeader);

export default ConnectedRestaurantHeader;
