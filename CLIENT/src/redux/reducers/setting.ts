import { Reducer } from 'redux';
import {
  CHANGE_LANG,
  CHANGE_PRICE_TYPE,
  Lang,
  SettingActionTypes,
  SettingState,
} from '../types/setting';

const DEFAULT_STATE: SettingState = {
  lang: (localStorage.getItem('lang') as Lang) || 'fr',
  showPrice: true,
  price: '',
};

if (DEFAULT_STATE.lang !== 'fr')
  window.doGTranslate(`fr|${DEFAULT_STATE.lang}`);

const settingReducer: Reducer<SettingState, SettingActionTypes> = (
  state = DEFAULT_STATE,
  action
) => {
  switch (action.type) {
    case CHANGE_LANG:
      window.doGTranslate(`fr|${action.payload}`);

      return {
        ...state,
        lang: action.payload,
      };
    case CHANGE_PRICE_TYPE:
      return {
        ...state,
        price: action.payload,
      };
    default:
      return state;
  }
};

export default settingReducer;
