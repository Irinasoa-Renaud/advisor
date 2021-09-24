import Api from '../Api';
import { PlatRecommanderFormType } from '../components/Forms/PlatRecommanderForm';
import PlatRecommander from '../models/PlatRecommander.model';

export const getPlatPopulaire: (filter?: {}) => Promise<PlatRecommander[]> = (filter) =>
  Api.get<PlatRecommander[]>(`/platPopulaire?${filter ? `filter=${JSON.stringify(filter)}` : ''}`).then(({ status, data }) =>
    status === 200 ? data : Promise.reject(data),
  );

export const addPlatPopulaire: (data: PlatRecommanderFormType) => Promise<any> = (data) =>
  Api.post('/platPopulaire', {
    food: data.food,
    restaurant: data.restaurant
  });

export const updatePlatPopulaire: (
  id: string,
  data: Partial<PlatRecommanderFormType>,
) => Promise<void> = (id, data) =>
    Api.put(`/platPopulaire/${id}`, {
      priority: data.priority,
    });

export const deletePlatPopulaire: (id: string) => Promise<void> = (id) =>
  Api.delete(`/platPopulaire/${id}`);


