import { Tooltip } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import FoodRate from "./FoodRate"; // Import the FoodRate component

// Define the types for the order and product data
interface Product {
  menu_img: string;
  item_name: string;
  price: number;
  order_quantity: number;
  final_total: number;
  categories_name: string;
  order_item_id: number; // Assuming order_item_id is available here
}

interface Order {
  order_status: string;
  order_details: string;
  products: Product[];

  payment_status?: string; // Added payment_status
  payment_method?: string; // Added payment_method
}

const MyPurchase = () => {
  const [ordersData, setOrdersData] = useState<Order[]>([]);
  const [ratingValue, setRatingValue] = useState<number>(0); // Rating value state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // Selected product state
  const [ratedItems, setRatedItems] = useState<
    Array<{ item_name: string; user_id: string }>
  >([]); // Store both item_name and user_id
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const userId = sessionStorage.getItem("user_id");

    if (userId) {
      fetch(`${apiUrl}/fetch_my_purchase/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          setOrdersData(data);
        })
        .catch((error) => {
          console.error("Error fetching purchase data:", error);
        });
    }
  }, []);

  useEffect(() => {
    const userId = sessionStorage.getItem("user_id");

    if (userId) {
      // Fetch rated products (those with rated = 1) for the specific user
      axios
        .get(`${apiUrl}/fetchrated/${userId}`) // Pass user_id as part of the URL
        .then((response) => {
          const ratedProducts = response.data;
          setRatedItems(ratedProducts); // Update the rated items state
        })
        .catch((error) => {
          console.error("Error fetching rated products:", error);
        });
    }
  }, []); // This will run once on component mount

  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All"];

  // Group products by categories_name
  const groupByCategory = (ordersData: Order[]) => {
    return ordersData.map((order) => {
      const groupedProducts = order.products.reduce((acc, product) => {
        const category = product.categories_name;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(product);
        return acc;
      }, {} as { [key: string]: Product[] });

      return {
        ...order,
        groupedProducts,
      };
    });
  };

  const groupedOrdersData = groupByCategory(ordersData);

  // Handle the modal when user clicks 'Rate' button
  const showModal = (product: Product) => {
    const userId = sessionStorage.getItem("user_id"); // Get the logged-in user's ID from sessionStorage

    // Check if the product has already been rated by the current user (both item_name and user_id)
    const isRated = ratedItems.some(
      (ratedProduct) =>
        ratedProduct.item_name === product.item_name &&
        ratedProduct.user_id === userId // Ensure that the user_id is also checked
    );

    if (isRated) {
      Swal.fire({
        title: "You have already rated this product!  ",
        text: "You can only rate a product once.",
        icon: "info",
        confirmButtonText: "Close",
      });
    } else {
      setSelectedProduct(product); // Show the modal for rating if the product is not rated
    }
  };

  // Handle rate change
  const handleRateChange = (value: number) => {
    setRatingValue(value);
  };

  // Handle rating submission
  const handleSubmitRating = () => {
    if (selectedProduct) {
      const userId = sessionStorage.getItem("user_id"); // Get user_id from sessionStorage or other authentication method
      const data = {
        user_id: userId, // Add user_id here
        order_item_id: selectedProduct.order_item_id,
        item_name: selectedProduct.item_name,
        item_names: selectedProduct.item_name, // Use 'item_names' here
        menu_img: selectedProduct.menu_img,
        price: selectedProduct.price,
        rating: ratingValue,
        order_quantity: selectedProduct.order_quantity, // Ensure this field is correctly set
        categories_name: selectedProduct.categories_name || "Uncategorized", // Use a default value if categories_name is not available
      };

      // Step 1: Submit data to the 'bestseller' table
      axios
        .post(`${apiUrl}/bestseller`, data)
        .then(() => {
          // After successfully submitting to 'bestseller', proceed to submit to 'selling' table
          axios
            .post(`${apiUrl}/bestselling`, data) // Submit to 'selling' table
            .then((response) => {
              // After successfully updating 'selling', proceed to add to 'topselling'
              axios
                .post(`${apiUrl}/topselling`, data) // Submit to 'topselling' table
                .then(() => {
                  // Display SweetAlert for successful submission
                  Swal.fire({
                    title: "Thank you for rating this product!",
                    text: `Your rating has been successfully submitted. Average Rating: ${response.data.avg_rating} stars. The product has also been added to the top-selling list.`,
                    icon: "success",
                    confirmButtonText: "Close",
                  });
                  setSelectedProduct(null); // Close the modal

                  // Fetch rated products after submission by user_id
                  if (userId) {
                    axios
                      .get(`${apiUrl}/fetchrated/${userId}`)
                      .then((response) => {
                        const ratedProducts = response.data;
                        setRatedItems(ratedProducts); // Update the rated items state
                      })
                      .catch((error) => {
                        console.error("Error fetching rated products:", error);
                      });
                  }
                })
                .catch((error) => {
                  Swal.fire({
                    title: "Error",
                    text: "There was an issue adding the product to the topselling list.",
                    icon: "error",
                    confirmButtonText: "Close",
                  });
                  console.error("Error inserting into topselling_tbl:", error);
                });
            })
            .catch((error) => {
              Swal.fire({
                title: "Error",
                text: "There was an issue submitting the rating to the selling table. Please try again.",
                icon: "error",
                confirmButtonText: "Close",
              });
              console.error("Error inserting into selling_tbl:", error);
            });
        })
        .catch((error) => {
          Swal.fire({
            title: "Error",
            text: "There was an issue submitting your rating to the bestseller table. Please try again.",
            icon: "error",
            confirmButtonText: "Close",
          });
          console.error("Error inserting into bestseller_tbl:", error);
        });
    }
  };

  return (
    <div className="p-6 container mx-auto min-h-screen">
      {/* Tabs */}
      <div className="font-core flex space-x-6 border-b-2 pb-3 bg-orange-300 shadow-md rounded-lg px-4 py-3 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`pb-2 px-5 text-md font-semibold transition-all duration-300 ${
              activeTab === tab
                ? "border-b-4 border-white text-white"
                : "text-gray-100 hover:text-red-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative my-6">
        <input
          type="text"
          placeholder="Search...."
          className="font-core w-full p-3 pl-12 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-red-400 transition"
        />
        <FaSearch className="absolute left-4 top-3 text-gray-400 text-lg" />
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-6">
        {ordersData.length === 0 ? (
          <div className="font-core bg-white p-6 rounded-lg shadow-lg text-center text-gray-500">
            <p>No purchases yet.</p>
          </div>
        ) : (
          groupedOrdersData.map((order, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg shadow-lg transition transform flex flex-col"
            >
              {Object.keys(order.groupedProducts).map((category, idx) => (
                <div key={idx} className="mb-6 flex flex-col">
                  {/* Category Header */}
                  <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="font-core font-semibold text-lg flex items-center gap-2">
                      Category:{" "}
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {category}
                      </span>
                    </h2>
                  </div>

                  {/* Products in this category */}
                  <div className="flex flex-col">
                    {order.groupedProducts[category].map((product, idx) => (
                      <div
                        key={idx}
                        className="font-core flex items-center py-4 border-b flex-wrap"
                      >
                        <img
                          src={`${apiUrl}/uploads/images/${product.menu_img}`}
                          alt={product.item_name}
                          className="w-20 h-20 rounded-full shadow-md"
                        />

                        {/* Product Details */}
                        <div className="ml-5 flex-1 flex flex-col">
                          <h3 className="text-md font-semibold text-gray-800">
                            {product.item_name}{" "}
                            <span className="text-gray-500 text-sm">
                              ({product.order_quantity} pcs)
                            </span>
                          </h3>
                          <p className="font-core text-gray-500 text-sm hidden md:block">
                            Category: {product.categories_name}
                          </p>
                          <p className="font-core text-gray-500 text-sm hidden md:block">
                            x{product.order_quantity}
                          </p>
                        </div>

                        {/* Price */}
                        <p className="font-core text-lg font-bold text-red-600 mr-4">
                          ₱{product.price}
                        </p>

                        {/* Rating Button */}
                        {order.payment_status?.toLowerCase() === "paid" ? (
                          <button
                            onClick={() => showModal(product)}
                            className="font-core px-5 py-2 transition text-red-500"
                          >
                            Rate
                          </button>
                        ) : (
                          <Tooltip title="Pending">
                            <span className="font-core px-5 py-2 text-gray-400 cursor-not-allowed">
                              Rate
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Order Details */}
              <div className="flex justify-between items-center pt-4">
                <div className="font-core text-sm text-green-500 font-semibold">
                  {order.order_details}
                </div>
                <span className="font-core text-red-500 font-bold text-sm">
                  {order.order_status.toUpperCase()}...
                </span>
              </div>

              {/* Total with payment status on the right */}
              <div className="flex items-center mt-4 gap-2 flex-wrap">
                <p className="font-core text-xl font-bold text-red-500 flex items-center gap-2">
                  Total:
                  <span>
                    ₱
                    {order.groupedProducts
                      ? Object.values(order.groupedProducts)
                          .flat()
                          .reduce((sum, item) => sum + item.final_total, 0)
                      : 0}
                  </span>
                  {order.payment_status && (
                    <>
                      <span className="text-gray-400 text-sm">|</span>{" "}
                      {/* Vertical line */}
                      <span className="flex items-center text-sm gap-1">
                        <span
                          className={`font-core font-semibold px-1 py-0.5 rounded-md ${
                            order.payment_status.toLowerCase() === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {order.payment_status}
                        </span>
                        <span className="text-black">
                          ({order.payment_method || "Unknown"})
                        </span>
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FoodRate Modal */}
      <FoodRate
        visible={!!selectedProduct}
        selectedProduct={selectedProduct}
        ratingValue={ratingValue}
        onRateChange={handleRateChange}
        onCancel={() => setSelectedProduct(null)}
        onSubmit={handleSubmitRating}
        rated={ratedItems.some(
          (ratedProduct) =>
            ratedProduct.item_name === selectedProduct?.item_name
        )} // Check if rated
      />
    </div>
  );
};

export default MyPurchase;
