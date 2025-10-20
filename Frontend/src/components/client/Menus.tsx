import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../GlobalFonts.css"; // Import custom CSS for animations
// Define the Category type
interface Category {
  categories_id: number;
  categories_name: string;
  categories_img: string;
  description: string;
  status: string;
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

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

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
      className="container mx-auto py-7 p-4"
      initial="hidden"
      whileInView="visible"
      variants={containerVariants}
      viewport={{ once: false, amount: 0.2 }}
    >
      {/* Section Title */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: false, amount: 0.2 }}
      >
        <h1 className=" font-core  text-3xl font-bold text-gray-800">Menus</h1>
        <p className="text-gray-500 font-core ">Choose The Foods You Want</p>
      </motion.div>

      {/* Responsive Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8"
        variants={containerVariants}
        viewport={{ once: false, amount: 0.2 }}
      >
        {menuItems.slice(0, 6).map((category) => (
          <motion.div
            key={category.categories_id}
            className="flex justify-center"
            variants={cardVariants}
            transition={{ duration: 0.5 }}
            viewport={{ once: false, amount: 0.2 }}
          >
            {/* Bigger Responsive Card */}
            <div
              className="menu-card bg-[#f4f6f8] border border-gray-300 rounded-lg shadow-md 
          p-6 sm:p-7 flex flex-col items-center text-center w-full max-w-sm sm:max-w-md lg:max-w-lg"
            >
              {/* Image */}
              <div className="flex justify-center mb-5">
                <motion.img
                  src={`${apiUrl}/uploads/images/${category.categories_img}`}
                  alt={category.categories_name}
                  className=" h-32 w-32 sm:h-36 sm:w-36 object-cover rounded-full border-4 border-orange-500 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  viewport={{ once: false, amount: 0.2 }}
                />
              </div>

              {/* Title & Description */}
              <div className="mt-4 flex-grow">
                <h5 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  <a
                    href="#"
                    className="hover:text-orange-600 transition-colors font-core"
                  >
                    {category.categories_name}
                  </a>
                </h5>
                <p className="text-sm sm:text-base text-gray-600 mt-3 text-justify">
                  {category.description}
                </p>
              </div>

              {/* Button */}
              <Link
                to={`/Menus/${category.categories_name}`}
                className="font-core mt-6 w-full px-5 py-2 text-sm sm:text-base font-semibold text-orange-500 border border-orange-500 rounded-full hover:bg-orange-500 hover:text-white transition-colors"
              >
                View Menu
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default Menus;
