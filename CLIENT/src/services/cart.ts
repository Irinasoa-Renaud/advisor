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

export const estimateMenuPricefixed_price: (menu: MenuInCart, addAmount?: boolean) => number = ({ foods, quantity, item }, addAmount) => {

  return quantity *
    foods.reduce<number>(
      (p, { food, options }) =>
        p + estimateOptionPrice(options),
      0
    );
}


export const estimateMenuPriceOption: (menu: any, addAmount?: boolean) => number = ({ foods, quantity, item, amount_price }, addAmount) => {

  const optionList: any[] = foods.map((item: any) => item.options
    .map((item: any) => item.items)
    .map((item: any) => item)
  )[0].map((item: any) => item
    .map((item: any) => item)
  )

  const optionFilter = [];

  for (let i = 0; i < optionList.length; i++) {

    if (optionList[i].length > 0) {

      for (let b = 0; b < optionList[i].length; b++) {

        if (optionList[i][b]) {
          optionFilter.push(optionList[i][b]);
        }

      }

    }

  }

  const additionalPrice = Object.keys(foods).reduce(function (previous, key) {
    return previous + foods[key as any].food.additionalPrice.amount;
  }, 0);

  const totalOption = optionFilter.length ? optionFilter.map((item: any) => item.item.price.amount).reduce((a: any, b: any) => a + b) : 0

  if (addAmount) {

    return item.price.amount + (quantity * ((additionalPrice + totalOption + amount_price) / 100))

  } else {

    return (quantity * ((additionalPrice + totalOption + amount_price) / 100))

  }

}

export const estimateTotalPrice: (cart: CartState) => number = (cart) => {
  let total = 0;

  cart.foods.forEach((food) => (total += estimateFoodPrice(food)));

  cart.menus.forEach((menu) => {
    if (menu.item.type === 'fixed_price') {
      total += estimateMenuPricefixed_price(menu, true)
    } else {
      total += estimateMenuPrice(menu)
    }
  });

  return total;
};
