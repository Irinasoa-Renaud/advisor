import Axios from 'axios';
import Menu from '../models/Menu.model';
import { Lang } from '../redux/types/setting';

const getMenuWithId: (id: string, lang: Lang) => Promise<Menu> = async (
  id,
  lang
) => {
  try {
    const res = await Axios(
      `${process.env.REACT_APP_API_URL}/menus/${id}?lang=fr`,
      {
        method: 'GET',
      }
    );
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

export const searchMenus: (params: {
  lang?: string;
  query: string;
  restaurant?: string;
  filter?: { [key: string]: string };
}) => Promise<{ type: 'menu'; content: Menu }[]> = async ({
  lang = 'fr',
  query,
  restaurant,
  filter = {},
}) => {
  try {
    if (restaurant) filter.restaurant = restaurant;

    const res = await Axios(
      `${
        process.env.REACT_APP_API_URL
      }/search?lang=${lang}&type=menu&q=${query}&filter=${JSON.stringify(
        filter
      )}`,
      {
        method: 'GET',
      }
    );
    if (res.status === 200) {
      return (res.data as { type: 'menu'; content: Menu }[]).filter(
        ({ content: { restaurant } }) =>
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

export default getMenuWithId;
