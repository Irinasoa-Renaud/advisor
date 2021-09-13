export const CHANGE_LANG = 'CHANGE_LANG';
export const CHANGE_SHOW_PRICE = 'CHANGE_SHOW_PRICE';
export const CHANGE_PRICE_TYPE = 'CHANGE_PRICE_TYPE';

export type Lang =
  | 'fr'
  | 'en'
  | 'ja'
  | 'zh-CN'
  | 'it'
  | 'es'
  | 'ru'
  | 'ko'
  | 'nl'
  | 'de'
  | 'pt'
  | 'hi'
  | 'ar';

export type SettingState = {
  lang: Lang;
  showPrice: boolean;
  price: string;
};

interface ChangeLangAction {
  type: typeof CHANGE_LANG;
  payload: Lang;
}

interface ChangeShowPriceAction {
  type: typeof CHANGE_SHOW_PRICE;
  payload: boolean;
}

interface ChangePriceAction {
  type: typeof CHANGE_PRICE_TYPE;
  payload: string;
}

export type SettingActionTypes = ChangeLangAction | ChangeShowPriceAction | ChangePriceAction;
