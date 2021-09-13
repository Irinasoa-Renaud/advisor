import Food from '../models/Food.model';

export const hasNoValidOption: (food: Food) => boolean = (food) => {
  return (
    food.options.every(({ maxOptions }) => !maxOptions) ||
    !food.options.reduce<number>((p, c) => p + c.items.length, 0)
  );
};
