import Restaurant from '../models/Restaurant.model';

export const isRestaurantOpen: (restaurant: Restaurant) => boolean = (
  restaurant
) => {
  return true;
};
