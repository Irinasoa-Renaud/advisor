import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, MapStateToProps } from 'react-redux';
import Navbar from '../../components/layouts/Navbar';
import Map from '../../components/restaurant/Map';
import Restaurant from '../../models/Restaurant.model';
import RootState from '../../redux/types';
import { Lang } from '../../redux/types/setting';
import { getRestaurantWithId } from '../../services/restaurant';
import { Marker } from 'react-google-maps';
import DirectionsRenderer from 'react-google-maps/lib/components/DirectionsRenderer';
import Loading from '../../components/Loading';
import { Fab, makeStyles, Tooltip } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import { NearMe as NearMeIcon } from '@material-ui/icons';
import { getGeoLocation } from '../../services/location';

const useStyles = makeStyles((theme) => ({
  mapContainer: {
    width: '100%',
    height: `calc(100vh - ${theme.mixins.toolbar.height}px)`,
  },
  markerLabel: {
    backgroundColor: 'rgba(255, 255, 255, .4)',
    padding: theme.spacing(1),
    borderRadius: 6,
  },
  getDirButton: {
    position: 'absolute',
    left: theme.spacing(4),
    bottom: theme.spacing(4),
  },
}));

interface RestaurantRoutePageStateProps {
  lang: Lang;
}

interface RestaurantRoutePageOwnProps {
  id: string;
}

type RestaurantRoutePageProps = RestaurantRoutePageStateProps &
  RestaurantRoutePageOwnProps;

const RestaurantRoutePage: React.FC<RestaurantRoutePageProps> = ({
  id,
  lang,
}) => {
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant>();

  const [directions, setDirections] = useState<google.maps.DirectionsResult>();

  const [lng, setLng] = useState<number>();
  const [lat, setLat] = useState<number>();

  const getDirection = useCallback(() => {
    if (lat !== undefined && lng !== undefined && google.maps) {
      const directionsService = new google.maps.DirectionsService();

      const origin = { lat, lng };
      const destination = {
        lat: restaurant?.location.coordinates[1] || 0,
        lng: restaurant?.location.coordinates[0] || 0,
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
  }, [enqueueSnackbar, lat, lng, restaurant]);

  useEffect(() => {
    if (restaurant) setTimeout(getDirection);
  }, [getDirection, restaurant]);

  useEffect(() => {
    setLoading(true);

    getRestaurantWithId(id, lang).then((restaurant) => {
      setRestaurant(restaurant);
      setLoading(false);
    });
  }, [id, lang]);

  useEffect(() => {
    getGeoLocation()
      .then((p) => {
        setLng(p.coords.longitude);
        setLat(p.coords.latitude);
      })
      .catch(() => {
        enqueueSnackbar('Erreur lors de la géolocalisation');
      });
  }, [enqueueSnackbar]);

  return (
    <>
      <Navbar hideSearchField hideCart />

      {restaurant && (
        <div className={classes.mapContainer}>
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
      )}

      <Tooltip title={<span className="translate">Itinéraire</span>}>
        <Fab
          onClick={() => {
            getDirection();
          }}
          aria-label={'Get direction'}
          className={classes.getDirButton}
          color="primary"
        >
          <NearMeIcon />
        </Fab>
      </Tooltip>

      {<Loading open={loading} />}
    </>
  );
};

const mapStateToProps: MapStateToProps<
  RestaurantRoutePageStateProps,
  RestaurantRoutePageOwnProps,
  RootState
> = ({ setting: { lang } }) => ({
  lang,
});

const ConnectedRestaurantRoutePage = connect<
  RestaurantRoutePageStateProps,
  {},
  RestaurantRoutePageOwnProps,
  RootState
>(mapStateToProps)(RestaurantRoutePage);

export default ConnectedRestaurantRoutePage;
