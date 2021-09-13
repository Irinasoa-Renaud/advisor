import {
  ADD_FOOD,
  ADD_MENU,
  CartActionTypes,
  FoodInCart,
  MenuInCart,
  REMOVE_FOOD,
  REMOVE_MENU,
  RESET_CART,
  UPDATE_FOOD,
  UPDATE_MENU,
} from '../types/cart';

export const addFoodToCart: (
  param: FoodInCart
) => CartActionTypes = ({ id, item, quantity, options = [] }) => ({
  type: ADD_FOOD,
  payload: {
    id,
    item,
    quantity,
    options,
  },
});

export const updateFoodInCart: (
  param: FoodInCart
) => CartActionTypes = ({ id, item, quantity, options = [] }) => ({
  type: UPDATE_FOOD,
  payload: {
    id,
    item,
    quantity,
    options,
  },
});

export const removeFoodFromCart: (id: string) => CartActionTypes = (
  id
) => ({
  type: REMOVE_FOOD,
  payload: id,
});

export const addMenuToCart: (param: MenuInCart) => CartActionTypes = ({ id, item, quantity, foods }) => ({
  type: ADD_MENU,
  payload: {
    id,
    item,
    quantity,
    foods,
  },
});

export const updateMenuInCart: (param: MenuInCart) => CartActionTypes = ({ id, item, quantity, foods = [] }) => ({
  type: UPDATE_MENU,
  payload: {
    id,
    item,
    quantity,
    foods,
  },
});

export const removeMenuFromCart: (id: string) => CartActionTypes = (
  id
) => ({
  type: REMOVE_MENU,
  payload: id,
});

export const resetCart: () => CartActionTypes = () => ({
  type: RESET_CART,
});
