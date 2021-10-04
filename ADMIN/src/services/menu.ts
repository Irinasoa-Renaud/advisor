import Api from '../Api';
import { MenuFormType } from '../components/Forms/MenuForm';
import Menu from '../models/Menu.model';
import { Lang } from '../types/Lang';
import querystring from 'querystring';

export const getMenus: (params?: {
  lang: string;
  restaurant?: string;
}) => Promise<Menu[]> = async (params = { lang: 'fr' }) => {
  try {
    const query = querystring.stringify(params),
      filter: any = { restaurant: params.restaurant };

    const res = await Api.get<Menu[]>(
      `/menus?${query}&filter=${JSON.stringify(filter)}`,
    );

    if (res.status === 200) {
      return res.data;
    } else {
      return Promise.reject(res.data);
    }
  } catch (e) {
    return Promise.reject(e);
  }
};

export const getMenuWithId: (id: string, lang: Lang) => Promise<Menu> = async (
  id,
  lang,
) => {
  try {
    const res = await Api.get(`/menus/${id}?lang=fr`);
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

export const searchMenus: (params?: {
  lang?: string;
  query: string;
  restaurant?: string;
  filter?: { [key: string]: string };
}) => Promise<{ type: 'menu'; content: Menu }[]> = async (
  params = {
    lang: 'fr',
    query: '',
    filter: {},
  },
  ) => {
    const { lang, query, filter, restaurant } = params;

    try {
      if (restaurant && filter) filter.restaurant = restaurant;

      const res = await Api.get(
        `/search?lang=${lang}&type=menu&q=${query}&filter=${JSON.stringify(
          filter,
        )}`,
      );
      if (res.status === 200) {
        return res.data as { type: 'menu'; content: Menu }[];
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

export const addMenu: (data: MenuFormType) => Promise<void> = (data) => {

  const dataSend = {
    ...data,
    name: { fr: data.name },
    foods: data.foods.map((food: any, i: any) => ({
      food,
      additionalPrice: {
        amount: Object.keys(data.prices).length ? Number((+data.prices[food]).toFixed(2).replace(',', '.')) * 100 : 0,
        currency: 'eur',
      },
    })),
    price: {
      amount: Number(data.price.replace(',', '.')) * 100,
      currency: 'eur',
    },
    prices: undefined,
  }

  console.log("dataSend", dataSend);

  return Api.post('/menus', { ...dataSend })

}


export const updateMenu: (id: string, data: Partial<MenuFormType>) => Promise<void> = (
  id,
  data,
) => {

  const dataSend = {
    ...data,
    name: { fr: data.name },
    foods: data.foods && data.foods.map((food: any, i: any) => ({
      food,
      additionalPrice: {
        amount: Object.keys(data.prices).length ? Number((+data.prices[food]).toFixed(2).replace(',', '.')) * 100 : 0,
        currency: 'eur',
      },
    })),
    price: {
      amount: data.price ? Number(data.price.replace(',', '.')) * 100 : 0,
      currency: 'eur',
    },
    prices: undefined,
  }

  return Api.put(`/menus/${id}`, { ...dataSend });

}


export const updateMenuDragDrop: (id: string, data: Partial<MenuFormType>) => Promise<void> = (
  id,
  data,
) =>
  Api.put(`/menus/${id}`, {
    priority: data.priority
  });

export const deleteMenu: (id: string) => Promise<void> = (id) =>
  Api.delete(`/menus/${id}`);

export default getMenuWithId;
