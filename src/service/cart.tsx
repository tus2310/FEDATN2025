import { axiosservice } from "../config/API";
import { Icart } from "../interface/cart";

// Thêm một mặt hàng vào giỏ hàng
export const addtoCart = async (cart: Icart) => {
  try {
    for (const item of cart.items) {
      if (!item.color) {
        throw new Error(`Color is required for item: ${item.productId}`);
      }
      if (
        item.subVariant &&
        (!item.subVariant.specification || !item.subVariant.value)
      ) {
        throw new Error(
          `Invalid subVariant for item: ${item.productId}. Both specification and value are required.`
        );
      }
    }

    const { data } = await axiosservice.post("cart/add", cart);
    return data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

// Hàm để lấy giỏ hàng theo ID người dùng
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

// xóa một mặt hàng khỏi giỏ hàng
export const removeFromCart = async (
  userId: string,
  productId: string,
  color: string,
  subVariant?: { specification?: string; value?: string }
) => {
  try {
    if (!color) {
      throw new Error("Color is required to remove an item from the cart");
    }
    const requestBody = {
      userId,
      productId,
      color,
      subVariant: subVariant
        ? { specification: subVariant.specification, value: subVariant.value }
        : undefined,
    };

    const response = await axiosservice.delete(`/cart/remove`, {
      data: requestBody,
    });
    // Trả về trực tiếp đối tượng giỏ hàng
    return response.data.cart || { items: [] }; // Fallback to { items: [] } if cart is missing
  } catch (error) {
    console.error("Error removing item from cart:", error);
    throw error;
  }
};

// Hàm để cập nhật số lượng mặt hàng trong giỏ hàng
export const updateCartQuantity = async (
  userId: string,
  productId: string,
  newQuantity: number,
  options: { color: string; specification?: string; value?: string }
) => {
  try {
    if (!options.color) {
      throw new Error("Color is required to update cart quantity");
    }

    if (newQuantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    if (options.specification || options.value) {
      if (!options.specification || !options.value) {
        throw new Error(
          "Both specification and value are required for subVariant"
        );
      }
    }

    const response = await axiosservice.put(`/${userId}/cartupdate`, {
      productId,
      newQuantity,
      color: options.color,
      subVariant: options.specification
        ? { specification: options.specification, value: options.value }
        : undefined,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update cart quantity:", error);
    throw error;
  }
};
