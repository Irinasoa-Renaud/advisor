import Api from './Api';
import PlatRecommander from "../models/PlatRecommander.model";

export const getPlatRecommander: () => Promise<PlatRecommander[]> = () =>
  Api.get<PlatRecommander[]>('/platRecommander').then(({ status, data }) =>
    status === 200 ? data : Promise.reject(data),
  );