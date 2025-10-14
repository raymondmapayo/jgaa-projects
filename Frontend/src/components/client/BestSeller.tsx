import { Modal } from "antd";
import axios from "axios";
import { motion } from "framer-motion"; // Import motion for animation
import { useEffect, useState } from "react";
import { FaShoppingBag } from "react-icons/fa";
import ProductInfo from "../../pages/client/ProductInfo";
import { addToCart } from "../../zustand/store/store.provider"; // Importing addToCart from zustand store
import { CustomRate } from "./Rate"; // Assuming this is the custom rate component

// Define the interface for bestselling product
interface BestsellerProduct {
  item_name: string;
  menu_img: string;
  price: number;
  total_avg_rating: string; // Backend might return this as a string
  rating_count: number;
  categories_name?: string | null; // Optional in case it's null
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
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null); // Selected item for the modal
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [bestselling, setBestselling] = useState<BestsellerProduct[]>([]); // Use the interface here
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

  // Fetch the data from the backend
  useEffect(() => {
    axios
      .get<BestsellerProduct[]>(`${apiUrl}/bestselling`) // Strongly typed response
      .then((response) => {
        // Sort products by ratings in descending order and limit to 6 items
        const sortedProducts = response.data
          .sort(
            (a, b) =>
              parseFloat(b.total_avg_rating) - parseFloat(a.total_avg_rating)
          )
          .slice(0, 6);
        setBestselling(sortedProducts); // Set the sorted and limited data to the state
      })
      .catch((error) => {
        console.error("Error fetching bestseller data:", error);
      });
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
      {/* Only render if bestselling has products */}
      {bestselling.length > 0 && (
        <>
          {/* Section Heading */}
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
              Explore our most popular products based on customer ratings.
            </p>
          </motion.div>

          {/* Grid Layout for Bestseller Products */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
          >
            {bestselling.map((product) => (
              <motion.div
                key={product.item_name + product.menu_img}
                className="bg-[#fff7ec] cursor-pointer border border-gray-200 rounded-lg shadow-lg overflow-hidden relative p-6 text-center sm:flex sm:flex-row sm:items-center"
                variants={cardVariants}
              >
                {/* Product Image */}
                <div className="relative w-32 h-32 mx-auto mt-4">
                  <img
                    src={`${apiUrl}/uploads/images/${product.menu_img}`}
                    alt={product.item_name}
                    className="h-32 w-32 object-cover rounded-full border-4 border-orange-500 shadow-lg"
                  />
                </div>

                {/* Product Details */}
                <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                  <h5 className="font-core text-lg font-semibold text-gray-800">
                    {product.item_name}
                  </h5>

                  {/* Display Rating */}
                  <div className="flex justify-center sm:justify-start mt-2 text-yellow-500">
                    <CustomRate value={parseFloat(product.total_avg_rating)} />
                  </div>

                  {/* Rating and Review Count */}
                  <div className="font-core text-gray-600 mt-2">
                    <p>
                      {product.rating_count > 0
                        ? `${product.rating_count} reviews`
                        : "No reviews yet"}
                    </p>
                  </div>

                  <h4 className="text-xl font-bold text-gray-800 mt-2">
                    ₱{product.price}
                  </h4>

                  {/* Buttons Section */}
                  <div className="mt-4 flex justify-between gap-4">
                    <motion.button
                      className="font-core flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-orange-500 rounded-full text-orange-500 hover:bg-orange-500 hover:text-white transition text-sm font-semibold whitespace-nowrap"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleViewMenuClick(product)}
                    >
                      View Menu
                    </motion.button>

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
                      <FaShoppingBag /> Add to cart
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Modal */}
            <Modal
              open={modalVisible}
              onCancel={closeModal}
              footer={null}
              bodyStyle={{ padding: "20px" }}
              width={800}
            >
              {selectedItem && <ProductInfo item={selectedItem} />}
            </Modal>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Bestseller;
