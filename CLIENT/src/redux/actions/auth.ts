import { ThunkAction } from 'redux-thunk';
import User from '../../models/User.model';
import Api from '../../services/Api';
import RootState, { RootActionTypes } from '../types';
import {
  AuthActionTypes,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  REFRESH_PROFILE_REQUEST,
  REFRESH_PROFILE_SUCCESS,
  REFRESH_PROFILE_FAILURE,
  ADD_FAVORITE_FOOD,
  REMOVE_FAVORITE_FOOD,
  ADD_FAVORITE_RESTAURANT,
  REMOVE_FAVORITE_RESTAURANT,
  REFRESH_TOKEN_REQUEST,
  REFRESH_TOKEN_SUCCESS,
  REFRESH_TOKEN_FAILURE,
} from '../types/auth';
import { RESET_CART } from '../types/cart';

export const signinWithPhoneNumberAndPassword: (
  phoneNumber: string,
  password: string,
  rememberMe?: boolean
) => ThunkAction<Promise<User>, RootState, undefined, AuthActionTypes> = (
  phoneNumber,
  password,
  rememberMe
) => async (dispatch) => {
  dispatch(loginRequest());

  try {
    const { data, status } = await Api.post('/login', {
      phoneNumber,
      password,
    });

    if (status === 200) {
      const {
        user,
        access_token: accessToken,
        refresh_token: refreshToken,
      } = data as { access_token: string; refresh_token: string; user: User };

      dispatch(loginSuccess(user, accessToken, refreshToken, rememberMe));
      return user;
    }

    dispatch(loginFailure(data));
    return Promise.reject(data);
  } catch (error) {
    dispatch(loginFailure(error));
    return Promise.reject(error);
  }
};

export const logout: () => ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  AuthActionTypes
> = () => async (dispatch) => {
  dispatch(logoutRequest());
  try {
    localStorage.removeItem('tokens');
    dispatch(logoutSuccess());
  } catch (error) {
    dispatch(logoutFailure(error));
    return Promise.reject(error);
  }
};

const loginRequest: () => AuthActionTypes = () => ({
  type: LOGIN_REQUEST,
});

const loginSuccess: (
  user: User,
  accessToken: string,
  refreshToken: string,
  rememberMe?: boolean
) => AuthActionTypes = (user, accessToken, refreshToken, rememberMe) => ({
  type: LOGIN_SUCCESS,
  payload: {
    user,
    accessToken,
    refreshToken,
    rememberMe,
  },
});

const loginFailure: (error: Error) => AuthActionTypes = (error) => ({
  type: LOGIN_FAILURE,
  payload: error,
});

const logoutRequest: () => AuthActionTypes = () => ({
  type: LOGOUT_REQUEST,
});

const logoutSuccess: () => AuthActionTypes = () => ({
  type: LOGOUT_SUCCESS,
});

const logoutFailure: (
  error: Error
) => ThunkAction<Promise<void>, RootState, undefined, RootActionTypes> = (
  error
) => (dispatch) =>
  new Promise((resolve, reject) => {
    dispatch({
      type: RESET_CART,
    });
    dispatch({ type: LOGOUT_FAILURE, payload: error });
  });

export const refreshProfile: () => ThunkAction<
  Promise<User>,
  RootState,
  undefined,
  AuthActionTypes
> = () => async (dispatch) => {
  try {
    dispatch(refreshProfileRequest());

    await dispatch(refreshTokens());

    const { data: user } = await Api.get<User>('/users/me');
    dispatch(refreshProfileSuccess(user));
    return user;
  } catch (error) {
    dispatch(refreshProfileFailure(error));
    return Promise.reject(error);
  }
};

const refreshProfileRequest: () => AuthActionTypes = () => ({
  type: REFRESH_PROFILE_REQUEST,
});

const refreshProfileSuccess: (user: User) => AuthActionTypes = (user) => ({
  type: REFRESH_PROFILE_SUCCESS,
  payload: user,
});

const refreshProfileFailure: (error: Error) => AuthActionTypes = (error) => ({
  type: REFRESH_PROFILE_FAILURE,
  payload: error,
});

export const refreshTokens: () => ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  AuthActionTypes
> = () => async (dispatch, getState) => {
  const {
    auth: { accessToken, refreshToken },
  } = getState();

  dispatch(refreshTokenRequest);

  if (!accessToken || !refreshToken)
    return Promise.reject({ message: 'No tokens in storage' });

  try {
    const { data } = await Api.get<
      | { validity: 'valid' }
      | { validity: 'invalid'; message: string }
      | { validity: 'expired'; access_token: string; refresh_token: string }
    >(`/check-token?access_token=${accessToken}&refresh_token=${refreshToken}`);

    if (data.validity === 'expired') {
      dispatch(
        refreshTokenSuccess({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        })
      );
    }
  } catch (error) {
    dispatch(refreshTokenFailure(error));
    return Promise.reject(error);
  }
};

const refreshTokenRequest: () => AuthActionTypes = () => ({
  type: REFRESH_TOKEN_REQUEST,
});

const refreshTokenSuccess: (tokens: {
  accessToken: string;
  refreshToken: string;
}) => AuthActionTypes = ({ accessToken, refreshToken }) => ({
  type: REFRESH_TOKEN_SUCCESS,
  payload: {
    accessToken,
    refreshToken,
  },
});

const refreshTokenFailure: (error: Error) => AuthActionTypes = (error) => ({
  type: REFRESH_TOKEN_FAILURE,
  payload: error,
});

export const addFavoriteFood: (
  id: string
) => ThunkAction<Promise<void>, RootState, undefined, AuthActionTypes> = (
  id
) => async (dispatch) => {
  try {
    await Api.post('/users/favoriteFoods', { id });
    dispatch(addFavoriteFoodAction(id));
  } catch (error) {
    return Promise.reject(error);
  }
};

const addFavoriteFoodAction: (id: string) => AuthActionTypes = (id) => ({
  type: ADD_FAVORITE_FOOD,
  payload: id,
});

export const removeFavoriteFood: (
  id: string
) => ThunkAction<Promise<void>, RootState, undefined, AuthActionTypes> = (
  id
) => async (dispatch) => {
  try {
    await Api.delete(`/users/favoriteFoods/${id}`);
    dispatch(removeFavoriteFoodAction(id));
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeFavoriteFoodAction: (id: string) => AuthActionTypes = (id) => ({
  type: REMOVE_FAVORITE_FOOD,
  payload: id,
});

export const addFavoriteRestaurant: (
  id: string
) => ThunkAction<Promise<void>, RootState, undefined, AuthActionTypes> = (
  id
) => async (dispatch) => {
  try {
    await Api.post('/users/favoriteRestaurants', { id });
    dispatch(addFavoriteRestaurantAction(id));
  } catch (error) {
    return Promise.reject(error);
  }
};

const addFavoriteRestaurantAction: (id: string) => AuthActionTypes = (id) => ({
  type: ADD_FAVORITE_RESTAURANT,
  payload: id,
});

export const removeFavoriteRestaurant: (
  id: string
) => ThunkAction<Promise<void>, RootState, undefined, AuthActionTypes> = (
  id
) => async (dispatch) => {
  try {
    await Api.delete(`/users/favoriteRestaurants/${id}`);
    dispatch(removeFavoriteRestaurantAction(id));
  } catch (error) {
    return Promise.reject(error);
  }
};

const removeFavoriteRestaurantAction: (id: string) => AuthActionTypes = (
  id
) => ({
  type: REMOVE_FAVORITE_RESTAURANT,
  payload: id,
});
