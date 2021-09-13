import Axios from 'axios';
import Food from '../models/Food.model';
import FoodCategorie from '../models/FoodCategory.model';
import querystring from 'querystring';
import { Lang } from '../redux/types/setting';
import Restaurant from '../models/Restaurant.model';

type Result = Food & {
  restaurant_object?: Restaurant;
};

export const getFoods: (params: {
  limit?: number;
  offset?: number;
  lang?: Lang;
  searchCategory?: 'popular' | 'with_price' | 'onsite' | 'without_price';
}) => Promise<Food[]> = async (params = { lang: 'fr' }) => {
  try {
    let query = '';
    if (Object.keys(params).length) query = `?${querystring.stringify(params)}`;

    const res = await Axios(`${process.env.REACT_APP_API_URL}/foods${query}`, {
      method: 'GET',
    });

    if (res.status === 200) {
      return (res.data as Result[])
        .map((food) => ({
          ...food,
          restaurant: food.restaurant_object || food.restaurant,
        }))
        .filter(
          ({ restaurant }) =>
            restaurant && restaurant.referencement && restaurant.status
        );
    } else {
      const error = {
        status: res.status,
        message: 'Error',
      };
      return Promise.reject(error);
    }
  } catch (e) {
    return Promise.reject(e);
  }
};

export const searchFoods: (params: {
  lang?: string;
  query: string;
  restaurant?: string;
  filter?: { [key: string]: any };
}) => Promise<{ type: 'food'; content: Food }[]> = async ({
  lang = 'fr',
  query,
  restaurant,
  filter = {},
}) => {
    try {
      if (restaurant) filter.restaurant = restaurant;

      const res = await Axios(
        `${process.env.REACT_APP_API_URL
        }/search?lang=${lang}&type=food&q=${query}&filter=${JSON.stringify(
          filter
        )}`,
        {
          method: 'GET',
        }
      );
      if (res.status === 200) {
        return (res.data as { type: 'food'; content: Food }[]).filter(
          ({ content: { restaurant } }) =>
            restaurant && restaurant.status && restaurant.referencement
        );
      } else {
        const error = {
          status: res.status,
          message: 'Error',
        };
        return Promise.reject(error);
      }
    } catch (e) {
      return Promise.reject(e);
    }
  };

export const getFoodWithId: (id: string, lang: Lang) => Promise<Food> = async (
  id,
  lang
) => {
  try {
    const res = await Axios(
      `${process.env.REACT_APP_API_URL}/foods/${id}?lang=fr`,
      {
        method: 'GET',
      }
    );
    if (res.status === 200) {
      return res.data;
    } else {
      const error = {
        status: res.status,
        message: 'Error',
      };
      return Promise.reject(error);
    }
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getFoodCategories: () => Promise<FoodCategorie[]> = async () => {
  try {
    const res = await Axios(`${process.env.REACT_APP_API_URL}/foodCategories`, {
      method: 'GET',
    });
    if (res.status === 200) {
      return res.data;
    } else {
      const error = {
        status: res.status,
        message: 'Error',
      };
      return Promise.reject(error);
    }
  } catch (e) {
    return Promise.reject(e);
  }
};


export const getPlatPolulaire: () => Promise<FoodCategorie[]> = async () => {
  try {
    const res = await Axios(`${process.env.REACT_APP_API_URL}/platRecommander`, {
      method: 'GET',
    });
    if (res.status === 200) {
      return res.data;
    } else {
      const error = {
        status: res.status,
        message: 'Error',
      };
      return Promise.reject(error);
    }
  } catch (e) {
    return Promise.reject(e);
  }
};
