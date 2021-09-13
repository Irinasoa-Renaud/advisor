import Accompaniment from '../../models/Accompaniment.model';
import Food from '../../models/Food.model';
import Menu from '../../models/Menu.model';
import Restaurant from '../../models/Restaurant.model';

export const ADD_FOOD = 'ADD_FOOD';
export const UPDATE_FOOD = 'UPDATE_FOOD';
export const REMOVE_FOOD = 'REMOVE_FOOD';

export const ADD_MENU = 'ADD_MENU';
export const UPDATE_MENU = 'UPDATE_MENU';
export const REMOVE_MENU = 'REMOVE_MENU';

export const RESET_CART = 'RESET_CART';

export type Option = {
  title: string;
  maxOptions: number;
  items: OptionItem[];
};

export type OptionItem = {
  item: Accompaniment;
  quantity: number;
};

export type MenuInCart = {
  id: string;
  quantity: number;
  item: Menu;
  foods: Array<{
    food: Food;
    options: Array<Option>;
  }>;
};

export type FoodInCart = {
  id: string;
  quantity: number;
  item: Food;
  options: Array<Option>;
  comment?: string;
};

export type CartState = {
  restaurant: Restaurant | null;
  totalCount: number;
  totalPrice: number;
  menus: Array<MenuInCart>;
  foods: Array<FoodInCart>;
  priceless: boolean;
  code?: number;
};

interface AddFoodAction {
  type: typeof ADD_FOOD;
  payload: FoodInCart;
}

interface UpdateFoodAction {
  type: typeof UPDATE_FOOD;
  payload: FoodInCart;
}

interface RemoveFoodAction {
  type: typeof REMOVE_FOOD;
  payload: string;
}

interface AddMenuAction {
  type: typeof ADD_MENU;
  payload: MenuInCart;
}

interface UpdateMenuAction {
  type: typeof UPDATE_MENU;
  payload: MenuInCart;
}

interface RemoveMenuAction {
  type: typeof REMOVE_MENU;
  payload: string;
}

interface ResetCartAction {
  type: typeof RESET_CART;
}

export type CartActionTypes =
  | AddFoodAction
  | UpdateFoodAction
  | RemoveFoodAction
  | AddMenuAction
  | UpdateMenuAction
  | RemoveMenuAction
  | ResetCartAction;
