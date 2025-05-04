import axios from "axios";
import React, { useEffect, useState } from "react";
import { getUserById, IOrderShipper, IShipper } from "../../../service/order";
import { axiosservice } from "../../../config/API";

type Props = {};

const OrdersShipper = (props: Props) => {
  console.log("OrdersShipper component mounted");
  const [orders, setOrders] = useState<IOrderShipper[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(7);
  const [currentShipper, setCurrentShipper] = useState<IShipper | null>(null);

  useEffect(() => {
    console.log("useEffect for currentShipper triggered");
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setCurrentShipper({
        id: parsedUser.id || "",
        name: parsedUser.info?.name || "",
      });
      console.log("Current shipper set:", {
        id: parsedUser.id,
        name: parsedUser.info?.name,
      });
    }
  }, []);

  const fetchOrders = async () => {
    console.log("fetchOrders called");
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<IOrderShipper[]>(
        "http://localhost:28017/orders-list"
      );
      console.log("Fetched orders from API (full response):", response.data);

      // Fetch shipper names for orders with shipperId
      const ordersWithShipperNames = await Promise.all(
        response.data.reverse().map(async (newOrder) => {
          if (newOrder.shipperId) {
            try {
              const shipperData = await getUserById(newOrder.shipperId);
              return {
                ...newOrder,
                shipper: { id: newOrder.shipperId, name: shipperData.name },
              };
            } catch (err) {
              console.error(
                `Error fetching shipper name for ID ${newOrder.shipperId}:`,
                err
              );
              return {
                ...newOrder,
                shipper: { id: newOrder.shipperId, name: "Unknown Shipper" },
              };
            }
          }
          return newOrder;
        })
      );

      setOrders((prevOrders) =>
        ordersWithShipperNames.map((newOrder) => {
          const existingOrder = prevOrders.find((o) => o._id === newOrder._id);
          return existingOrder && existingOrder.shipper
            ? { ...newOrder, shipper: existingOrder.shipper }
            : newOrder;
        })
      );
    } catch (err: any) {
      setError("Không thể tải danh sách đơn hàng");
      console.error("Error fetching orders:", err);
    } finally {
      console.log("fetchOrders completed, isLoading set to false");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect for fetchOrders triggered");
    fetchOrders();

    const interval = setInterval(() => {
      console.log("Interval fetch triggered");
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleInProgressOrder = async (orderId: string) => {
    console.log("handleInProgressOrder called for orderId:", orderId);
    if (!currentShipper) {
      setError("Bạn cần đăng nhập để nhận đơn hàng");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `http://localhost:28017/orders-list/${orderId}`,
        {
          status: "in_progress",
          shipperId: currentShipper.id, // Send shipperId
        }
      );

      if (response.status === 200 && response.data) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  status: "in_progress",
                  shipperId: currentShipper.id, // Update state with shipperId
                  shipper: { id: currentShipper.id, name: currentShipper.name }, // Keep for display
                }
              : order
          )
        );
        await fetchOrders();
        console.log(
          `Re-fetched order ${orderId} after update:`,
          orders.find((o) => o._id === orderId)
        );
      } else {
        setError("Không thể cập nhật trạng thái đơn hàng");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Không thể cập nhật trạng thái đơn hàng"
      );
      console.error("Error updating order status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelivery = async (orderId: string) => {
    console.log("handleConfirmDelivery called for orderId:", orderId);
    if (!currentShipper) {
      setError("Bạn cần đăng nhập để cập nhật đơn hàng");
      return;
    }

    await fetchOrders();
    const order = orders.find((o) => o._id === orderId);
    if (order?.shipperId && order.shipperId !== currentShipper.id) {
      setError("Bạn không được phép cập nhật đơn hàng này");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `http://localhost:28017/orders-list/${orderId}`,
        {
          status: "delivered",
          paymentstatus: "Đã Thanh Toán",
          shipperId: currentShipper.id, // Send shipperId
        }
      );

      if (response.status === 200 && response.data) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  status: "delivered",
                  paymentstatus: "Đã Thanh Toán",
                }
              : order
          )
        );

        await axios.put(
          `http://localhost:28017/api/orders/${orderId}/received`,
          {
            status: "Đã giao",
          }
        );

        await fetchOrders();
      }
    } catch (err: any) {
      console.error("Error confirming delivery:", err);
      setError(err.response?.data?.message || "Không thể xác nhận giao hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFailedDelivery = async (orderId: string) => {
    console.log("handleFailedDelivery called for orderId:", orderId);
    if (!currentShipper) {
      setError("Bạn cần đăng nhập để cập nhật đơn hàng");
      return;
    }

    const order = orders.find((o) => o._id === orderId);
    if (order?.shipperId && order.shipperId !== currentShipper.id) {
      setError("Bạn không được phép cập nhật đơn hàng này");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const orderToUpdate = orders.find((order) => order._id === orderId);

      if (!orderToUpdate) {
        setError("Order not found");
        return;
      }

      const returnedItems = orderToUpdate.items.map((item) => ({
        productId: item.productId._id || item.productId,
        quantity: item.quantity,
      }));

      const response = await axios.put(
        `http://localhost:28017/orders-list/${orderId}`,
        {
          status: "failed",
          paymentstatus: "chưa thanh toán",
          returnedItems,
          shipperId: currentShipper.id, // Send shipperId
        }
      );

      if (response.status === 200 && response.data) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  status: "failed",
                  paymentstatus: "chưa thanh toán",
                }
              : order
          )
        );
        console.log("Order marked as failed and inventory updated.");

        await fetchOrders();
      } else {
        setError("Failed to update order status.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "An error occurred while updating order status."
      );
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto p-6 font-semibold">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
        Danh sách đơn hàng cho shipper
      </h1>

      {isLoading && (
        <p className="text-center text-gray-500">Đang tải đơn hàng...</p>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}

      {currentOrders.length > 0 ? (
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 mt-6">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-blue-100 text-gray-700">
              <tr>
                {[
                  "Khách hàng",
                  "Sản phẩm",
                  "Số điện thoại",
                  "Địa chỉ",
                  "Tổng số tiền",
                  "Shipper",
                  "Trạng thái",
                  "Trạng thái đơn hàng",
                  "Hành động",
                ].map((header) => (
                  <th
                    key={header}
                    className="border-b px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order, index) => {
                console.log(`Order shipper for ${order._id}:`, {
                  shipperId: order.shipperId,
                  shipper: order.shipper,
                });
                return (
                  <tr
                    key={order._id}
                    className={`hover:bg-blue-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="border-b px-6 py-4 text-sm text-gray-600">
                      {order.customerDetails.name}
                    </td>
                    <td className="border-b px-6 py-4 text-sm text-gray-600">
                      {order.items && order.items.length > 0
                        ? order.items.slice(0, 5).map((item, idx) => (
                            <div key={idx}>
                              <span>
                                {item.name} -{" "}
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(item.price)}{" "}
                                x {item.quantity}
                              </span>
                            </div>
                          ))
                        : "Không có sản phẩm"}
                    </td>
                    <td className="border-b px-6 py-4 text-sm text-gray-600">
                      {order.customerDetails.phone}
                    </td>
                    <td className="border-b px-6 py-4 text-sm text-gray-600">
                      {order.customerDetails.address}
                    </td>
                    <td className="border-b px-6 py-4 text-sm text-gray-600">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(order.amount)}
                    </td>
                    <td className="border-b px-6 py-4 text-sm text-gray-600">
                      {order.shipperId
                        ? order.shipper?.name || "Unknown Shipper"
                        : "Chưa có shipper"}
                    </td>
                    <td className="border-b px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span
                          className={`px-4 py-2 text-sm font-semibold rounded-lg text-white ${
                            order.status === "pending"
                              ? "bg-yellow-500"
                              : order.status === "packaging"
                              ? "bg-orange-500"
                              : order.status === "in_progress"
                              ? "bg-blue-500"
                              : order.status === "confirm-receive"
                              ? "bg-blue-500"
                              : order.status === "delivered"
                              ? "bg-green-500"
                              : order.status === "cancelledOrder"
                              ? "bg-red-500"
                              : order.status === "failed"
                              ? "bg-gray-500"
                              : "bg-gray-400"
                          }`}
                        >
                          {order.status === "pending"
                            ? "Đang xử lý"
                            : order.status === "packaging"
                            ? "Đóng gói"
                            : order.status === "in_progress"
                            ? "Đang giao"
                            : order.status === "confirm-receive"
                            ? "Thành công"
                            : order.status === "delivered"
                            ? "Đã giao"
                            : order.status === "cancelledOrder"
                            ? "Đã hủy"
                            : order.status === "failed"
                            ? "Thất bại"
                            : "Thất bại"}
                        </span>
                      </div>
                    </td>
                    <td className="border-b px-6 py-4 text-sm text-gray-600">
                      {order.paymentstatus === "chưa thanh toán"
                        ? "Chưa thanh toán"
                        : "Đã thanh toán"}
                    </td>
                    <td className="border-b px-6 py-4 text-sm text-gray-600">
                      {order.status === "packaging" && (
                        <button
                          onClick={() => handleInProgressOrder(order._id)}
                          className="bg-blue-500 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:bg-blue-600 hover:shadow-lg"
                        >
                          Nhận đơn
                        </button>
                      )}

                      {order.status === "in_progress" &&
                        (!order.shipperId ||
                          order.shipperId === currentShipper?.id) && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleConfirmDelivery(order._id)}
                              className="bg-green-500 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:bg-green-600 hover:shadow-lg"
                            >
                              Giao thành công
                            </button>

                            {order.paymentMethod === "cash_on_delivery" && (
                              <button
                                onClick={() => handleFailedDelivery(order._id)}
                                className="bg-red-500 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:bg-red-600 hover:shadow-lg"
                              >
                                Giao thất bại
                              </button>
                            )}
                          </div>
                        )}

                      {order.status === "in_progress" &&
                        order.shipperId &&
                        order.shipperId !== currentShipper?.id && (
                          <span className="text-gray-500">
                            Đơn hàng đã được nhận bởi shipper khác
                          </span>
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">Không có đơn hàng nào</p>
      )}

      <div className="mt-4 flex justify-center">
        <nav>
          <ul className="flex list-none space-x-2">
            {Array.from({
              length: Math.ceil(orders.length / itemsPerPage),
            }).map((_, index) => (
              <li key={index}>
                <button
                  onClick={() => paginate(index + 1)}
                  className={`px-6 py-2 rounded-md text-white ${
                    currentPage === index + 1
                      ? "bg-blue-500"
                      : "bg-gray-200 text-gray-600"
                  } transition-all duration-300 hover:bg-blue-600`}
                >
                  {index + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default OrdersShipper;
