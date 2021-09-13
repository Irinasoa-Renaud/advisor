import Api from '../Api';
import View from '../models/View.model';

export const getView: () => Promise<View> = () =>
    Api.get<View>(`/view`).then(({ status, data }) =>
        status === 200 ? data : Promise.reject(data),
    );

export const updateView: (
    id: string,
    data: Partial<View>,
) => Promise<void> = (id, data) =>
        Api.put(`/view/${id}`, { data });