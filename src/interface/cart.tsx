import { IUserCart } from "./user";

export interface Icart {
  userId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    img: string;
    color?: string;
    subVariant?: {
      specification: string;
      value: string;
    };
  }[];
}

interface PopulatedProduct {
  _id: string;
}

export interface CartItem {
  productId: string | PopulatedProduct;
  name: string;
  price: number;
  img: string;
  quantity: number;
  color: string;
  subVariant?: {
    specification: string;
    value: string;
  };
}

// export type ICartLite = Pick<Icart, 'userId' | 'items'>
