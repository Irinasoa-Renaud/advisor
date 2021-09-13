import Food from './Food.model';
import Restaurant from './Restaurant.model';

interface Menu {
  _id: string;
  restaurant?: Restaurant;
  type: 'per_food' | 'priceless' | 'fixed_price';
  name: string;
  description: string;
  imageURL: string;
  foods: Array<Food>;
  price: any;
  priority: number;
}

export default Menu;
