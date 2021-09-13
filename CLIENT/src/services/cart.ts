import { CartState, FoodInCart, MenuInCart, Option } from '../redux/types/cart';

const estimateOptionPrice: (options: Option[]) => number = (options) =>
  options.reduce<number>(
    (p, { items }) =>
      p +
      items.reduce<number>(
        (p, { quantity, item: { price } }) =>
          p + quantity * (price?.amount || 0),
        0
      ),
    0
  );

export const estimateFoodPrice: (food: FoodInCart) => number = ({
  item,
  quantity,
  options,
}) => ((item.price.amount || 0) + estimateOptionPrice(options)) * quantity;

export const estimateMenuPrice: (menu: MenuInCart, addAmount?: boolean) => number = ({ foods, quantity, item }, addAmount) => {
  if (addAmount) {
    return item.price.amount + quantity *
    foods.reduce<number>(
      (p, { food, options }) =>
        p + (food.price.amount || 0) + estimateOptionPrice(options),
      0
    );
  } else {
    return quantity *
    foods.reduce<number>(
      (p, { food, options }) =>
        p + (food.price.amount || 0) + estimateOptionPrice(options),
      0
    );
  }
}

export const estimateTotalPrice: (cart: CartState) => number = (cart) => {
  let total = 0;

  cart.foods.forEach((food) => (total += estimateFoodPrice(food)));

  cart.menus.forEach((menu) => {
    if (menu.item.type === 'fixed_price') {
      total += estimateMenuPrice(menu, true)
    } else {
      total += estimateMenuPrice(menu)
    }
  });

  return total;
};
