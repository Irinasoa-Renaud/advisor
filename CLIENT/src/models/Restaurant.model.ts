import FoodCategory from "./FoodCategory.model";
import FoodType from "./FoodType.model";

interface OpeningTime {
  begin: {
    hour: number;
    minute: number;
  };
  end: {
    hour: number;
    minute: number;
  };
}

interface Restaurant {
  _id: string;
  category: FoodCategory;
  name: string;
  description?: string;
  foodTypes: FoodType[];
  imageURL: string;
  type: string;
  address: string;
  city: string;
  foods: string[];
  priceByMiles: any;
  menus: string[];
  admin?: string;
  qrcodeLink: string;
  qrcodePricelessLink: string;
  delivery: boolean;
  surPlace: boolean;
  minPriceIsDelivery: string;
  aEmporter: boolean;
  phoneNumber?: string;
  DistanceMax: string;
  deliveryFixed: boolean;
  discountIsPrice: string;
  discount: string;
  discountType: string;
  deliveryPrice?: {
    amount?: number;
    currency?: string;
  },
  openingTimes: {
    day: string,
    openings: OpeningTime[];
  }[];
  location: {
    type: 'Point';
    coordinates: number[];
  };
  status?: boolean;
  referencement?: boolean;
  priority: number;
  isMenuActive: boolean;
  isBoissonActive: boolean;
  paiementLivraison: boolean;
  paiementCB: boolean;
  cbDirectToAdvisor: boolean;
  customerStripeKey?: string;
  livraison: any;
  logo: any;
  couvertureMobile: any;
  couvertureWeb: any;
}

export default Restaurant;
