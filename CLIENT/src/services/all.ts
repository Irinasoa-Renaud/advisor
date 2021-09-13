import { CancelToken } from 'axios';
import Food from '../models/Food.model';
import Menu from '../models/Menu.model';
import Restaurant from '../models/Restaurant.model';
import { Lang } from '../redux/types/setting';
import Api from './Api';

export type SearchResult =
  | {
      type: 'food';
      content: Food;
    }
  | {
      type: 'restaurant';
      content: Restaurant;
    }
  | {
      type: 'menu';
      content: Menu;
    };

const search: (params: {
  lang: Lang;
  query: string;
  type?: string;
  filter?: string;
  cancelToken?: CancelToken;
}) => Promise<SearchResult[]> = async ({
  lang,
  query,
  filter,
  type = 'all',
  cancelToken,
}) => {
  try {
    let filterReq = ''
    let tempFilter = JSON.parse(filter || '')
    if (Object.keys(tempFilter).length === 1 && tempFilter[Object.keys(tempFilter)[0]].length === 0) {
      filterReq = ''
    } else {
      filterReq = `&filter=${filter}`
    }
    const res = await Api.get(
      `/search?lang=${lang}&type=${type}&q=${query}${filterReq}`,
      {
        method: 'GET',
        cancelToken,
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

export default search;
