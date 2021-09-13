import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { Redirect, RouteProps } from 'react-router-dom';
import { RouteTransition } from '../animations/routes';
import RootState from '../redux/types';

interface RouteStateProps {
  authenticated: boolean;
}

interface RouteOwnProps extends RouteProps {}

type CustomRouteProps = RouteStateProps & RouteOwnProps;

const PublicRoute: React.FC<CustomRouteProps> = ({
  authenticated,
  ...routeProps
}) => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!authenticated)
      enqueueSnackbar(
        'Vous ne pouvez pas accéder à cette section en étant connecté'
      );
  }, [authenticated, enqueueSnackbar]);

  return authenticated ? (
    <Redirect to="/" />
  ) : (
    <RouteTransition {...routeProps} />
  );
};

const PrivateRoute: React.FC<CustomRouteProps> = ({
  authenticated,
  ...routeProps
}) => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!authenticated)
      enqueueSnackbar('Vous devez vous connecter pour accéder à cette section');
  }, [authenticated, enqueueSnackbar]);

  return !authenticated ? (
    <Redirect to={`/login?redirect=${routeProps.path}`} />
  ) : (
    <RouteTransition {...routeProps} />
  );
};

const mapStateToProps: MapStateToProps<
  RouteStateProps,
  RouteOwnProps,
  RootState
> = ({ auth: { authenticated } }) => ({
  authenticated,
});

export const ConnectedPublicRoute = connect<
  RouteStateProps,
  {},
  RouteOwnProps,
  RootState
>(mapStateToProps)(PublicRoute);

export const ConnectedPrivateRoute = connect<
  RouteStateProps,
  {},
  RouteOwnProps,
  RootState
>(mapStateToProps)(PrivateRoute);
