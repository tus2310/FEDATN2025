import React, { useContext, useEffect, useState } from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import axios from "axios";
import { Cartcontext } from "./contexts/cartcontext";
import { IOrder } from "../service/order"; // Import IOrder to type the order data

const Success = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vnpAmount = queryParams.get("vnp_Amount");
  const vnpOrderInfo = queryParams.get("vnp_OrderInfo");
  const vnpResponseCode = queryParams.get("vnp_ResponseCode");
  const vnpSecureHash = queryParams.get("vnp_SecureHash");
  const vnpTransactionNo = queryParams.get("vnp_TransactionNo");
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [order, setOrder] = useState<IOrder | null>(null);
  const [tongtien, setTongtien] = useState<number>(0); // Use number instead of string
  const Globalstate = useContext(Cartcontext);

  const isPaymentSuccessful = vnpResponseCode === "00";

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const { id } = JSON.parse(userData);
      if (id) {
        setUserId(id);
      }
    }
  }, []);

  useEffect(() => {
    if (location.state?.order) {
      // Cash on delivery or other non-VNPay payment
      const fetchedOrder = location.state.order as IOrder;
      setOrder(fetchedOrder);
      setTongtien(fetchedOrder.amount);
      setMessage("Thanh toán tiền mặt thành công");
    } else if (isPaymentSuccessful && vnpAmount) {
      // VNPay payment
      handleConfirmPayment();
      setTongtien(Number(vnpAmount) / 100);
      setMessage("Thanh toán VNPay thành công");
    } else {
      setMessage("Không thể xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.");
    }
  }, [isPaymentSuccessful, vnpAmount]);

  const handleConfirmPayment = async () => {
    try {
      const userData = sessionStorage.getItem("user");
      if (!userData) {
        throw new Error("User data not found in session.");
      }

      const response = await axios.post(
        "http://localhost:28017/order/confirmvnpay",
        {
          userId: JSON.parse(userData).id,
          vnp_Amount: Number(vnpAmount) / 100,
          vnp_OrderInfo: vnpOrderInfo,
          vnp_ResponseCode: vnpResponseCode,
          vnp_TransactionNo: vnpTransactionNo,
          vnp_SecureHash: vnpSecureHash,
          paymentMethod: "vnpay",
        }
      );

      if (response.status === 201) {
        console.log("Order placed successfully:", response.data);
        setOrder(response.data.order); // Assuming the API returns the order
        // Clear session cart data
        sessionStorage.removeItem("cartItems");
        sessionStorage.removeItem("customerDetails");
      } else {
        console.error("Failed to place order:", response.data.message);
        setMessage("Thanh toán thất bại: " + response.data.message);
      }
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      setMessage("Lỗi khi xác nhận thanh toán: " + (error.message || error));
    }
  };

  if (!message) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center p-4 lg:p-8 bg-gray-100">
          <div className="text-center bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl w-full">
            <h1 className="text-lg font-bold">Đang xử lý...</h1>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex flex-col items-center p-4 lg:p-8 bg-gray-100">
        <div className="text-center bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl w-full">
          <h1 className="text-lg font-bold">{message}</h1>
          <p className="text-sm mt-2">
            Cảm ơn bạn đã mua sắm tại Click Mobile. Đơn hàng của bạn đã được
            thanh toán thành công.
          </p>
          {order && (
            <p className="text-sm mt-2">
              Mã đơn hàng: <span className="font-bold">{order._id}</span>.
            </p>
          )}
          {vnpTransactionNo && (
            <p className="text-sm mt-2">
              Mã giao dịch VNPay:{" "}
              <span className="font-bold">{vnpTransactionNo}</span>.
            </p>
          )}
          <p className="text-sm mt-2">
            Tổng số tiền:{" "}
            <span className="font-bold">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(tongtien)}
            </span>
            .
          </p>
          {vnpOrderInfo && (
            <p className="text-sm mt-2">
              Mô tả: <span className="font-medium">{vnpOrderInfo}</span>.
            </p>
          )}
          <div className="flex justify-center gap-4 mt-6">
            <NavLink to="/products">
              <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-100">
                Tiếp tục mua hàng
              </button>
            </NavLink>
            {order && (
              <NavLink to={`/orders/${order._id}`}>
                <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600">
                  Xem chi tiết đơn hàng
                </button>
              </NavLink>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Success;
