import { AuthActionTypes, AuthState } from './auth';
import { CartActionTypes, CartState } from './cart';
import { SettingActionTypes, SettingState } from './setting';

type RootState = {
  auth: AuthState;
  cart: CartState;
  setting: SettingState;
};

export type RootActionTypes =
  | AuthActionTypes
  | CartActionTypes
  | SettingActionTypes;

export default RootState;
