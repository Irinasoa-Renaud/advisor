import Api from '../Api';
import { MenuTitleFormType } from '../components/Forms/MenuTitleForm';
import MenuTitle from '../models/MenuTitle.model';

export const getMenuTitles: (filter?: { restaurant: string }) => Promise<MenuTitle[]> = (filter) =>
    Api.get<MenuTitle[]>(`/menuTitle?${filter ? `filter=${JSON.stringify(filter)}` : ''}`).then(({ status, data }) =>
        status === 200 ? data : Promise.reject(data),
    );

export const addMenuTitle: (data: MenuTitleFormType) => Promise<any> = (data) =>
    Api.post('/menuTitle', {
        name: { fr: data.name },
        restaurant: data.restaurant,
    });

export const updateMenuTitle: (
    id: string,
    data: Partial<MenuTitleFormType>,
) => Promise<void> = (id, data) =>
        Api.put(`/menuTitle/${id}`, {
            name: data.name && { fr: data.name },
            priority: data.priority,
        });

export const deleteMenuTitle: (id: string) => Promise<void> = (id) =>
    Api.delete(`/menuTitle/${id}`);
