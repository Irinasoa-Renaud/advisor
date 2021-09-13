import { Reducer } from 'redux';
import { estimateTotalPrice } from '../../services/cart';
import {
  ADD_FOOD,
  ADD_MENU,
  CartActionTypes,
  CartState,
  REMOVE_FOOD,
  REMOVE_MENU,
  RESET_CART,
  UPDATE_FOOD,
  UPDATE_MENU,
} from '../types/cart';

const DEFAULT_STATE: CartState = (sessionStorage.getItem('cart') &&
  (JSON.parse(sessionStorage.getItem('cart') as string) as CartState)) || {
  restaurant: null,
  totalCount: 0,
  totalPrice: 0,
  foods: [],
  menus: [],
  priceless: false,
};

const cartReducer: Reducer<CartState, CartActionTypes> = (
  state = DEFAULT_STATE,
  action
) => {
  const { menus, foods } = state;

  let newState: CartState;

  switch (action.type) {
    case ADD_FOOD:
      newState = {
        ...state,
        foods: [...state.foods, action.payload],
        totalCount: state.totalCount + 1,
        restaurant: action.payload.item.restaurant || null,
      };

      newState.totalPrice = estimateTotalPrice(newState);

      if (!action.payload.item.price.amount) newState.priceless = true;
      else newState.priceless = false;

      sessionStorage.setItem('cart', JSON.stringify(newState));

      return newState;

    case UPDATE_FOOD:
      const foodIndex = foods.indexOf(
        foods.filter(
          ({ item: { _id: id } }) => id === action.payload.item._id
        )[0]
      );

      newState = {
        ...state,
        foods: [
          ...foods.slice(0, foodIndex),
          action.payload,
          ...foods.slice(foodIndex + 1),
        ],
      };

      newState.totalPrice = estimateTotalPrice(newState);

      sessionStorage.setItem('cart', JSON.stringify(newState));

      return newState;

    case REMOVE_FOOD:
      newState = {
        ...state,
        foods: state.foods.filter(({ id }) => id !== action.payload),
        totalCount: state.totalCount - 1,
      };

      newState.totalPrice = estimateTotalPrice(newState);

      if (!newState.foods.length) newState.priceless = false;

      if (!newState.totalCount) newState.restaurant = null;
      
      sessionStorage.setItem('cart', JSON.stringify(newState));

      return newState;

    case ADD_MENU:
      newState = {
        ...state,
        menus: [...menus, action.payload],
        totalCount: state.totalCount + 1,
        restaurant: action.payload.item.restaurant || null,
      };

      newState.totalPrice = estimateTotalPrice(newState);

      sessionStorage.setItem('cart', JSON.stringify(newState));

      return newState;

    case UPDATE_MENU:
      const menuIndex = menus.indexOf(
        menus.filter(({ id }) => id === action.payload.item._id)[0]
      );

      newState = {
        ...state,
        menus: [
          ...menus.slice(0, menuIndex),
          action.payload,
          ...menus.slice(menuIndex + 1),
        ],
      };

      newState.totalPrice = estimateTotalPrice(newState);

      sessionStorage.setItem('cart', JSON.stringify(newState));

      return newState;

    case REMOVE_MENU:
      newState = {
        ...state,
        menus: state.menus.filter(({ id }) => id !== action.payload),
        totalCount: state.totalCount - 1,
      };

      newState.totalPrice = estimateTotalPrice(newState);
      
      if (!newState.totalCount) newState.restaurant = null;

      sessionStorage.setItem('cart', JSON.stringify(newState));

      return newState;

    case RESET_CART:
      newState = {
        restaurant: null,
        totalCount: 0,
        totalPrice: 0,
        menus: [],
        foods: [],
        priceless: false,
      };

      sessionStorage.setItem('cart', JSON.stringify(newState));

      return newState;

    default:
      return state;
  }
};

export default cartReducer;
