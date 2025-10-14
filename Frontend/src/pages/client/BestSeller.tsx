import { Modal } from "antd";
import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaShoppingBag } from "react-icons/fa";
import { CustomRate } from "../../components/client/Rate";
import { addToCart } from "../../zustand/store/store.provider"; // Importing addToCart from zustand store
import ProductInfo from "./ProductInfo";
// Define interface for bestselling product
interface BestsellerProduct {
  bestseller_id?: number; // Optional in case it's not returned
  item_name: string;
  menu_img: string;
  price: number;
  total_avg_rating: string;
  rating_count: number;
  categories_name?: string | null;
}
interface MenuItem {
  id: number;
  item_name: string;
  menu_img: string;
  description: string;
  price: number;
  categories_name: string;
  quantity: number;
  size: string; // Optional size property
}

const Bestseller: React.FC = () => {
  const [bestselling, setBestselling] = useState<BestsellerProduct[]>([]); // Use interface
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null); // Selected item for the modal
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const apiUrl = import.meta.env.VITE_API_URL;
  // Show the modal when a menu item is clicked
  const handleViewMenuClick = (product: BestsellerProduct) => {
    const menuItem: MenuItem = {
      id: 1, // Example ID, replace it with the actual ID logic
      item_name: product.item_name,
      menu_img: product.menu_img,
      description: "This is a description", // Replace with actual description
      price: product.price,
      categories_name: product.categories_name || "",
      quantity: 1, // Set quantity as needed
      size: "Normal size", // Replace with actual size
    };
    setSelectedItem(menuItem);
    setModalVisible(true); // Open modal
  };
  // Close the modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null); // Clear the selected item when modal is closed
  };

  useEffect(() => {
    const storedData = sessionStorage.getItem("bestsellingData");

    if (storedData) {
      setBestselling(JSON.parse(storedData));
    } else {
      axios
        .get<BestsellerProduct[]>(`${apiUrl}/bestselling`)
        .then((response) => {
          console.log("API Response:", response.data);
          setBestselling(response.data);
          sessionStorage.setItem(
            "bestsellingData",
            JSON.stringify(response.data)
          );
        })
        .catch((error) => {
          console.error("Error fetching bestseller data:", error);
          if (error.response) {
            console.error("Response error:", error.response.data);
            console.error("Response status:", error.response.status);
            console.error("Response headers:", error.response.headers);
          } else if (error.request) {
            console.error("Request error:", error.request);
          } else {
            console.error("General error:", error.message);
          }
        });
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.5,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        className="text-center mx-auto mb-12 max-w-3xl"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="font-core text-4xl font-bold text-gray-800">
          Bestseller Products
        </h1>
        <p className="font-core text-gray-600 mt-4">
          Our Most Popular Products Based On Customer Ratings.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        viewport={{ once: false, amount: 0.2 }}
      >
        {bestselling.length > 0 ? (
          bestselling.map((product) => (
            <motion.div
              key={product.item_name + product.menu_img}
              className="bg-[#f4f6f8] cursor-pointer border border-gray-200 rounded-lg shadow-lg overflow-hidden relative p-6 text-center sm:flex sm:flex-row sm:items-center"
              variants={cardVariants}
            >
              <div className="relative w-32 h-32 mx-auto mt-4">
                <img
                  src={`${apiUrl}/uploads/images/${product.menu_img}`}
                  alt={product.item_name}
                  className="h-32 w-32 object-cover rounded-full border-4 border-orange-500 shadow-lg"
                />
              </div>

              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <h5 className="font-core text-lg font-semibold text-gray-800">
                  {product.item_name}
                </h5>

                <div className="flex justify-center sm:justify-start mt-2 text-yellow-500">
                  <CustomRate value={parseFloat(product.total_avg_rating)} />
                </div>

                <div className="font-core text-gray-600 mt-2">
                  <p>
                    {product.rating_count > 0
                      ? `${product.rating_count} reviews`
                      : "No reviews yet"}
                  </p>
                </div>

                <h4 className="font-core text-xl font-bold text-gray-800 mt-2">
                  ₱{product.price}
                </h4>

                {/* Buttons Section with Flexbox Layout */}
                <div className="mt-4 flex justify-between gap-4">
                  {/* View Menu Button */}
                  <motion.button
                    className="font-core flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-orange-500 rounded-full text-orange-500 hover:bg-orange-500 hover:text-white transition text-sm font-semibold whitespace-nowrap"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleViewMenuClick(product)} // Pass the product directly
                  >
                    View Menu
                  </motion.button>

                  {/* Add to Cart Button */}
                  <motion.button
                    className="font-core flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-orange-500 rounded-full text-orange-500 hover:bg-orange-500 hover:text-white transition text-sm font-semibold whitespace-nowrap"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      addToCart({
                        ...product,
                        categories_name: product.categories_name || null,
                      })
                    }
                  >
                    <FaShoppingBag /> {/* FaShoppingBag Icon */}
                    Add to cart
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center py-12">
            <p className="font-core text-gray-500 text-base sm:text-lg md:text-xl font-medium text-center">
              No bestseller products available at the moment.
            </p>
          </div>
        )}
        {/* Modal for Product Info */}
        <Modal
          open={modalVisible} // Modal visibility controlled by the state
          onCancel={closeModal} // Close modal on cancel button click
          footer={null} // No footer
          bodyStyle={{ padding: "20px" }} // Padding for body content
          width={800} // Set the modal width
        >
          {selectedItem && (
            <ProductInfo item={selectedItem} /> // Pass the selected item as a prop to ProductInfo
          )}
        </Modal>
      </motion.div>
    </div>
  );
};

export default Bestseller;
