import Restaurant from "./Restaurant.model";

interface RestoRecommander {
  _id: string;
  tag: string;
  restaurant: Restaurant;
}

export default RestoRecommander;
