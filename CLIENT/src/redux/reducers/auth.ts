import { Reducer } from 'redux';
import Api from '../../services/Api';
import {
  AuthState,
  AuthActionTypes,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
  REFRESH_PROFILE_REQUEST,
  REFRESH_PROFILE_SUCCESS,
  REFRESH_PROFILE_FAILURE,
  REFRESH_TOKEN_REQUEST,
  REFRESH_TOKEN_SUCCESS,
  REFRESH_TOKEN_FAILURE,
  ADD_FAVORITE_FOOD,
  ADD_FAVORITE_RESTAURANT,
  REMOVE_FAVORITE_FOOD,
  REMOVE_FAVORITE_RESTAURANT,
} from '../types/auth';

const tokensInLocalStorage =
    localStorage.getItem('tokens') &&
    JSON.parse(localStorage.getItem('tokens') as string),
  tokensInSessionStorage =
    sessionStorage.getItem('tokens') &&
    JSON.parse(sessionStorage.getItem('tokens') as string);

const DEFAULT_STATE: AuthState = {
  refreshingProfile: false,
  authenticated: false,
  logingIn: false,
  logingOut: false,
  user: null,
  error: null,
  accessToken:
    (tokensInLocalStorage && tokensInLocalStorage.accessToken) ||
    (tokensInSessionStorage && tokensInSessionStorage.accessToken),
  refreshToken:
    (tokensInLocalStorage && tokensInLocalStorage.refreshToken) ||
    (tokensInSessionStorage && tokensInSessionStorage.refreshToken),
};

Api.defaults.headers.authorization =
  (DEFAULT_STATE.accessToken && `Bearer ${DEFAULT_STATE.accessToken}`) ||
  undefined;

const authReducer: Reducer<AuthState, AuthActionTypes> = (
  state = DEFAULT_STATE,
  action
) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        logingIn: true,
      };

    case LOGIN_SUCCESS:
      if (action.payload.rememberMe) {
        localStorage.setItem(
          'tokens',
          JSON.stringify({
            accessToken: action.payload.accessToken,
            refreshToken: action.payload.refreshToken,
          })
        );
      } else {
        sessionStorage.setItem(
          'tokens',
          JSON.stringify({
            accessToken: action.payload.accessToken,
            refreshToken: action.payload.refreshToken,
          })
        );
      }

      if (typeof Api.defaults.headers !== 'object') Api.defaults.headers = {};

      Api.defaults.headers.authorization = `Bearer ${action.payload.accessToken}`;

      return {
        ...state,
        authenticated: true,
        user: action.payload.user,
        logingIn: false,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };

    case LOGIN_FAILURE:
      return {
        ...state,
        authenticated: false,
        user: null,
        error: action.payload,
        logingIn: false,
      };

    case LOGOUT_REQUEST:
      return { ...state, logingOut: true };

    case LOGOUT_SUCCESS:
      if (typeof Api.defaults.headers === 'object')
        Api.defaults.headers.authorization = undefined;

      return {
        ...state,
        user: null,
        refreshToken: undefined,
        accessToken: undefined,
        authenticated: false,
      };

    case LOGOUT_FAILURE:
      return {
        ...state,
        logingOut: false,
        error: action.payload,
      };

    case REFRESH_PROFILE_REQUEST:
      return {
        ...state,
        refreshingProfile: true,
      };

    case REFRESH_PROFILE_SUCCESS:
      return {
        ...state,
        authenticated: true,
        user: action.payload,
        refreshingProfile: false,
      };

    case REFRESH_PROFILE_FAILURE:
      return {
        ...state,
        authenticated: false,
        accessToken: undefined,
        refreshToken: undefined,
        user: null,
        refreshingProfile: false,
      };

    case REFRESH_TOKEN_REQUEST:
      return {
        ...state,
      };

    case REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };

    case REFRESH_TOKEN_FAILURE:
      localStorage.removeItem('tokens');
      sessionStorage.removeItem('tokens');

      return {
        ...state,
      };

    case ADD_FAVORITE_FOOD:
      return {
        ...state,
        user: state.user
          ? {
              ...state.user,
              favoriteFoods: [
                ...(state.user?.favoriteFoods || []),
                action.payload,
              ],
            }
          : null,
      };

    case REMOVE_FAVORITE_FOOD:
      return {
        ...state,
        user: state.user
          ? {
              ...state.user,
              favoriteFoods:
                state.user?.favoriteFoods.filter(
                  (value) => value !== action.payload
                ) || [],
            }
          : null,
      };

    case ADD_FAVORITE_RESTAURANT:
      return {
        ...state,
        user: state.user
          ? {
              ...state.user,
              favoriteRestaurants: [
                ...(state.user?.favoriteRestaurants || []),
                action.payload,
              ],
            }
          : null,
      };

    case REMOVE_FAVORITE_RESTAURANT:
      return {
        ...state,
        user: state.user
          ? {
              ...state.user,
              favoriteRestaurants:
                state.user?.favoriteRestaurants.filter(
                  (value) => value !== action.payload
                ) || [],
            }
          : null,
      };

    default:
      return state;
  }
};

export default authReducer;
