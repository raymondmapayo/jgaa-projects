// OrderDetailsModal.tsx
import { DotLottieReact } from "@lottiefiles/dotlottie-react"; // Import Lottie component
import { message, Modal, Spin } from "antd";
import axios from "axios";
import React, { useState } from "react";
import GCashButton from "../animation/GCashButton";
import PayPalButton from "../animation/PayPalButton"; // Import PayPalButton component
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
  const [loading, setLoading] = useState(false); // State for loading spinner
  const [showPayPal, setShowPayPal] = useState(false); // State for showing PayPal button
  const client = useStore((state) => state.client) || {};
  const userId = sessionStorage.getItem("user_id");
  const [showGCash, setShowGCash] = useState(false); // State for showing GCash button
  const apiUrl = import.meta.env.VITE_API_URL;
  const handlePaymentSuccess = async (
    paymentMethod: "PayPal" | "GCash",
    transactionId?: string
  ) => {
    setLoading(true);

    try {
      // Build order item data
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

      // Step 1: Create order with payment_method (backend decides pending vs paid)
      const orderResponse = await axios.post(
        `${apiUrl}/create_order/${userId}`,
        { orderData: data, payment_method: paymentMethod }
      );

      const orderId = orderResponse.data.orderId;

      if (!orderId) {
        throw new Error("Failed to create order.");
      }

      // Step 2: Add items to the order
      const orderItems = data.map((item) => ({
        order_id: orderId,
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

      // Step 3: Record activity
      const activityData = {
        user_id: userId,
        activity_date: new Date(),
        order_id: orderId,
      };
      await axios.post(`${apiUrl}/activity_user/${userId}`, activityData);

      // Step 4: Remove items from the cart
      await axios.post(`${apiUrl}/remove_from_cart/${userId}`, {
        items: data,
      });

      // Step 5: Only update payment status (and trigger inventory deduction) for PayPal.

      if (paymentMethod === "PayPal") {
        await axios.post(`${apiUrl}/update_payment_status/${orderId}`, {
          paymentStatus: "paid",
        });

        // Step 6a: Store PayPal transaction & payment records
        await axios.post(`${apiUrl}/paypal_transaction`, {
          amount: finalTotal * 100,
          description: "Payment for Order",
          remarks: "Payment for order",
          transaction_id: transactionId,
          checkout_url: `https://www.paypal.com/checkoutnow?token=${transactionId}`,
          payment_method: "PayPal",
          user_id: userId,
          order_quantity: checkoutItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          menu_img: checkoutItems[0]?.menu_img || "",
        });

        await axios.post(`${apiUrl}/paypal_payment`, {
          user_id: userId,
          amount_paid: finalTotal * 100,
          payment_method: "PayPal",
          payment_status: "completed",
          transaction_id: transactionId,
        });
      } else if (paymentMethod === "GCash") {
        console.log(
          "GCash: order created and left as pending. Waiting for verification."
        );
      }

      // Step 7: Cleanup and success message
      onCancel();
      message.success("Order placed successfully and cart cleared!");
      useStore.setState({ client: { ...client, cart: [] } });
    } catch (error: any) {
      // Improved error logging so you can see backend details in console
      console.error(
        "Payment process failed:",
        error?.response?.data || error?.message || error
      );
      const serverMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while processing your payment. Please try again.";
      message.error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error: any) => {
    setLoading(false);
    console.error(
      "Payment error:",
      error?.response?.data || error?.message || error
    );
    message.error("Payment failed, please try again.");
  };

  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "";

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      footer={null} // Removed the Proceed button as PayPal will handle the transaction
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

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center items-center mt-4">
          <Spin size="large" />
        </div>
      )}

      <div className="mt-6 p-6 bg-white rounded-lg shadow-lg">
        <h4 className="text-xl font-semibold text-gray-800 text-center">
          Choose Your Payment Method
        </h4>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-10 justify-center">
          <div
            className="flex flex-col items-center p-6 border border-gray-200 rounded-xl shadow-lg hover:bg-gray-100 cursor-pointer"
            onClick={() => setShowPayPal(true)} // Show PayPal button
          >
            <DotLottieReact
              src="https://lottie.host/3e95f125-af06-4e93-9d08-a74ef93c0283/HC91pP4Qu8.lottie"
              loop
              autoplay
              className="w-28 h-28 mb-4"
            />
            <p className="font-medium text-gray-700 text-lg">PayPal</p>
          </div>
          {/* GCash Card */}
          <div
            className="flex flex-col items-center p-6 border border-gray-200 rounded-xl shadow-lg hover:bg-gray-100 cursor-pointer"
            onClick={() => setShowGCash(true)} // Show GCash button
          >
            <img
              src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3b3AyZXdsZGRxN3g1emxzbHVjamhtb2ZzNG4xaGhpdGZyN2FkdWZicyZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/MADYD4WF9g1b78RvE4/giphy.gif"
              alt="GCash"
              className="w-28 h-28 object-contain mb-4"
            />
            <p className="font-medium text-gray-700 text-lg">GCash</p>
          </div>
        </div>
      </div>

      {/* PayPal Button */}
      {showPayPal && (
        <PayPalButton
          amount={finalTotal}
          clientId={clientId}
          fundingSource="paypal"
          onPaymentSuccess={(transactionId) =>
            handlePaymentSuccess("PayPal", transactionId)
          }
          onPaymentError={handlePaymentError}
          userId={userId || ""}
          menuImg={checkoutItems[0]?.menu_img || ""}
          orderQuantity={checkoutItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          )}
        />
      )}

      {/* GCash Button */}
      {showGCash && (
        <GCashButton
          amount={finalTotal}
          onPaymentSuccess={() => handlePaymentSuccess("GCash")}
          onPaymentError={handlePaymentError}
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
