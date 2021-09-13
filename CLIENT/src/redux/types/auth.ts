import User from '../../models/User.model';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';

export const REFRESH_PROFILE_REQUEST = 'REFRESH_PROFILE_REQUEST';
export const REFRESH_PROFILE_SUCCESS = 'REFRESH_PROFILE_SUCCESS';
export const REFRESH_PROFILE_FAILURE = 'REFRESH_PROFILE_FAILURE';

export const REFRESH_TOKEN_REQUEST = 'REFRESH_TOKEN_REQUEST';
export const REFRESH_TOKEN_SUCCESS = 'REFRESH_TOKEN_SUCCESS';
export const REFRESH_TOKEN_FAILURE = 'REFRESH_TOKEN_FAILURE';

export const ADD_FAVORITE_FOOD = 'ADD_FAVORITE_FOOD';
export const REMOVE_FAVORITE_FOOD = 'REMOVE_FAVORITE_FOOD';

export const ADD_FAVORITE_RESTAURANT = 'ADD_FAVORITE_RESTAURANT';
export const REMOVE_FAVORITE_RESTAURANT = 'REMOVE_FAVORITE_RESTAURANT';

export type AuthState = {
  authenticated: boolean;
  logingIn: boolean;
  logingOut: boolean;
  user: User | null;
  error: Error | null;
  accessToken?: string;
  refreshToken?: string;
  refreshingProfile: boolean;
};

interface LoginAction {
  type: typeof LOGIN_REQUEST;
}

interface LoginSuccessAction {
  type: typeof LOGIN_SUCCESS;
  payload: {
    user: User;
    accessToken: string;
    refreshToken: string;
    rememberMe?: boolean;
  };
}

interface LoginFailureAction {
  type: typeof LOGIN_FAILURE;
  payload: Error;
}

interface LogoutAction {
  type: typeof LOGOUT_REQUEST;
}

interface LogoutSuccessAction {
  type: typeof LOGOUT_SUCCESS;
}

interface LogoutFailureAction {
  type: typeof LOGOUT_FAILURE;
  payload: Error;
}

interface RefreshProfileAction {
  type: typeof REFRESH_PROFILE_REQUEST;
}

interface RefreshProfileSuccessAction {
  type: typeof REFRESH_PROFILE_SUCCESS;
  payload: User;
}

interface RefreshProfileFailureAction {
  type: typeof REFRESH_PROFILE_FAILURE;
  payload: Error;
}

interface RefreshTokenAction {
  type: typeof REFRESH_TOKEN_REQUEST;
}

interface RefreshTokenSuccessAction {
  type: typeof REFRESH_TOKEN_SUCCESS;
  payload: {
    accessToken: string;
    refreshToken: string;
  };
}

interface RefreshTokenFailureAction {
  type: typeof REFRESH_TOKEN_FAILURE;
  payload: Error;
}

interface AddFavoriteFoodAction {
  type: typeof ADD_FAVORITE_FOOD;
  payload: string;
}

interface RemoveFavoriteFoodAction {
  type: typeof REMOVE_FAVORITE_FOOD;
  payload: string;
}

interface AddFavoriteRestaurantAction {
  type: typeof ADD_FAVORITE_RESTAURANT;
  payload: string;
}

interface RemoveFavoriteRestaurantAction {
  type: typeof REMOVE_FAVORITE_RESTAURANT;
  payload: string;
}

export type AuthActionTypes =
  | LoginAction
  | LoginSuccessAction
  | LoginFailureAction
  | LogoutAction
  | LogoutSuccessAction
  | LogoutFailureAction
  | RefreshProfileAction
  | RefreshProfileSuccessAction
  | RefreshProfileFailureAction
  | RefreshTokenAction
  | RefreshTokenSuccessAction
  | RefreshTokenFailureAction
  | AddFavoriteFoodAction
  | RemoveFavoriteFoodAction
  | AddFavoriteRestaurantAction
  | RemoveFavoriteRestaurantAction;
