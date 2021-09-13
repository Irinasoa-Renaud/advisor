import { combineReducers } from 'redux';
import authReducer from './auth';
import cartReducer from './cart';
import settingReducer from './setting';

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  setting: settingReducer,
});

export default rootReducer;
