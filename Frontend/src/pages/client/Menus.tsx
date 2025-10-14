import axios from "axios";
import { motion } from "framer-motion"; // Import motion for animation
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Define the Category type
interface Category {
  categories_id: number;
  categories_name: string;
  categories_img: string;
  description: string;
  status: string; // Assuming "empty" means no items in the category
  menu_id: number;
}

const Menus = () => {
  // Explicitly define the type as Category[]
  const [menuItems, setMenuItems] = useState<Category[]>([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    axios
      .get(`${apiUrl}/get_categories`)
      .then((response) => {
        setMenuItems(response.data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  // Function to check if a category has items
  const hasItems = (status: string) => {
    return status !== "empty"; // If the status is not "empty", then the category has items
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <motion.section
      className="container mx-auto py-16"
      initial="hidden"
      whileInView="visible"
      variants={containerVariants}
      viewport={{ once: false, amount: 0.2 }}
    >
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: false, amount: 0.2 }}
      >
        <h1 className="font-core text-3xl font-bold text-gray-800">Menus</h1>
        <p className="font-core text-gray-500">Choose the Food You Want</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {menuItems.map((category) => (
          <motion.div
            key={category.categories_id}
            className="bg-white border border-gray-200 shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-shadow flex flex-col items-center  h-full w-full"
            variants={cardVariants} // Apply animation to each card
            transition={{ duration: 0.5 }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
          >
            <div className="flex justify-center mb-4">
              <motion.img
                src={`${apiUrl}/uploads/images/${category.categories_img}`}
                alt={category.categories_name}
                className="h-32 w-32 object-cover rounded-full border-4 border-orange-500 shadow-lg"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
                viewport={{ once: false, amount: 0.2 }}
              />
            </div>
            <div className="mt-4 flex-grow">
              <h5 className="text-xl font-semibold text-gray-800">
                <a
                  href="#"
                  className="hover:text-orange-600 transition-colors font-core"
                >
                  {category.categories_name}
                </a>
              </h5>
              <p className=" text-sm sm:text-base text-gray-600 mt-3 text-justify">
                {category.description}
              </p>
            </div>

            {/* Conditional rendering based on category status */}
            <div className="flex justify-center">
              {hasItems(category.status) ? (
                <Link
                  to={`/Menus/${category.categories_name}`}
                  className="font-core mt-6 w-full px-4 py-2 text-sm font-semibold text-orange-500 border border-orange-500 rounded-full hover:bg-orange-500 hover:text-white transition-colors"
                >
                  View Menu
                </Link>
              ) : (
                <p className="font-core text-red-500 mt-4">
                  No items yet in this category
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default Menus;
