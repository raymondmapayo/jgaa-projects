import { motion } from "framer-motion";
import React from "react";
import { FaBoxOpen, FaUsers } from "react-icons/fa";

const Fact: React.FC = () => {
  const facts = [
    {
      id: 1,
      icon: <FaUsers color="#ffa62b" />,
      title: "Satisfied Customers",
      value: "1963",
    },
    {
      id: 2,
      icon: <FaBoxOpen color="#ffa62b" />,
      title: "Available Products",
      value: "789",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="w-full bg-gray-100 py-12 px-6 sm:px-10 md:px-16 rounded-lg shadow-md"
      style={{ transform: "translateY(90px)" }}
      initial="hidden"
      whileInView="visible"
      variants={containerVariants}
      viewport={{ once: false, amount: 0.2 }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          className="flex justify-center gap-8 sm:gap-10 md:gap-12"
          variants={containerVariants}
        >
          {facts.map((fact) => (
            <motion.div
              key={fact.id}
              className="flex-1 min-w-[220px] max-w-[280px] sm:min-w-[240px] sm:max-w-[320px] md:min-w-[260px] md:max-w-[360px] flex justify-center"
              variants={itemVariants}
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
            >
              <div className="bg-white rounded-lg flex flex-col items-center p-6 sm:p-8 text-center shadow-lg w-full">
                <motion.div
                  className="text-[#ffa62b] text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                >
                  {fact.icon}
                </motion.div>
                <h4 className="font-bold text-lg sm:text-xl md:text-2xl text-gray-800 mb-2">
                  {fact.title}
                </h4>
                <h1 className="text-[#ffa62b] font-extrabold text-3xl sm:text-4xl md:text-5xl">
                  {fact.value}
                </h1>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Fact;
