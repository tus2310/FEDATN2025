import { axiosservice } from "../config/API";
import { Icart } from "../interface/cart";

// Function to add an item to the cart
export const addtoCart = async (cart: Icart) => {
  try {
    const { data } = await axiosservice.post("cart/add", cart);
    return data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const getCartByID = async (id?: string) => {
  if (!id) {
    console.error("No ID provided for fetching cart");
    return null;
  }

  try {
    const { data } = await axiosservice.get(`/Cart/${id}`);
    console.log(data, "cartdata");

    return data;
  } catch (error) {
    console.error("Error fetching cart by ID:", error);
    throw error;
  }
};

export const removeFromCart = async (userId: string, productId: string) => {
  try {
    const response = await axiosservice.delete(`/cart/remove`, {
      data: { userId, productId },
    });
    return response.data;
  } catch (error) {
    console.error("Error removing item from cart:", error);
    throw error;
  }
};

export const updateCartQuantity = async (
  userId: string,
  productId: string,
  newQuantity: number
) => {
  try {
    const response = await axiosservice.put(`/${userId}/cartupdate`, {
      productId,
      newQuantity,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update cart quantity:", error);
    throw error;
  }
};
