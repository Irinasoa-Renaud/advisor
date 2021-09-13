import React, { useEffect, useState } from 'react';
import './App.css';
import { hot } from 'react-hot-loader';
import HomePage from './views/pages/Home';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import theme from './theme';
import RestaurantPage from './views/pages/Restaurant';
// import FAQs from './views/pages/FAQs';
import { Redirect } from 'react-router-dom';
import LoginPage from './views/pages/Login';
import RegisterPage from './views/pages/Register';
import ForgotPasswordPage from './views/pages/ForgotPassword';
import ProfilePage from './views/pages/Profile';
import Search from './views/pages/Search';
import Checkout from './views/pages/Checkout';
import ConfirmRegister from './views/pages/ConfirmRegister';
import PageNotFound from './views/pages/PageNotFound';
import CommentPage from './views/pages/CommentPage';
import OrdersPage from './views/pages/Orders';
import { connect, MapStateToProps } from 'react-redux';
import RootState from './redux/types';
import { ThunkDispatch } from 'redux-thunk';
import { AuthActionTypes } from './redux/types/auth';
import { refreshProfile } from './redux/actions/auth';
import User from './models/User.model';
import HelmetMetaData from './components/HelmetMetaData';
import { useSnackbar } from 'notistack';
import FavoritesPage from './views/pages/Favorites';
import { ConnectedPrivateRoute as PrivateRoute } from './components/auth';
import Loading from './components/Loading';
import OrderSummary, { OrderSummaryProps } from './views/pages/OrderSummary';
import OrderDetailsPage from './views/pages/OrderDetails';
import ChangePasswordPage from './views/pages/ChangePassword';
import { AnimatedRoutes, RouteTransition } from './animations/routes';
import RestaurantRoutePage from './views/pages/RestaurantRoute';
import RestaurantListPage from './views/pages/RestaurantListPage';
import RestoRecoListPage from './views/pages/RestoRecommanderListPage'
import PlatRecoListPage from './views/pages/PlatRecommanderListPage'
interface AppStateProps {
  accessToken?: string;
  refreshToken?: string;
}

interface AppDispatchProps {
  refreshProfile: () => Promise<User>;
}

interface AppOwnProps {}

type AppProps = AppStateProps & AppDispatchProps & AppOwnProps;

const App: React.FC<AppProps> = ({
  refreshProfile,
  accessToken,
  refreshToken,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (accessToken && refreshToken)
      refreshProfile()
        .catch((error) => {
          enqueueSnackbar('Session expirée. Veuillez vous reconnecter svp', {
            variant: 'info',
          });
        })
        .finally(() => {
          setInitialized(true);
        });
    else if (!initialized) {
      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshProfile, refreshToken]);

  return (
    <>
      <CssBaseline />
      <HelmetMetaData />
      <ThemeProvider theme={theme}>
        <Loading open={!initialized} />

        {initialized && (
          <AnimatedRoutes>
            <RouteTransition
              exact
              path="/"
              render={() => <Redirect to="/home" />}
            />
            <RouteTransition exact path="/home" component={HomePage} />
            <RouteTransition exact path="/login" component={LoginPage} />
            <RouteTransition exact path="/register" component={RegisterPage} />
            <RouteTransition
              exact
              path="/confirm-register"
              component={ConfirmRegister}
            />
            <RouteTransition
              exact
              path="/forgotPassword"
              component={ForgotPasswordPage}
            />
            <RouteTransition
              exact
              path="/change-password"
              component={ChangePasswordPage}
            />
            <RouteTransition
              exact
              path="/restaurants"
              component={RestaurantListPage}
            />
            <RouteTransition
              exact
              path="/restaurants/:id"
              render={({
                match: {
                  params: { id },
                },
              }) => <RestaurantPage id={id || ''} />}
            />
            <RouteTransition
              exact
              path="/restaurants/:id/route"
              render={({
                match: {
                  params: { id },
                },
              }) => <RestaurantRoutePage id={id || ''} />}
            />
            <RouteTransition
              exact
              path="/restaurants/:id/contact"
              render={({
                match: {
                  params: { id },
                },
              }) => <CommentPage restaurantId={id} />}
            />
            <RouteTransition
              exact
              path="/restaurant recommander"
              component={RestoRecoListPage}
            />
             <RouteTransition
              exact
              path="/plat recommander"
              component={PlatRecoListPage}
            />
            {/* <RouteTransition exact path="/FAQs" component={FAQs} /> */}
            <PrivateRoute exact path="/profile" component={ProfilePage} />
            <RouteTransition exact path="/search" component={Search} />
            <RouteTransition exact path="/checkout" component={Checkout} />
            <RouteTransition
              exact
              path="/order-summary"
              render={({ location: { state } }) => (
                <OrderSummary {...(state as OrderSummaryProps)} />
              )}
            />
            <PrivateRoute
              exact
              path="/orders/:id"
              render={({
                match: {
                  params: { id },
                },
              }) => <OrderDetailsPage id={id || ''} />}
            />
            <RouteTransition exact path="/comment" component={CommentPage} />
            <PrivateRoute exact path="/orders" component={OrdersPage} />
            <PrivateRoute exact path="/favorites" component={FavoritesPage} />
            <RouteTransition path="**" component={PageNotFound} />
          </AnimatedRoutes>
        )}
      </ThemeProvider>
    </>
  );
};

const mapStateToProps: MapStateToProps<AppStateProps, {}, RootState> = ({
  auth: { accessToken, refreshToken },
}) => ({
  accessToken,
  refreshToken,
});

const mapDispatchToProps: (
  dispatch: ThunkDispatch<RootState, undefined, AuthActionTypes>,
  ownProps: AppOwnProps
) => AppDispatchProps = (dispatch) => ({
  refreshProfile: () => dispatch(refreshProfile()),
});

const ConnectedApp = connect(mapStateToProps, mapDispatchToProps)(App);

export default hot(module)(ConnectedApp);
