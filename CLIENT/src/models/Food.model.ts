import Accompaniment from './Accompaniment.model';
import FoodAttribute from './FoodAttribute.model';
import FoodType from './FoodType.model';
import Restaurant from './Restaurant.model';

interface Food {
  _id: string;
  name: any;
  description?: string;
  type: FoodType;
  attributes: Array<string> | Array<FoodAttribute>;
  restaurant?: Restaurant;
  note: number;
  imageURL: string;
  price: {
    amount?: number;
    currency: 'eur' | 'usd';
  };
  options: {
    title: string;
    maxOptions: number;
    items: Accompaniment[];
  }[];
  priority: number;
  additionalPrice?: any;
  imageNotContractual?: boolean;
  isAvailable: boolean;
  allergene: Array<string> | Array<FoodAttribute>;
  attributesNotAllergene: Array<string> | Array<FoodAttribute>;
}

export default Food;
