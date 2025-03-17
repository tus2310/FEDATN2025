import { useContext, useEffect, useState } from "react";
import { Cartcontext } from "../contexts/cartcontext";
import { CartItem } from "../../interface/cart";
import { getCartByID, removeFromCart, updateCartQuantity } from "../../service/cart";
import Header from "../Header";
import Footer from "../Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Cart = () => {
  const Globalstate = useContext(Cartcontext);
  const [userId, setUserId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch cart data based on user ID
  const fetchCartData = async (userId: string) => {
    setLoading(true);
    try {
      const data = await getCartByID(userId);
      if (data) {
        setCartItems(data.items);
      }
    } catch (err) {
      setError("Failed to fetch cart data.");
      console.error("Error fetching cart data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check for price changes
  const checkForPriceChanges = async () => {
    try {
      const response = await axios.post("http://localhost:28017/checkout", {
        userId,
      });
      if (response.status === 400 && response.data.message) {
        toast.error(response.data.message); 
        setCartItems([]); 
        return "priceChanged"; 
      }
    } catch (error: any) {
      console.error("Error during price check:", error.response?.data || error);
      if (error.response?.status === 400 && error.response.data?.message) {
        // toast.error(error.response.data.message); 
        setCartItems([]); 
        return "priceChanged"; 
      }
    }
    return "noChange"; 
  };

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const { id } = JSON.parse(userData);
      if (id) {
        setUserId(id);
        fetchCartData(id);
      }
    }
  }, []); 

  useEffect(() => {
    if (userId) {
      checkForPriceChanges();
    }
  }, [userId]); 

  const handleRemove = async (item: CartItem) => {
    try {
      const updatedCart = await removeFromCart(userId as string, item.productId);
      setCartItems(updatedCart.items);
      toast.success("Sản phẩm đã được xóa khỏi giỏ hàng.");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Đã xảy ra lỗi khi xóa sản phẩm.");
    }
  };

  const handleIncrease = async (item: CartItem) => {
    try {
      const response = await fetch(`http://localhost:28017/api/products/${item.productId}`);
      const text = await response.text();

      if (response.ok && text.startsWith("{")) {
        let product;
        try {
          product = JSON.parse(text);

          if (item.quantity + 1 > product.soLuong) {
            toast.error("Sản phẩm không đủ số lượng để thêm vào giỏ hàng.");
            return;
          }

          const updatedItems = cartItems.map((cartItem) =>
            cartItem.productId === item.productId
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
          setCartItems(updatedItems);

          const updateResponse = await fetch(`http://localhost:28017/api/cart/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: item.productId,
              quantity: item.quantity + 1,
            }),
          });

          if (!updateResponse.ok) {
            throw new Error(`Failed to update cart quantity: ${updateResponse.statusText}`);
          }

          toast.success("Số lượng sản phẩm đã được cập nhật.");
        } catch (parseError) {
          throw new Error("Failed to parse product details as JSON.");
        }
      } else {
        throw new Error("Received invalid response, expected JSON.");
      }
    } catch (error) {
      console.error("Failed to increase quantity:", error);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại sau.");
    }
  };

  const handleDecrease = async (item: CartItem) => {
    try {
      if (item.quantity && item.quantity > 1) {
        const updatedItems = cartItems.map((cartItem) =>
          cartItem.productId === item.productId
            ? { ...cartItem, quantity: item.quantity - 1 }
            : cartItem
        );
        setCartItems(updatedItems);
        await updateCartQuantity(userId as string, item.productId, item.quantity - 1);
        toast.success("Số lượng sản phẩm đã được cập nhật.");
      } else {
        handleRemove(item);
      }
    } catch (error) {
      console.error("Failed to decrease quantity:", error);
      toast.error("Đã xảy ra lỗi khi giảm số lượng.");
    }
  };