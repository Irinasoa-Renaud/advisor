import Api from './Api';
import PlatRecommander from "../models/PlatRecommander.model";

export const getPlatPopulaire: (filter?: {}) => Promise<PlatRecommander[]> = (filter) =>
    Api.get<PlatRecommander[]>(`/platPopulaire`).then(({ status, data }) =>
        status === 200 ? data : Promise.reject(data),
    );