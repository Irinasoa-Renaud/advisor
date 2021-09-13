import Restaurant from "./Restaurant.model";

interface MenuTitle {
    _id: string;
    priority: number;
    tag: string;
    name: any;
    restaurant?: Restaurant;
}

export default MenuTitle;
