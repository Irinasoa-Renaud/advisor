import Restaurant from '../models/Restaurant.model';
import { Lang } from '../redux/types/setting';
import Api from './Api';

export const getRestaurants: (params?: {
  limit?: number;
  offset?: number;
  searchCategory?: 'nearest' | 'new';
  coordinates?: [number, number];
}) => Promise<Restaurant[]> = async (params = { offset: 0 }) => {
  try {
    const res = await Api.get(
      `/restaurants?offset=${params.offset || 0}${params.limit ? '&limit=' + params.limit : ''
      }${params.searchCategory
        ? '&searchCategory=' +
        params.searchCategory +
        (params.searchCategory === 'nearest' && params.coordinates
          ? '&location=' +
          JSON.stringify({ coordinates: params.coordinates })
          : '')
        : ''
      }`,
      {
        method: 'GET',
      }
    );
    if (res.status === 200) {
      return (res.data as Restaurant[]).filter(
        ({ referencement, status }) => status && referencement
      );
    } else {
      const error = {
        status: res.status,
        message: 'Erreur',
      };
      return Promise.reject(error);
    }
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getRestaurantWithId: (
  id: string,
  lang: Lang
) => Promise<Restaurant> = async (id, lang) => {
  try {
    const res = await Api.get(`/restaurants/${id}?lang=${lang}`, {
      method: 'GET',
    });
    if (res.status === 200) {
      return res.data;
    } else {
      const error = {
        status: res.status,
        message: 'Erreur',
      };
      return Promise.reject(error);
    }
  } catch (e) {
    return Promise.reject(e);
  }
};



export const getRestaurantPagesWithId: (
  id: string,
  lang: Lang
) => Promise<Restaurant> = async (id, lang) => {
  try {
    const res = await Api.get(`/restaurants/pages/${id}?lang=${lang}`, {
      method: 'GET',
    });
    if (res.status === 200) {
      return res.data;
    } else {
      const error = {
        status: res.status,
        message: 'Erreur',
      };
      return Promise.reject(error);
    }
  } catch (e) {
    return Promise.reject(e);
  }
};
