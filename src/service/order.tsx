import { axiosservice } from "../config/API";
import { CartItem } from "../interface/cart";

// Interface for the Order document as stored in the database and returned by the API
export interface Order {
  _id: string;
  userId: string;
  items: CartItem[];
  amount: number;
  paymentMethod: string;
  paymentstatus: string;
  status: string;
  createdAt: string;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    address: string;
    notes?: string;
  };
  voucher?: {
    _id: string;
    code: string;
    discountAmount: number;
    discountPercentage?: number;
    description?: string;
    expirationDate: string;
    isActive: boolean;
    quantity: number;
    createdAt: string;
    usedByOrders: string[];
  };
  cancelReason?: {
    reason: string;
    canceledAt: string;
    canceledBy: string;
  };
  confirmedAt?: string;
  confirmedBy?: string;
  receivedAt?: string;
  receivedBy?: string;
}

export interface IOrderData {
  userId: string;
  items: CartItem[];
  amount: number;
  paymentMethod: string;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    address: string;
    notes?: string;
  };
  voucherCode?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  receivedAt?: string;
  receivedBy?: string;
}

// Interface for orders fetched with populated userId and productId fields
export interface IOrder {
  _id: string;
  userId: { _id: string; name: string; email: string };
  items: (CartItem & {
    productId: { _id: string; name: string; price: number; img: string[] };
  })[];
  amount: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
  paymentstatus: string;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    address: string;
    notes?: string;
  };
  voucher?: {
    _id: string;
    code: string;
    discountAmount: number;
    discountPercentage?: number;
    description?: string;
    expirationDate: string;
    isActive: boolean;
    quantity: number;
    createdAt: string;
    usedByOrders: string[];
  };
  cancelReason?: {
    reason: string;
    canceledAt: string;
    canceledBy: string;
    receivedAt?: string;
    receivedBy?: string;
  };
  confirmedAt?: string;
  confirmedBy?: string;
  receivedAt?: string;
  receivedBy?: string;
}

// Interface for orders fetched by shipper with populated userId and productId fields
export interface IShipper {
  id: string;
  name: string;
}

export interface IOrderShipper {
  _id: string;
  userId: { _id: string; name: string; email: string };
  items: (CartItem & {
    productId: { _id: string; name: string; price: number; img: string[] };
  })[];
  amount: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
  paymentstatus: string;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    address: string;
    notes?: string;
  };
  voucher?: {
    _id: string;
    code: string;
    discountAmount: number;
    discountPercentage?: number;
    description?: string;
    expirationDate: string;
    isActive: boolean;
    quantity: number;
    createdAt: string;
    usedByOrders: string[];
  };
  cancelReason?: {
    reason: string;
    canceledAt: string;
    canceledBy: string;
  };
  confirmedAt?: string;
  confirmedBy?: string;
  receivedAt?: string;
  receivedBy?: string;
  shipperId?: string; // Replaced shipper subdocument with shipperId
  shipper?: IShipper; // Optional: Keep for display if populated or derived
}

// Function to submit the order
export const placeOrder = async (orderData: IOrderData): Promise<Order> => {
  try {
    const response = await axiosservice.post("/order/confirm", orderData);
    return response.data; // Returns the order data
  } catch (error: any) {
    console.error("Error placing order:", error);
    throw new Error(
      error.response?.data?.message ||
        "Could not place the order. Please try again later."
    );
  }
};

// Function to fetch orders by user ID
export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
  try {
    const response = await axiosservice.get(`/orders/${userId}`);
    return response.data.orders;
  } catch (error: any) {
    console.error("Error fetching order history:", error);
    throw new Error(
      error.response?.data?.message ||
        "Could not fetch orders. Please try again later."
    );
  }
};

// Function to fetch a single order by ID
export const getOrderById = async (orderId: string): Promise<IOrder> => {
  try {
    const response = await fetch(
      `http://localhost:28017/api/orders/${orderId}`
    );
    if (!response.ok) {
      throw new Error("Could not fetch the order. Please try again later.");
    }
    const orderData = await response.json();
    return orderData; // Return the order data with populated fields
  } catch (error: any) {
    console.error("Error fetching order by ID:", error);
    throw new Error(
      error.response?.data?.message ||
        "Could not fetch the order. Please try again later."
    );
  }
};

// Function to fetch user (shipper) by ID
export const getUserById = async (
  userId: string
): Promise<{ _id: string; name: string }> => {
  try {
    const response = await axiosservice.get(`/user/${userId}`); // Adjust endpoint as needed
    return response.data;
  } catch (error: any) {
    console.error("Error fetching user by ID:", error);
    throw new Error(
      error.response?.data?.message ||
        "Could not fetch user data. Please try again later."
    );
  }
};
