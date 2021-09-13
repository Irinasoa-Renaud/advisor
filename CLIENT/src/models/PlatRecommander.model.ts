import Food from './Food.model';
import Restaurant from "./Restaurant.model";

interface PlatRecommander {
    _id: string;
    food: Food;
    restaurant: Restaurant
}

export default PlatRecommander;
