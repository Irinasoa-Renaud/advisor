import Api from './Api';
import FoodAttribute from '../models/FoodAttribute.model';

const getFoodAttributes: (filter?: {
  [key: string]: string;
}) => Promise<FoodAttribute[]> = async (filter = {}) => {
  try {
    const res = await Api.get<FoodAttribute[]>(
      `/foodAttributes?filter=${JSON.stringify(filter)}`,
      {
        method: 'GET',
      },
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
export default getFoodAttributes;
