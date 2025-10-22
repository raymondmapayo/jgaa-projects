// OrderDetailsModal.tsx
import { message, Modal, Spin } from "antd";
import axios from "axios";
import React, { useState } from "react";
import GCashButton from "../animation/GCashButton";
import useStore from "../zustand/store/store";

interface OrderDetailsModalProps {
  visible: boolean;
  checkoutItems: any[];
  finalTotal: number;
  onCancel: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  visible,
  checkoutItems,
  finalTotal,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [showGCash, setShowGCash] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const client = useStore((state) => state.client) || {};
  const userId = sessionStorage.getItem("user_id");
  const apiUrl = import.meta.env.VITE_API_URL;

  // Helper: create order only once
  const createOrder = async (paymentMethod: "GCash") => {
    if (orderId) return orderId; // Already created

    const data = checkoutItems.map((item) => ({
      user_id: userId,
      item_name: item.item_name,
      quantity: item.quantity,
      price: item.price,
      menu_img: item.menu_img,
      final_total: item.price * item.quantity,
      categories_name: item.categories_name || "Uncategorized",
      size: item.size || "Normal size",
    }));

    const response = await axios.post(`${apiUrl}/create_order/${userId}`, {
      orderData: data,
      payment_method: paymentMethod,
    });

    const createdOrderId = response.data.orderId;
    if (!createdOrderId) throw new Error("Failed to create order");

    setOrderId(createdOrderId);
    return createdOrderId;
  };

  const handlePaymentSuccess = async () => {
    setLoading(true);
    try {
      const data = checkoutItems.map((item) => ({
        user_id: userId,
        item_name: item.item_name,
        quantity: item.quantity,
        price: item.price,
        menu_img: item.menu_img,
        final_total: item.price * item.quantity,
        categories_name: item.categories_name || "Uncategorized",
        size: item.size || "Normal size",
      }));

      const createdOrderId = await createOrder("GCash");

      const orderItems = data.map((item) => ({
        order_id: createdOrderId,
        user_id: userId,
        item_name: item.item_name,
        quantity: item.quantity,
        price: item.price,
        menu_img: item.menu_img,
        final_total: item.final_total,
        size: item.size,
        categories_name: item.categories_name,
      }));

      await axios.post(`${apiUrl}/create_order_items/${userId}`, {
        orderItems,
      });

      await axios.post(`${apiUrl}/activity_user/${userId}`, {
        user_id: userId,
        activity_date: new Date(),
        order_id: createdOrderId,
      });

      await axios.post(`${apiUrl}/remove_from_cart/${userId}`, { items: data });

      console.log(
        "GCash: order created and left as pending. Waiting for verification."
      );

      onCancel();
      message.success("Order placed successfully and cart cleared!");
      useStore.setState({ client: { ...client, cart: [] } });
    } catch (error: any) {
      console.error(
        "Payment process failed:",
        error?.response?.data || error?.message || error
      );
      message.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "An error occurred while processing your payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShowGCash = async () => {
    try {
      await createOrder("GCash");
      setShowGCash(true);
    } catch (error) {
      console.error(error);
      message.error("Failed to initiate GCash payment. Please try again.");
    }
  };

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      footer={null}
      className="rounded-lg shadow-xl"
    >
      <div className="p-6 space-y-4 bg-white rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-center text-gray-800">
          Order Summary
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {checkoutItems.map((product, index) => (
            <li
              key={index}
              className="bg-gray-50 rounded-lg p-4 shadow-md flex flex-col items-center"
            >
              <img
                src={`${apiUrl}/uploads/images/${product.menu_img}`}
                alt={product.item_name}
                className="w-24 h-24 object-cover rounded-md mb-4"
              />
              <div className="text-center">
                <p className="font-medium text-gray-700">{product.item_name}</p>
                <p className="text-sm text-gray-500">
                  Quantity: {product.quantity}
                </p>
                <p className="text-sm text-gray-500">
                  Sizes: {product.size || "Normal size"}
                </p>
                <p className="font-semibold text-gray-900">
                  Total: ₱{product.price * product.quantity}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-lg font-semibold text-gray-800">
          Grand Total:{" "}
          <span className="text-xl text-red-700">₱{finalTotal}</span>
        </p>
      </div>

      {loading && (
        <div className="flex justify-center items-center mt-4">
          <Spin size="large" />
        </div>
      )}

      <div className="mt-6 p-6 bg-white rounded-lg shadow-lg">
        <h4 className="text-xl font-semibold text-gray-800 text-center">
          Payment Method
        </h4>
        <div
          className="flex flex-col items-center p-6 border border-gray-200 rounded-xl shadow-lg hover:bg-gray-100 cursor-pointer mt-4"
          onClick={handleShowGCash}
        >
          <img
            src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3b3AyZXdsZGRxN3g1emxzbHVjamhtb2ZzNG4xaGhpdGZyN2FkdWZicyZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/MADYD4WF9g1b78RvE4/giphy.gif"
            alt="GCash"
            className="w-28 h-28 object-contain mb-4"
          />
          <p className="font-medium text-gray-700 text-lg">GCash</p>
        </div>
      </div>

      {showGCash && orderId && (
        <GCashButton
          amount={finalTotal}
          orderId={orderId}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={(err) => console.error(err)}
          menuImg={checkoutItems[0]?.menu_img || ""}
          orderQuantity={checkoutItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          )}
        />
      )}
    </Modal>
  );
};

export default OrderDetailsModal;
