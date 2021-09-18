import { FoodInCart, MenuInCart } from '../redux/types/cart';
import Restaurant from './Restaurant.model';

export type CommandType = 'delivery' | 'on_site' | 'takeaway';

export interface Customer {
  name: string;
  email: string;
  address: string;
  phoneNumber: string;
}

export type PaymentStatus =
  | {
    status: boolean;
    paymentChargeId: string;
  }
  | { status: boolean; paymentIntentId: string };

export interface MenuInCommand {
  quantity: number;
  item: string;
  foods: {
    food: string;
    options: {
      title: string;
      maxOptions: number;
      items: {
        item: string;
        quantity: number;
      }[];
    }[];
  }[];
}

export interface FoodInCommand {
  quantity: number;
  item: string;
  options: {
    title: string;
    maxOptions: number;
    items: {
      item: string;
      quantity: number;
    }[];
  }[];
}

export type DeliveryOption = 'behind_the_door' | 'on_the_door' | 'out';

export interface Command {
  _id?: string;
  comment?: string;
  relatedUser?: string;
  priceLivraison?: number;
  code?: number;
  optionLivraison?: DeliveryOption;
  etage?: number;
  appartement?: string;
  codeAppartement?: string;
  customer?: Customer;
  commandType: CommandType;
  shippingAddress?: string;
  shippingTime?: number;
  shipAsSoonAsPossible?: boolean;
  totalPrice: number;
  confirmed?: boolean;
  payed?: PaymentStatus;
  validated?: boolean;
  revoked?: boolean;
  restaurant?: string | Restaurant;
  menus: MenuInCommand[] | MenuInCart[];
  items: FoodInCommand[] | FoodInCart[];
  priceless?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  confirmationCode: string;
  paiementLivraison?: boolean;
}

export default Command;
