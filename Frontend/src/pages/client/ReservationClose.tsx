import { motion } from "framer-motion";
import { WarningOutlined } from "@ant-design/icons";

const ReservationClose = () => {
  return (
    <motion.div
      className="flex flex-col lg:flex-row items-center justify-center min-h-[100vh] bg-gradient-to-b from-[#fff3e0] to-[#ffe0b2] px-4 lg:px-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Left Side - Warning Icon */}
      <motion.div
        className="w-full lg:w-[38%] flex justify-center lg:justify-end mb-10 lg:mb-0 translate-x-[-7rem]" // moved icon more left
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="flex justify-center items-center text-orange-500 drop-shadow-lg"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [1, 0.9, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
        >
          <WarningOutlined className="text-[11rem] md:text-[13rem]" />
        </motion.div>
      </motion.div>

      {/* Right Side - Text (Centered) */}
      <motion.div
        className="w-full lg:w-[45%] flex flex-col justify-center items-center text-center translate-x-[-3rem]"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.h1
          className="font-core text-5xl md:text-6xl font-extrabold text-orange-600 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Sawasdee! 😊
        </motion.h1>

        <motion.div
          className="font-core text-xl md:text-2xl text-gray-700 leading-relaxed tracking-wide space-y-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <p>Our online reservation is currently closed temporarily.</p>
          <p>
            Please wait until{" "}
            <span className="text-orange-600 font-semibold text-2xl">
              8:00 AM
            </span>{" "}
            to reserve again.
          </p>
          <p>Thank you for your patience!</p>
        </motion.div>

        <motion.div
          className="mt-8 text-base md:text-lg text-gray-500 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          — We appreciate your understanding —
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ReservationClose;
