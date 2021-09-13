import { ThunkAction } from 'redux-thunk';
import RootState from '../types';
import {
  CHANGE_LANG,
  CHANGE_SHOW_PRICE,
  Lang,
  CHANGE_PRICE_TYPE,
  SettingActionTypes,
} from '../types/setting';

export const changeLanguage: (
  lang: Lang
) => ThunkAction<Promise<void>, RootState, undefined, SettingActionTypes> = (
  lang
) => (dispatch) =>
  new Promise((resolve, reject) => {
    try {
      localStorage.setItem('lang', lang);
      dispatch(changeLanguageRequest(lang));
      resolve();
    } catch (error) {
      reject(error);
    }
  });

export const changePriceType: (
  price: string
) => ThunkAction<Promise<void>, RootState, undefined, SettingActionTypes> = (
  price
) => (dispatch) =>
  new Promise((resolve, reject) => {
    try {
      dispatch(changePriceTypeRequest(price));
      resolve();
    } catch (error) {
      reject(error);
    }
  });

export const changeLanguageRequest: (lang: Lang) => SettingActionTypes = (
  lang
) => ({
  type: CHANGE_LANG,
  payload: lang,
});

export const changeShowPrice: (value: boolean) => SettingActionTypes = (
  value,
) => ({
  type: CHANGE_SHOW_PRICE,
  payload: value,
});

export const changePriceTypeRequest: (price: string) => SettingActionTypes = (
  price
) => ({
  type: CHANGE_PRICE_TYPE,
  payload: price,
});
