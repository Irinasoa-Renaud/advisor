import RestoRecommander from "../models/RestoRecommander.model";
import Api from './Api';

export const getRestoRecommander: () => Promise<RestoRecommander[]> = () =>
  Api.get<RestoRecommander[]>('/restoRecommander').then(({ status, data }) =>
    status === 200 ? data : Promise.reject(data),
  );
