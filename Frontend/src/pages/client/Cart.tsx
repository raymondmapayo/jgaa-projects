import { Checkbox, message, notification, Spin } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaSearch, FaTrashAlt } from "react-icons/fa";
import ConfirmationModal from "../../clientsmodal/ConfirmationModal";
import OrderDetailsModal from "../../clientsmodal/OrderDetailsModal";

import BillingDetailsModal from "../../animation/BillingDetailsModal";
import useStore from "../../zustand/store/store";
import {
  decrementCartItem,
  deleteCartItem,
  incrementCartItem,
} from "../../zustand/store/store.provider";

const Cart = () => {
  const client = useStore((state) => state.client) || {};
  const cart = client.cart || [];
  const [selectedItemsByCategory, setSelectedItemsByCategory] = useState<{
    [key: string]: number[];
  }>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false); // Confirmation Modal visibility
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]); // Items for checkout modal
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false); // Order details modal visibility
  const [isBillingCompleted, setIsBillingCompleted] = useState(true); // Check if billing details are complete
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localFinalTotal, setLocalFinalTotal] = useState(0); // add at the top of your component
  // State to control the visibility of BillingDetailsModal
  const [isBillingModalVisible, setBillingModalVisible] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  const selectedItemCount = Object.values(selectedItemsByCategory).reduce(
    (sum, ids) => sum + ids.length,
    0
  );

  const finalTotal = cart.reduce((sum, product) => {
    const isSelected = selectedItemsByCategory[
      product.categories_name || "Other"
    ]?.includes(product.id);
    if (isSelected) {
      return sum + product.price * product.quantity;
    }
    return sum;
  }, 0);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, [selectedItemsByCategory]);

  // Group cart items by category
  const groupedByCategory = cart.reduce((acc, product) => {
    const category = product.categories_name || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {} as { [key: string]: any[] });

  // Fetch billing data to check if it's complete
  const fetchBillingData = async () => {
    const userId = sessionStorage.getItem("user_id");
    if (!userId) return;

    try {
      const response = await axios.get(`${apiUrl}/user_details/${userId}`);
      const user = response.data.data;

      if (!user.city || !user.country) {
        setIsBillingCompleted(false);
      } else {
        setIsBillingCompleted(true);
        // Close the modal after completing the billing details
        setBillingModalVisible(false); // Close the modal
      }
    } catch (error) {
      console.error("Error fetching billing data:", error);
      message.error("An error occurred while fetching your billing details.");
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const handleCheckboxChange = (
    category: string,
    productId: number,
    checked: boolean
  ) => {
    setSelectedItemsByCategory((prevSelectedItems) => {
      const updatedSelectedItems = { ...prevSelectedItems };
      if (checked) {
        if (!updatedSelectedItems[category]) {
          updatedSelectedItems[category] = [];
        }
        updatedSelectedItems[category].push(productId);
      } else {
        updatedSelectedItems[category] = updatedSelectedItems[category].filter(
          (id) => id !== productId
        );
      }
      return updatedSelectedItems;
    });
  };

  const handleCheckout = () => {
    // If billing details are incomplete, show error notification and stop checkout
    if (!isBillingCompleted) {
      notification.error({
        message: "Billing Incomplete",
        description:
          "Please complete your billing details (city and country) before proceeding with payment.",
      });

      // Open the modal for billing details
      setBillingModalVisible(true); // Show BillingDetailsModal
      return; // Do not proceed to checkout if billing is incomplete
    }

    const userId = sessionStorage.getItem("user_id");

    if (!userId) {
      console.error("User not logged in");
      return;
    }

    if (selectedItemCount === 0) {
      message.error("Please check the box first before clicking Checkout.");
      return;
    }

    if (finalTotal <= 0) {
      message.error(
        "No items selected or cart is empty. Please add items to your cart."
      );
      return;
    }

    const checkoutData = cart.filter((item) =>
      selectedItemsByCategory[item.categories_name || "Other"]?.includes(
        item.id
      )
    );

    setCheckoutItems(checkoutData);

    // ✅ Calculate and store the local total for the modal
    const localTotal = checkoutData.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setLocalFinalTotal(localTotal);

    setIsModalVisible(true); // Show confirmation modal with cart details
  };

  const handleCancel = () => {
    setIsModalVisible(false); // Hide modal if user cancels
  };

  const handleContinue = async () => {
    const userId = sessionStorage.getItem("user_id");
    const selectedItems = cart.filter((item) =>
      selectedItemsByCategory[item.categories_name || "Other"]?.includes(
        item.id
      )
    );

    const data = selectedItems.map((item) => ({
      menu_name: item.item_name,
      quantity: item.quantity,
      availability: "true",
      categories_name: item.categories_name,
      item_name: item.item_name,
      price: item.price,
      menu_img: item.menu_img,
      finalTotal: item.price * item.quantity,
      size: item.size || "Normals ize", // Include the size field (default to "Regular" if not provided)
    }));

    try {
      await axios.post(`${apiUrl}/add_to_cart/${userId}`, {
        items: data,
      });
      setIsModalVisible(false);
      setIsOrderModalVisible(true); // Show order details modal after adding to cart
    } catch (error) {
      message.error("Failed to add items to cart.");
      console.error(error);
    }
  };

  const handleOrderModalClose = () => {
    setIsOrderModalVisible(false); // Close the order details modal
  };

  return (
    <div className="p-6 container mx-auto h-[90vh] overflow-hidden flex flex-col scroll-smooth">
      {/* Search Bar */}
      <div className="relative my-6">
        <input
          type="text"
          placeholder="Search by Category..."
          className="font-core w-full p-3 pl-12 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-red-400 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch className="absolute left-4 top-3 text-gray-400 text-lg" />
      </div>

      {Object.keys(groupedByCategory).length > 0 ? (
        <div className="flex-1 overflow-y-auto pr-2 scroll-smooth">
          {/* Flex Layout for Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cart Items List */}
            <div className="flex-1 flex flex-col gap-6">
              {Object.keys(groupedByCategory).map((category) => (
                <div
                  key={category}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <h2 className="font-core text-xl font-bold mb-4 border-b-2 pb-2 text-gray-800">
                    {category}
                  </h2>
                  {groupedByCategory[category].map((product: any) => (
                    <div
                      key={product.id}
                      className="flex flex-wrap md:flex-nowrap items-center justify-between py-4 border-b last:border-none"
                    >
                      {/* Left Section - Image & Details */}
                      <div className="flex items-center w-full md:w-auto mb-3 md:mb-0">
                        <Checkbox
                          checked={selectedItemsByCategory[category]?.includes(
                            product.id
                          )}
                          onChange={(e) =>
                            handleCheckboxChange(
                              category,
                              product.id,
                              e.target.checked
                            )
                          }
                          className="mr-3"
                        />
                        <img
                          src={`${apiUrl}/uploads/images/${product.menu_img}`}
                          alt={product.item_name}
                          className="w-20 h-20 rounded-full shadow-md"
                        />
                        <div className="ml-5 flex-1">
                          <h3 className="font-core text-md font-semibold text-gray-800">
                            {product.item_name}{" "}
                            <span className="font-core text-red-500 whitespace-nowrap">
                              ({product.quantity} quantity)
                            </span>
                          </h3>

                          {/* Sizes always visible */}
                          <p className="font-core text-gray-500 text-sm">
                            Sizes: {product.size || "(Normal size)"}
                          </p>
                        </div>
                      </div>

                      {/* Right Section - Price & Actions */}
                      <div className="flex flex-col items-end space-y-2 w-full md:w-auto">
                        <p className="font-core text-lg font-bold text-red-600">
                          ₱{product.price * product.quantity}
                        </p>
                        <div className="flex space-x-3">
                          <button
                            onClick={() =>
                              decrementCartItem(product.id, product.item_name)
                            }
                            className="font-core px-2 py-1 border rounded text-gray-500 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="font-core text-gray-700">
                            {product.quantity}
                          </span>
                          <button
                            onClick={() =>
                              incrementCartItem(product.id, product.item_name)
                            }
                            className="font-core px-2 py-1 border rounded text-gray-500 hover:bg-gray-100"
                          >
                            +
                          </button>
                          <button
                            disabled={deletingId === product.item_name}
                            onClick={async () => {
                              setDeletingId(product.item_name);
                              await deleteCartItem(product);
                              setDeletingId(null);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            {deletingId === product.item_name ? (
                              <Spin size="small" />
                            ) : (
                              <FaTrashAlt />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Final Total Section */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg h-fit sticky top-4 flex flex-col gap-4 w-full lg:w-80">
              <p className="font-core text-xl font-bold flex items-center gap-2">
                Total:
                <Spin spinning={loading} size="small">
                  <span
                    className={`text-red-500 ml-1 ${
                      loading ? "invisible" : "visible"
                    }`}
                  >
                    ₱{finalTotal}
                  </span>
                </Spin>
              </p>
              <button
                onClick={handleCheckout}
                className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold shadow"
              >
                Checkout ({selectedItemCount})
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="font-core text-center text-gray-500">
            No items in cart
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onContinue={handleContinue}
      />

      <OrderDetailsModal
        visible={isOrderModalVisible}
        checkoutItems={checkoutItems}
        finalTotal={localFinalTotal} // use local total instead of live cart total
        onCancel={handleOrderModalClose}
      />

      {/* Billing Details Modal */}
      <BillingDetailsModal
        isVisible={isBillingModalVisible}
        onClose={() => setBillingModalVisible(false)}
        onContinue={fetchBillingData}
      />
    </div>
  );
};

export default Cart;
